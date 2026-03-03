"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { fetchIsRegistrationClosedCached } from "@/lib/api";

type Fixture = {
  matchId: string;
  stage: string;
  group: string;
  team1: string;
  team2: string;
  status: string;
  matchDate: string;
  venue: string;
  matchTime: string;
  winner: string;
};

type FixturesApiResponse = {
  success: boolean;
  message?: string;
  timestamp?: string;
  data?: {
    fixtures?: Fixture[];
    metadata?: unknown;
  };
};

type FixturesTab = { key: string; label: string; fixtures: Fixture[] };

const fixtures_api_url = "/api/fixtures";

type DateInfo = { key: string; sortKey: string; label: string };

const month_by_key: Record<string, number> = {
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  sept: 9,
  oct: 10,
  nov: 11,
  dec: 12,
};

function pad_2(value: number): string {
  return String(value).padStart(2, "0");
}

function format_day_month_label(date_key: string, has_year_in_label: boolean): string {
  const date = new Date(`${date_key}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return date_key;

  return new Intl.DateTimeFormat("en-IN", has_year_in_label ? { day: "2-digit", month: "short", year: "numeric" } : { day: "2-digit", month: "short" }).format(
    date
  );
}

function to_date_info(match_date: string): DateInfo | null {
  const raw = (match_date ?? "").trim();
  if (!raw) return null;

  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) {
    const key = `${iso[1]}-${iso[2]}-${iso[3]}`;
    return { key, sortKey: key, label: format_day_month_label(key, true) };
  }

  const dmy = raw.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2}|\d{4})$/);
  if (dmy) {
    const day = Number(dmy[1]);
    const month = Number(dmy[2]);
    const year = dmy[3].length === 2 ? 2000 + Number(dmy[3]) : Number(dmy[3]);
    const key = `${year}-${pad_2(month)}-${pad_2(day)}`;
    return { key, sortKey: key, label: format_day_month_label(key, true) };
  }

  const ordinal_day_first = raw.match(/^(\d{1,2})(?:st|nd|rd|th)?\s+([a-zA-Z]+)(?:\s+(\d{4}))?$/i);
  if (ordinal_day_first) {
    const day = Number(ordinal_day_first[1]);
    const month_key = ordinal_day_first[2].toLowerCase();
    const month = month_by_key[month_key.slice(0, 3)] ?? month_by_key[month_key] ?? null;
    if (!month) return { key: `unknown:${raw}`, sortKey: `9999-99-99:${raw}`, label: raw };

    const year = ordinal_day_first[3] ? Number(ordinal_day_first[3]) : new Date().getFullYear();
    const key = `${year}-${pad_2(month)}-${pad_2(day)}`;
    const has_year_in_label = Boolean(ordinal_day_first[3]);
    return { key, sortKey: key, label: format_day_month_label(key, has_year_in_label) };
  }

  const ordinal_month_first = raw.match(/^([a-zA-Z]+)\s+(\d{1,2})(?:st|nd|rd|th)?(?:\s+(\d{4}))?$/i);
  if (ordinal_month_first) {
    const month_key = ordinal_month_first[1].toLowerCase();
    const month = month_by_key[month_key.slice(0, 3)] ?? month_by_key[month_key] ?? null;
    if (!month) return { key: `unknown:${raw}`, sortKey: `9999-99-99:${raw}`, label: raw };

    const day = Number(ordinal_month_first[2]);
    const year = ordinal_month_first[3] ? Number(ordinal_month_first[3]) : new Date().getFullYear();
    const key = `${year}-${pad_2(month)}-${pad_2(day)}`;
    const has_year_in_label = Boolean(ordinal_month_first[3]);
    return { key, sortKey: key, label: format_day_month_label(key, has_year_in_label) };
  }

  return { key: `unknown:${raw}`, sortKey: `9999-99-99:${raw}`, label: raw };
}

function build_tabs_from_fixtures(fixtures: Fixture[]): FixturesTab[] {
  const by_date = new Map<string, { sortKey: string; label: string; fixtures: Fixture[] }>();

  for (const fixture of fixtures) {
    const date_info = to_date_info(fixture.matchDate);
    if (!date_info) continue;

    const prev = by_date.get(date_info.key);
    if (!prev)
      by_date.set(date_info.key, { sortKey: date_info.sortKey, label: date_info.label, fixtures: [fixture] });
    else prev.fixtures.push(fixture);
  }

  const entries: Array<[string, { sortKey: string; label: string; fixtures: Fixture[] }]> = [];
  by_date.forEach((value, date_key) => entries.push([date_key, value]));

  return entries
    .sort(([, a], [, b]) => a.sortKey.localeCompare(b.sortKey))
    .map(([date_key, value]) => ({
      key: date_key,
      label: value.label,
      fixtures: value.fixtures,
    }));
}

async function fetch_fixtures(): Promise<Fixture[]> {
  const response = await fetch(fixtures_api_url, { method: "GET" });
  if (!response.ok) throw new Error(`Failed to fetch fixtures (${response.status})`);

  const body = (await response.json()) as FixturesApiResponse;
  if (!body?.success) throw new Error(body?.message ?? "Failed to fetch fixtures");

  const fixtures = body?.data?.fixtures;
  if (!Array.isArray(fixtures)) return [];
  return fixtures;
}

function FixtureCard({ fixture }: { fixture: Fixture }) {
  return (
    <motion.div
      className="glass rounded-2xl p-6 glass-hover"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-slate-600">
          <span className="text-slate-500">Venue:</span>{" "}
          <span className="text-slate-900 font-semibold">{fixture.venue || "TBD"}</span>
        </div>
        <div className="text-xs px-3 py-1 rounded-full bg-white/70 border border-border text-slate-700">
          {fixture.stage}
          {fixture.group ? ` • Group ${fixture.group}` : ""}
        </div>
      </div>

      <div className="mt-5 text-lg font-semibold text-slate-900 tracking-tight">
        <span>{fixture.team1}</span>
        <span className="mx-2 text-slate-500 font-normal">vs</span>
        <span>{fixture.team2}</span>
      </div>

      <div className="mt-5 space-y-1 text-sm text-slate-600">
        <div>
          <span className="text-slate-500">Time:</span> 5:30 - 7:30 PM
        </div>
        <div>
          <span className="text-slate-500">Status:</span> {fixture.status || "TBD"}
          {fixture.winner ? (
            <>
              {" "}
              <span className="text-slate-500">• Winner:</span> {fixture.winner}
            </>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}

export default function FixturesPage() {
  const [isRegistrationClosed, setIsRegistrationClosed] = useState<boolean | null>(null);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const active_tab_storage_key = "cbl:fixtures:active_tab";

  useEffect(() => {
    let is_active = true;

    (async () => {
      try {
        const closed = await fetchIsRegistrationClosedCached();
        if (!is_active) return;
        setIsRegistrationClosed(closed);
      } catch (err) {
        if (!is_active) return;
        setIsRegistrationClosed(false);
      } finally {
        if (!is_active) return;
        // fixtures fetch is handled in the next effect
      }
    })();

    return () => {
      is_active = false;
    };
  }, []);

  useEffect(() => {
    if (isRegistrationClosed !== true) {
      if (isRegistrationClosed === false) {
        setIsLoading(false);
        setErrorMessage(null);
        setFixtures([]);
      }
      return;
    }

    let is_active = true;
    (async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        const next_fixtures = await fetch_fixtures();
        if (!is_active) return;
        setFixtures(next_fixtures);
      } catch (err) {
        if (!is_active) return;
        const message = err instanceof Error ? err.message : "Failed to fetch fixtures";
        setErrorMessage(message);
        setFixtures([]);
      } finally {
        if (!is_active) return;
        setIsLoading(false);
      }
    })();

    return () => {
      is_active = false;
    };
  }, [isRegistrationClosed]);

  const tabs = useMemo(() => build_tabs_from_fixtures(fixtures), [fixtures]);
  const [activeTab, setActiveTab] = useState<string>(() => {
    try {
      return typeof window === "undefined" ? "" : window.localStorage.getItem(active_tab_storage_key) ?? "";
    } catch {
      return "";
    }
  });

  useEffect(() => {
    if (!activeTab) return;
    try {
      window.localStorage.setItem(active_tab_storage_key, activeTab);
    } catch {
      // ignore storage errors (private mode, blocked, etc.)
    }
  }, [activeTab]);

  useEffect(() => {
    if (tabs.length === 0) return;
    if (activeTab && tabs.some((t) => t.key === activeTab)) return;
    if (!activeTab) {
      if (isLoading) return;
      setActiveTab(tabs[0].key);
      return;
    }

    if (isLoading) return;
    setActiveTab(tabs[0].key);
  }, [activeTab, isLoading, tabs]);

  const active = useMemo(() => {
    if (tabs.length === 0) return null;
    return tabs.find((t) => t.key === activeTab) ?? tabs[0];
  }, [activeTab, tabs]);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background text-foreground">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-semibold neon-text tracking-tight">
              Match Fixtures
            </h1>
            <p className="text-slate-600 mt-3 max-w-2xl mx-auto">
            Marked on the Calendar, Ready for the Court!
            </p>
          </div>

          {isRegistrationClosed === false ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="glass rounded-xl p-8 max-w-xl text-center">
                <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">Fixtures not available yet</h2>
                <p className="text-slate-600 mt-3">
                  Match fixtures will be visible once registration is closed.
                </p>
              </div>
            </div>
          ) : null}

          {isRegistrationClosed === null ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-neon-blue mb-4" />
              <p className="text-gray-400">Checking registration status...</p>
            </div>
          ) : null}

          {isRegistrationClosed !== true ? null : (
            <>
              {tabs.length > 0 ? (
                <div className="mb-8 overflow-x-auto">
                  <div className="inline-flex gap-2 rounded-2xl border border-border bg-white/70 p-2 backdrop-blur-md min-w-full">
                    {tabs.map((tab) => {
                      const isActive = tab.key === activeTab;
                      return (
                        <button
                          key={tab.key}
                          type="button"
                          onClick={() => setActiveTab(tab.key)}
                          className={[
                            "px-4 py-2 rounded-xl text-sm whitespace-nowrap transition-colors",
                            isActive
                              ? "bg-neon-blue text-white"
                              : "text-slate-700 hover:bg-slate-900/5 hover:text-slate-900",
                          ].join(" ")}
                        >
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              <AnimatePresence mode="wait">
                <motion.div
                  key={active?.key ?? "empty"}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                      <Loader2 className="w-12 h-12 animate-spin text-neon-blue mb-4" />
                      <p className="text-gray-400">Loading Fixtures...</p>
                    </div>
                  ) : errorMessage ? (
                    <div className="text-center text-red-600 py-12">{errorMessage}</div>
                  ) : !active || active.fixtures.length === 0 ? (
                    <div className="text-center text-slate-600 py-12">No fixtures available.</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {active.fixtures.map((fixture) => (
                        <FixtureCard key={fixture.matchId} fixture={fixture} />
                      ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}

