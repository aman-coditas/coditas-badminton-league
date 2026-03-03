"use client";

import { useCallback, useEffect, useState } from "react";

export const dynamic = 'force-dynamic';
import { motion } from "framer-motion";
import TeamCard from "@/components/TeamCard";
import { fetchIndividuals, fetchTeams, type IndividualPlayer, type Team } from "@/lib/api";
import { Loader2, AlertCircle, Mail, User } from "lucide-react";

export default function TeamsPage() {
  const [activeTab, setActiveTab] = useState<"teams" | "individuals">("teams");
  const [teams, setTeams] = useState<Team[]>([]);
  const [individuals, setIndividuals] = useState<IndividualPlayer[]>([]);

  const [teamsLoading, setTeamsLoading] = useState(true);
  const [teamsError, setTeamsError] = useState<string | null>(null);
  const [hasLoadedTeams, setHasLoadedTeams] = useState(false);

  const [individualsLoading, setIndividualsLoading] = useState(false);
  const [individualsError, setIndividualsError] = useState<string | null>(null);
  const [hasLoadedIndividuals, setHasLoadedIndividuals] = useState(false);

  const loadTeams = useCallback(async () => {
    try {
      setTeamsLoading(true);
      setTeamsError(null);
      const data = await fetchTeams();
      setTeams(data);
      setHasLoadedTeams(true);
    } catch (err) {
      setTeamsError(err instanceof Error ? err.message : "Failed to load teams");
    } finally {
      setTeamsLoading(false);
    }
  }, []);

  const loadIndividuals = useCallback(async () => {
    try {
      setIndividualsLoading(true);
      setIndividualsError(null);
      const data = await fetchIndividuals();
      setIndividuals(data);
      setHasLoadedIndividuals(true);
    } catch (err) {
      setIndividualsError(err instanceof Error ? err.message : "Failed to load individual players");
    } finally {
      setIndividualsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab !== "teams") return;
    if (hasLoadedTeams) return;
    loadTeams();
  }, [activeTab, hasLoadedTeams, loadTeams]);

  useEffect(() => {
    if (activeTab !== "individuals") return;
    if (hasLoadedIndividuals) return;
    loadIndividuals();
  }, [activeTab, hasLoadedIndividuals, loadIndividuals]);

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold neon-text mb-4">
            Registrations
          </h1>
          <p className="text-gray-400">
            View registered teams and individual players
          </p>
        </div>

        <div className="mb-8 overflow-x-auto">
          <div className="flex justify-center">
            <div className="inline-flex gap-2 rounded-2xl border border-border bg-white/70 p-2 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setActiveTab("teams")}
              className={[
                "px-4 py-2 rounded-xl text-sm whitespace-nowrap transition-colors",
                activeTab === "teams"
                  ? "bg-neon-blue text-white"
                  : "text-slate-700 hover:bg-slate-900/5 hover:text-slate-900",
              ].join(" ")}
            >
              Registered Teams
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("individuals")}
              className={[
                "px-4 py-2 rounded-xl text-sm whitespace-nowrap transition-colors",
                activeTab === "individuals"
                  ? "bg-neon-blue text-white"
                  : "text-slate-700 hover:bg-slate-900/5 hover:text-slate-900",
              ].join(" ")}
            >
              Individual Players
            </button>
          </div>
          </div>
        </div>

        {activeTab === "teams" ? (
          teamsLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-neon-blue mb-4" />
              <p className="text-gray-400">Loading teams...</p>
            </div>
          ) : teamsError ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="glass rounded-xl p-8 max-w-md text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-500 mb-4">{teamsError}</p>
                <button onClick={loadTeams} className="text-neon-blue hover:underline">
                  Try again
                </button>
              </div>
            </div>
          ) : teams.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="glass rounded-xl p-8 max-w-md text-center">
                <p className="text-gray-400 mb-4">No team registered yet.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="glass inline-block rounded-full px-6 py-3">
                  <span className="text-gray-400 ml-2">Total Teams Registered: &nbsp;</span>
                  <span className="text-neon-blue font-bold text-lg">{teams.length}</span>
                </div>
              </div>

              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.1,
                    },
                  },
                }}
              >
                {teams.map((team, index) => (
                  <motion.div
                    key={team.teamName}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <TeamCard team={team} />
                  </motion.div>
                ))}
              </motion.div>
            </>
          )
        ) : individualsLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-neon-blue mb-4" />
            <p className="text-gray-400">Loading registered players...</p>
          </div>
        ) : individualsError ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="glass rounded-xl p-8 max-w-md text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-500 mb-4">{individualsError}</p>
              <button onClick={loadIndividuals} className="text-neon-blue hover:underline">
                Try again
              </button>
            </div>
          </div>
        ) : individuals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="glass rounded-xl p-8 max-w-md text-center">
              <p className="text-gray-400 mb-4">No players registered yet.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="glass inline-block rounded-full px-6 py-3">
                <span className="text-gray-400 ml-2">Total Players: &nbsp;</span>
                <span className="text-neon-blue font-bold text-lg">{individuals.length}</span>
              </div>
            </div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
            >
              {individuals.map((p, index) => (
                <motion.div
                  key={`${p.email}-${index}`}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="glass rounded-xl overflow-hidden glass-hover">
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-2">
                        <User className="w-6 h-6 text-neon-blue" />
                        <h3 className="text-xl font-bold">{p.name}</h3>
                      </div>

                      <div className="mt-4 space-y-3">
                        <div className="flex items-start gap-2">
                          <Mail className="w-4 h-4 text-gray-400 mt-1" />
                          <div>
                            <p className="text-xs text-gray-400">Email</p>
                            <p className="text-sm text-slate-900">
                              {p.email}
                              {p.contactNumber ? (
                                <>
                                  {" "}
                                  <span className="text-slate-400">•</span> {p.contactNumber}
                                </>
                              ) : null}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-lg border border-border bg-white/70 p-3">
                            <p className="text-xs text-gray-400">Gender</p>
                            <p className="text-sm font-semibold text-slate-900">{p.gender}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  );
}
