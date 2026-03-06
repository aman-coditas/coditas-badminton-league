"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import TeamCard from "@/components/TeamCard";
import { fetchIndividuals, fetchTeams, type IndividualPlayer, type Team } from "@/lib/api";
import { Loader2, AlertCircle, ChevronUp, ChevronDown, Search } from "lucide-react";

type SortColumn = "name" | "gender" | null;
type SortDirection = "asc" | "desc";

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

  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else {
        // Reset to default (no sorting)
        setSortColumn(null);
        setSortDirection("asc");
      }
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const filteredAndSortedIndividuals = useMemo(() => {
    let result = individuals;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((p) => p.name?.toLowerCase().includes(query));
    }

    // Sort if column selected
    if (sortColumn) {
      result = [...result].sort((a, b) => {
        let aVal = "";
        let bVal = "";

        if (sortColumn === "name") {
          aVal = a.name?.toLowerCase() || "";
          bVal = b.name?.toLowerCase() || "";
        } else if (sortColumn === "gender") {
          aVal = a.gender?.toLowerCase() || "";
          bVal = b.gender?.toLowerCase() || "";
        }

        if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
        if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [individuals, sortColumn, sortDirection, searchQuery]);

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
          <h1 className="text-4xl md:text-5xl pb-2 font-bold neon-text mb-4">
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

            <div className="mb-4 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-white/70 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-neon-blue/50 focus:border-neon-blue transition-colors"
                />
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-xl overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-white/50">
                      <th className="py-4 px-4 text-left font-semibold text-slate-700">#</th>
                      <th
                        className="py-4 px-4 text-left font-semibold text-slate-700 cursor-pointer hover:text-neon-blue transition-colors select-none"
                        onClick={() => handleSort("name")}
                      >
                        <span className="inline-flex items-center gap-1">
                          Name
                          {sortColumn === "name" ? (
                            sortDirection === "asc" ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )
                          ) : (
                            <span className="w-4 h-4 opacity-30 inline-flex flex-col">
                              <ChevronUp className="w-4 h-2 -mb-1" />
                              <ChevronDown className="w-4 h-2" />
                            </span>
                          )}
                        </span>
                      </th>
                      <th className="py-4 px-4 text-left font-semibold text-slate-700">Email</th>
                      <th className="py-4 px-4 text-left font-semibold text-slate-700">Contact</th>
                      <th
                        className="py-4 px-4 text-left font-semibold text-slate-700 cursor-pointer hover:text-neon-blue transition-colors select-none"
                        onClick={() => handleSort("gender")}
                      >
                        <span className="inline-flex items-center gap-1">
                          Gender
                          {sortColumn === "gender" ? (
                            sortDirection === "asc" ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )
                          ) : (
                            <span className="w-4 h-4 opacity-30 inline-flex flex-col">
                              <ChevronUp className="w-4 h-2 -mb-1" />
                              <ChevronDown className="w-4 h-2" />
                            </span>
                          )}
                        </span>
                      </th>
                      <th className="py-4 px-4 text-left font-semibold text-slate-700">Jersey Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedIndividuals.map((p, index) => (
                      <tr
                        key={`${p.email}-${index}`}
                        className="border-b border-border/60 hover:bg-white/40 transition-colors"
                      >
                        <td className="py-3 px-4 text-slate-500">{index + 1}</td>
                        <td className="py-3 px-4 font-medium text-slate-900">{p.name}</td>
                        <td className="py-3 px-4 text-slate-700">{p.email}</td>
                        <td className="py-3 px-4 text-slate-700">{p.contactNumber || "-"}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                            p.gender === "Male"
                              ? "bg-blue-100 text-blue-700"
                              : p.gender === "Female"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-gray-100 text-gray-700"
                          }`}>
                            {p.gender}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-700">{p.jerseyName || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  );
}
