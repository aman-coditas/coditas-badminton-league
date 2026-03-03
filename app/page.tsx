"use client";

import type { ComponentType, ReactNode } from "react";
import { motion } from "framer-motion";
export const dynamic = 'force-dynamic';
import { AlertCircle, Calendar, Check, Clock, MapPin, Target, Users } from "lucide-react";

function IconBulletList({
  icon: Icon,
  items,
}: {
  icon: ComponentType<{ className?: string }>;
  items: ReactNode[];
}) {
  return (
    <ul className="mt-2 space-y-2">
      {items.map((item, idx) => (
        <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
          <Icon className="w-4 h-4 text-neon-blue mt-0.5 shrink-0" />
          <span className="leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function OverviewPage() {

  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative"
      >
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <motion.svg
            className="absolute right-0 top-0 w-96 h-96 opacity-10"
            viewBox="0 0 200 200"
            animate={{
              rotate: [0, 360],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3581B8" />
                <stop offset="100%" stopColor="#A1CDF4" />
              </linearGradient>
            </defs>
          </motion.svg>
        </div>

        <div className="text-center space-y-6 mb-16">
          <motion.h1
            className="text-5xl md:text-7xl font-bold neon-text"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Coditas Badminton League
          </motion.h1>
          
          <motion.p
            className="text-lg md:text-xl text-slate-700 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            A high-energy badminton league at Coditas. Register as a full team or as an individual, then compete in a best-of-3 tie format across Singles and Mixed Doubles.
          </motion.p>
        </div>

        <motion.div
          className="mt-10 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          <div className="glass rounded-xl p-8 max-w-5xl mx-auto text-left">
            <h2 className="text-3xl font-bold mb-2 text-neon-blue tracking-tight">
              Official Rule Book
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Coditas Badminton League (CBL) – Official Rule Book.
            </p>

            <div className="mt-6 space-y-6">
              <section className="space-y-2">
                <h3 className="text-lg font-semibold text-neon-blue">Tournament Timeline</h3>
                <IconBulletList
                  icon={Calendar}
                  items={[
                    <>
                      <span className="font-semibold">Start Date:</span> 6 April 2026
                    </>,
                    <>
                      <span className="font-semibold">Grand Finale:</span> 20 April 2026
                    </>,
                    <>Dates are subject to change only in unavoidable circumstances and will be communicated via the portal.</>,
                  ]}
                />
              </section>

              <section className="space-y-2">
                <h3 className="text-lg font-semibold text-neon-blue">Schedule &amp; Availability</h3>
                <IconBulletList
                  icon={Clock}
                  items={[
                    <>
                      <span className="font-semibold">Timing:</span> Matches every weekday from 6:00 PM to 8:00 PM
                    </>,
                    <>Specific match slots will be shared on the portal once all 32 teams have registered.</>,
                    <>Participants are expected to plan work/meetings to be available for scheduled slots.</>,
                  ]}
                />
              </section>

              <section className="space-y-2">
                <h3 className="text-lg font-semibold text-neon-blue">Team Structure &amp; Composition</h3>
                <IconBulletList
                  icon={Users}
                  items={[
                    <>
                      <span className="font-semibold">Total Players:</span> 4 players per team
                    </>,
                    <>
                      <span className="font-semibold">Gender Ratio:</span> 2 male players and 2 female players
                    </>,
                    <>No substitutions are allowed once a match starts. In case of injury, the specific category match will be forfeited.</>,
                  ]}
                />
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-semibold text-neon-blue">Match Format &amp; Categories</h3>
                <p className="text-sm text-slate-700">
                  Each tie is Best of 3 categories. A team must win at least 2 out of 3 to win the tie.
                </p>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm border border-border bg-white/70 rounded-lg">
                    <thead>
                      <tr className="text-left text-slate-700 border-b border-border">
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Format</th>
                        <th className="py-3 px-4">Players Involved</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-800">
                      <tr className="border-b border-border/60">
                        <td className="py-3 px-4 font-semibold">Men’s Singles</td>
                        <td className="py-3 px-4">1 vs 1</td>
                        <td className="py-3 px-4">1 male player</td>
                      </tr>
                      <tr className="border-b border-border/60">
                        <td className="py-3 px-4 font-semibold">Women’s Singles</td>
                        <td className="py-3 px-4">1 vs 1</td>
                        <td className="py-3 px-4">1 female player</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-semibold">Mixed Doubles</td>
                        <td className="py-3 px-4">2 vs 2</td>
                        <td className="py-3 px-4">1 male &amp; 1 female player</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-slate-700">
                  Players can participate in multiple categories (e.g., Singles + Mixed Doubles). All 3 categories apply at every stage.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-lg font-semibold text-neon-blue">Tournament Stages &amp; Progression</h3>
                <IconBulletList
                  icon={Target}
                  items={[
                    <>
                      <span className="font-semibold">Group Stage:</span> 32 teams will be divided into 8 groups of 4 teams each. Each team plays a round-robin. Top team qualifies.
                    </>,
                    <>
                      <span className="font-semibold">Super Eight:</span> Knockout round for qualifying group leaders. Top 4 winners qualify.
                    </>,
                    <>
                      <span className="font-semibold">Semi-Finals:</span> Knockout matches to determine the finalists.
                    </>,
                    <>
                      <span className="font-semibold">Grand Finale:</span> The ultimate showdown for the CBL trophy.
                    </>,
                  ]}
                />
              </section>

              <section className="space-y-2">
                <h3 className="text-lg font-semibold text-neon-blue">Scoring &amp; Tie-Breakers</h3>
                <p className="text-sm text-slate-700">
                  Standard BWF scoring applies. For group standings, if two teams have equal points, the tie-breaker is <span className="font-semibold">Point Difference</span>:
                </p>
                <div className="rounded-lg border border-border bg-white/70 p-4 text-sm text-slate-700">
                  Point Difference = Total Points Scored − Total Points Conceded
                </div>
              </section>

              <section className="space-y-2">
                <h3 className="text-lg font-semibold text-neon-blue">Attendance &amp; Rescheduling</h3>
                <IconBulletList
                  icon={AlertCircle}
                  items={[
                    <>
                      <span className="font-semibold">Walkovers:</span> If a team is unavailable for a scheduled match for any reason, the opposing team is automatically awarded the points.
                    </>,
                    <>
                      <span className="font-semibold">Rescheduling:</span> Requests must be submitted to the organizers. The CBL Committee holds final authority to grant or deny.
                    </>,
                  ]}
                />
              </section>

              <section className="space-y-2">
                <h3 className="text-lg font-semibold text-neon-blue">General Rules &amp; Conduct</h3>
                <IconBulletList
                  icon={Check}
                  items={[
                    <>All matches follow standard BWF regulations regarding service, boundaries, and faults.</>,
                    <>
                      <span className="font-semibold">Equipment:</span> Players should bring their own rackets. Standard tournament-grade shuttles will be provided.
                    </>,
                    <>
                      <span className="font-semibold">Shoes:</span> Proper non-marking badminton shoes required. If unavailable, the player must play barefoot.
                    </>,
                    <>Umpire/referee decision is final and binding. Unsportsmanlike conduct may lead to immediate disqualification.</>,
                  ]}
                />
              </section>

              <section className="space-y-2">
                <h3 className="text-lg font-semibold text-neon-blue">Fees &amp; Venue</h3>
                <IconBulletList
                  icon={MapPin}
                  items={[
                    <>
                      <span className="font-semibold">Venue:</span> LSBI Badminton Arena
                    </>,
                    <>
                      <span className="font-semibold">Fees:</span> ₹2000 for team registration and ₹500 for individual registration
                    </>,
                  ]}
                />
              </section>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
