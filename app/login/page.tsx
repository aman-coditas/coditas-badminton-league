"use client";

import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogIn, AlertCircle } from "lucide-react";
import { Suspense, useEffect } from "react";

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get("error");

  useEffect(() => {
    // Check if already logged in
    const isLoggedIn = document.cookie.includes("cbl_logged_in=true");
    if (isLoggedIn) {
      router.replace("/");
    }
  }, [router]);

  const handleLogin = () => {
    window.location.href = "/api/auth/login";
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="glass rounded-2xl p-8 text-center">
          <div className="flex justify-center mb-6">
            <Image
              src="/assets/cbl-symbol.png"
              alt="CBL Logo"
              width={100}
              height={120}
              className="h-24 w-auto object-contain"
            />
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Welcome to CBL
          </h1>
          <p className="text-slate-600 mb-8">
            Sign in with your Coditas account to continue
          </p>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{decodeURIComponent(error)}</p>
            </div>
          )}

          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-brand-violet text-white font-medium rounded-lg hover:bg-brand-violet/90 transition-colors"
          >
            <LogIn className="w-5 h-5" />
            Login with Coditas
          </button>

          <p className="mt-6 text-xs text-slate-500">
            By signing in, you agree to participate in the Coditas Badminton League
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
