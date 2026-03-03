"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import { fetchIsRegistrationClosedCached } from "@/lib/api";

export default function Navbar() {
  const pathname = usePathname();
  const registration_closed_storage_key = "cbl:isRegistrationClosed";
  const [isRegistrationClosed, setIsRegistrationClosed] = useState<boolean | null>(null);

  useEffect(() => {
    let is_active = true;
    (async () => {
      // Read cached value only after hydration (avoids SSR/CSR mismatch).
      try {
        const cached = window.localStorage.getItem(registration_closed_storage_key);
        if (cached === "true") setIsRegistrationClosed(true);
        if (cached === "false") setIsRegistrationClosed(false);
      } catch {
        // ignore storage errors
      }

      const value = await fetchIsRegistrationClosedCached();
      if (!is_active) return;
      setIsRegistrationClosed(value);
      try {
        window.localStorage.setItem(registration_closed_storage_key, String(value));
      } catch {
        // ignore storage errors
      }
    })();

    return () => {
      is_active = false;
    };
  }, []);

  const navItems = useMemo(() => {
    // Keep DOM structure stable to prevent hydration errors.
    const can_show_registration = isRegistrationClosed === false;
    const can_show_fixtures = isRegistrationClosed === true;

    return [
      { name: "Overview", path: "/", isVisible: true },
      { name: "Registrations", path: "/registration", isVisible: can_show_registration },
      { name: "Registered Teams", path: "/teams", isVisible: true },
      { name: "Match Fixtures", path: "/fixtures", isVisible: can_show_fixtures },
      { name: "Standings", path: "/standings", isVisible: can_show_fixtures },
    ];
  }, [isRegistrationClosed]);

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container flex justify-center mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex gap-1 md:gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={cn("relative", item.isVisible ? "" : "hidden")}
                >
                  <div
                    className={cn(
                      "px-3 md:px-4 py-2 text-sm md:text-base rounded-md transition-colors",
                      isActive
                        ? "text-neon-blue"
                        : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    {item.name}
                  </div>
                  
                  {isActive && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-blue"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
