"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { fetchIsRegistrationClosedCached } from "@/lib/api";

type Standing = {
  teamName: string;
  group: string;
  matchesPlayed: number;
  wins: number;
  losses: number;
  rubbersWon: number;
  rubbersLost: number;
  rubberDiff: number;
  points: number;
  rank: number;
};

type StandingsApiResponse = {
  success: boolean;
  message?: string;
  timestamp?: string;
  data?: {
    standings?: Standing[];
    metadata?: unknown;
  };
};

const standings_api_url = "/api/standings";

async function fetch_standings(): Promise<Standing[]> {
  const response = await fetch(standings_api_url, { method: "GET" });
  if (!response.ok) throw new Error(`Failed to fetch standings (${response.status})`);

  const body = (await response.json()) as StandingsApiResponse;
  if (!body?.success) throw new Error(body?.message ?? "Failed to fetch standings");

  const standings = body?.data?.standings;
  if (!Array.isArray(standings)) return [];
  return standings;
}

export default function StandingsPage() {
  const [isRegistrationClosed, setIsRegistrationClosed] = useState<boolean | null>(null);
  const [standings, setStandings] = useState<Standing[]>([]);
  const [state, setState] = useState<"loading" | "loaded" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      }
    })();

    return () => {
      is_active = false;
    };
  }, []);

  useEffect(() => {
    if (isRegistrationClosed !== true) {
      if (isRegistrationClosed === false) {
        setState("loaded");
        setErrorMessage(null);
        setStandings([]);
      }
      return;
    }

    let is_active = true;
    (async () => {
      try {
        setState("loading");
        setErrorMessage(null);
        const rows = await fetch_standings();
        if (!is_active) return;
        setStandings(rows);
        setState("loaded");
      } catch (err) {
        if (!is_active) return;
        const message = err instanceof Error ? err.message : "Failed to fetch standings";
        setErrorMessage(message);
        setStandings([]);
        setState("error");
      }
    })();

    return () => {
      is_active = false;
    };
  }, [isRegistrationClosed]);

  const standingsByGroup = useMemo(() => {
    const by_group: Record<string, Standing[]> = {};
    for (const row of standings) {
      const group = row.group || "—";
      if (!by_group[group]) by_group[group] = [];
      by_group[group].push(row);
    }

    Object.keys(by_group).forEach((group) => {
      by_group[group].sort((a, b) => (a.rank ?? 9999) - (b.rank ?? 9999));
    });

    return Object.entries(by_group).sort(([a], [b]) => a.localeCompare(b));
  }, [standings]);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background pl-6 pr-6 text-foreground">
      <div className="container mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-semibold neon-text tracking-tight">Standings</h1>
            <p className="text-slate-600 mt-3 max-w-2xl mx-auto">Points table grouped by group and sorted by rank.</p>
          </div>

          {isRegistrationClosed === null ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-neon-blue mb-4" />
              <p className="text-gray-400">Checking registration status...</p>
            </div>
          ) : isRegistrationClosed === false ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="glass rounded-xl p-8 max-w-xl text-center">
                <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">Standings not available yet</h2>
                <p className="text-slate-600 mt-3">
                  Standings will be visible once registration is closed.
                </p>
              </div>
            </div>
          ) : state === "loading" ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-neon-blue mb-4" />
              <p className="text-gray-400">Loading Standings...</p>
            </div>
          ) : state === "error" ? (
            <div className="text-center text-red-600 py-12">{errorMessage}</div>
          ) : standings.length === 0 ? (
            <div className="text-center text-slate-600 py-12">No standings available.</div>
          ) : (
            <div className="space-y-8">
              {standingsByGroup.map(([group, rows]) => (
                <div key={group} className="glass rounded-2xl p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-slate-900 tracking-tight">Group {group}</h2>
                  </div>

                  <div className="mt-5 overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left text-slate-600 border-b border-border">
                          <th className="py-3 pr-4">Rank</th>
                          <th className="py-3 pr-4">Team</th>
                          <th className="py-3 pr-4">MP</th>
                          <th className="py-3 pr-4">W</th>
                          <th className="py-3 pr-4">L</th>
                          <th className="py-3 pr-4">RW</th>
                          <th className="py-3 pr-4">RL</th>
                          <th className="py-3 pr-4">Diff</th>
                          <th className="py-3 pr-0">Pts</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((r) => (
                          <tr key={`${r.group}-${r.teamName}`} className="border-b border-border/60 last:border-b-0">
                            <td className="py-3 pr-4 font-semibold text-slate-900">{r.rank}</td>
                            <td className="py-3 pr-4 text-slate-900">{r.teamName}</td>
                            <td className="py-3 pr-4 text-slate-700">{r.matchesPlayed}</td>
                            <td className="py-3 pr-4 text-slate-700">{r.wins}</td>
                            <td className="py-3 pr-4 text-slate-700">{r.losses}</td>
                            <td className="py-3 pr-4 text-slate-700">{r.rubbersWon}</td>
                            <td className="py-3 pr-4 text-slate-700">{r.rubbersLost}</td>
                            <td className="py-3 pr-4 text-slate-700">{r.rubberDiff}</td>
                            <td className="py-3 pr-0 font-semibold text-slate-900">{r.points}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

