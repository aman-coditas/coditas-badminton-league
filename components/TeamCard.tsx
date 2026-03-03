"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Mail } from "lucide-react";
import { Team } from "@/lib/api";

interface TeamCardProps {
  team: Team;
}

export default function TeamCard({ team }: TeamCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      layout
      className="glass rounded-xl overflow-hidden glass-hover cursor-pointer"
      onClick={() => setIsExpanded(!isExpanded)}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="p-6">
        <div className="flex items-center gap-3 mb-2">
          <Users className="w-6 h-6 text-neon-blue" />
          <h3 className="text-xl font-bold">{team.teamName}</h3>
        </div>
        
        <p className="text-sm text-gray-400 mb-4">
          {isExpanded ? "Click to collapse" : "Click to view details"}
        </p>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 pt-4 border-t border-white/10"
            >
              <div>
                <h4 className="text-sm font-semibold text-neon-blue mb-2">
                  Players
                </h4>
                <div className="space-y-2 ml-4">
                  {(team.players ?? []).map((player, idx) => (
                    <div key={`${player.email}-${idx}`} className="flex items-start gap-2">
                      <Mail className="w-4 h-4 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm font-medium">{player.name}</p>
                        <p className="text-xs text-gray-400">
                          {player.email}
                          {player.contactNumber ? (
                            <>
                              {" "}
                              <span className="text-slate-400">•</span> {player.contactNumber}
                            </>
                          ) : null}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
