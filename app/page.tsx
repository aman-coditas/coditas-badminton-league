"use client";

import type { ComponentType, ReactNode } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
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

function ShuttleSvg({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 56 76" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
      {/* Feather skirt ring */}
      <ellipse cx="28" cy="16" rx="22" ry="8" stroke={color} strokeWidth="1.5" strokeOpacity="0.85" />
      {/* Feather lines from skirt to cork */}
      <line x1="6"  y1="16" x2="28" y2="64" stroke={color} strokeWidth="1" strokeOpacity="0.55" />
      <line x1="11" y1="9"  x2="28" y2="64" stroke={color} strokeWidth="1" strokeOpacity="0.55" />
      <line x1="19" y1="8"  x2="28" y2="64" stroke={color} strokeWidth="1" strokeOpacity="0.55" />
      <line x1="28" y1="8"  x2="28" y2="64" stroke={color} strokeWidth="1" strokeOpacity="0.55" />
      <line x1="37" y1="8"  x2="28" y2="64" stroke={color} strokeWidth="1" strokeOpacity="0.55" />
      <line x1="45" y1="9"  x2="28" y2="64" stroke={color} strokeWidth="1" strokeOpacity="0.55" />
      <line x1="50" y1="16" x2="28" y2="64" stroke={color} strokeWidth="1" strokeOpacity="0.55" />
      {/* Cork base */}
      <circle cx="28" cy="67" r="5" fill={color} fillOpacity="0.85" />
      <ellipse cx="28" cy="69.5" rx="5" ry="2.5" fill={color} fillOpacity="0.5" />
    </svg>
  );
}

const SHUTTLES = [
  { top: "2%",  left: "4%",  size: 56, rotate: -15, delay: 0,   duration: 8,  color: "#9900E6", opacity: 0.13 },
  { top: "6%",  left: "87%", size: 72, rotate: 30,  delay: 1.2, duration: 10, color: "#11CAE6", opacity: 0.11 },
  { top: "52%", left: "1%",  size: 46, rotate: -45, delay: 2.5, duration: 9,  color: "#5B0FFE", opacity: 0.10 },
  { top: "63%", left: "89%", size: 62, rotate: 20,  delay: 0.8, duration: 11, color: "#9900E6", opacity: 0.09 },
  { top: "80%", left: "43%", size: 50, rotate: -30, delay: 3.5, duration: 7,  color: "#11CAE6", opacity: 0.09 },
  { top: "36%", left: "93%", size: 40, rotate: 55,  delay: 1.8, duration: 12, color: "#5B0FFE", opacity: 0.08 },
  { top: "15%", left: "45%", size: 48, rotate: 12,  delay: 0.5, duration: 9,  color: "#9900E6", opacity: 0.10 },
  { top: "28%", left: "12%", size: 54, rotate: -25, delay: 2.0, duration: 11, color: "#11CAE6", opacity: 0.09 },
  { top: "45%", left: "75%", size: 44, rotate: 40,  delay: 1.5, duration: 8,  color: "#5B0FFE", opacity: 0.11 },
  { top: "72%", left: "18%", size: 58, rotate: -10, delay: 3.0, duration: 10, color: "#9900E6", opacity: 0.10 },
  { top: "88%", left: "72%", size: 52, rotate: 25,  delay: 0.3, duration: 9,  color: "#11CAE6", opacity: 0.08 },
  { top: "38%", left: "55%", size: 42, rotate: -35, delay: 2.8, duration: 12, color: "#5B0FFE", opacity: 0.09 },
];

function RacketSvg({ color, clipId }: { color: string; clipId: string }) {
  return (
    <svg viewBox="0 0 50 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
      <defs>
        <clipPath id={clipId}>
          <ellipse cx="25" cy="38" rx="18" ry="26" />
        </clipPath>
      </defs>
      {/* Handle */}
      <rect x="21.5" y="90" width="7" height="26" rx="3.5" fill={color} fillOpacity="0.75" />
      {/* Grip wrap detail */}
      <line x1="21.5" y1="97"  x2="28.5" y2="97"  stroke={color} strokeWidth="1" strokeOpacity="0.4" />
      <line x1="21.5" y1="103" x2="28.5" y2="103" stroke={color} strokeWidth="1" strokeOpacity="0.4" />
      <line x1="21.5" y1="109" x2="28.5" y2="109" stroke={color} strokeWidth="1" strokeOpacity="0.4" />
      {/* Shaft */}
      <line x1="25" y1="64" x2="25" y2="90" stroke={color} strokeWidth="2.5" strokeOpacity="0.7" strokeLinecap="round" />
      {/* Head frame */}
      <ellipse cx="25" cy="38" rx="20" ry="28" stroke={color} strokeWidth="2" strokeOpacity="0.85" />
      {/* Strings (clipped to head oval) */}
      <g clipPath={`url(#${clipId})`} stroke={color} strokeWidth="0.75" strokeOpacity="0.45">
        {/* Horizontal strings */}
        <line x1="5" y1="18" x2="45" y2="18" />
        <line x1="5" y1="25" x2="45" y2="25" />
        <line x1="5" y1="32" x2="45" y2="32" />
        <line x1="5" y1="38" x2="45" y2="38" />
        <line x1="5" y1="45" x2="45" y2="45" />
        <line x1="5" y1="52" x2="45" y2="52" />
        <line x1="5" y1="58" x2="45" y2="58" />
        {/* Vertical strings */}
        <line x1="12" y1="10" x2="12" y2="66" />
        <line x1="18" y1="10" x2="18" y2="66" />
        <line x1="25" y1="10" x2="25" y2="66" />
        <line x1="32" y1="10" x2="32" y2="66" />
        <line x1="38" y1="10" x2="38" y2="66" />
      </g>
    </svg>
  );
}

const RACKETS = [
  { top: "22%", left: "3%",  size: 52, rotate: 28,  delay: 0.6, duration: 9,  color: "#11CAE6", opacity: 0.11 },
  { top: "68%", left: "5%",  size: 58, rotate: -22, delay: 2.3, duration: 11, color: "#5B0FFE", opacity: 0.10 },
  { top: "12%", left: "79%", size: 46, rotate: 42,  delay: 1.4, duration: 8,  color: "#9900E6", opacity: 0.11 },
  { top: "82%", left: "78%", size: 50, rotate: -18, delay: 3.1, duration: 10, color: "#11CAE6", opacity: 0.10 },
  { top: "5%",  left: "25%", size: 44, rotate: 15,  delay: 0.9, duration: 10, color: "#5B0FFE", opacity: 0.09 },
  { top: "32%", left: "88%", size: 54, rotate: -35, delay: 1.8, duration: 9,  color: "#9900E6", opacity: 0.10 },
  { top: "55%", left: "42%", size: 48, rotate: 50,  delay: 2.6, duration: 11, color: "#11CAE6", opacity: 0.08 },
  { top: "75%", left: "28%", size: 56, rotate: -8,  delay: 0.4, duration: 8,  color: "#5B0FFE", opacity: 0.11 },
  { top: "48%", left: "8%",  size: 42, rotate: 32,  delay: 3.4, duration: 12, color: "#9900E6", opacity: 0.09 },
  { top: "90%", left: "55%", size: 50, rotate: -28, delay: 1.1, duration: 10, color: "#11CAE6", opacity: 0.10 },
];

export default function OverviewPage() {

  return (
    <div className="container mx-auto px-4 py-6 md:py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative"
      >
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          {SHUTTLES.map((s, i) => (
            <motion.div
              key={`shuttle-${i}`}
              className="absolute"
              style={{ top: s.top, left: s.left, width: s.size, opacity: s.opacity }}
              initial={{ rotate: s.rotate }}
              animate={{ y: [0, -22, 0], rotate: [s.rotate, s.rotate + 10, s.rotate] }}
              transition={{ duration: s.duration, repeat: Infinity, ease: "easeInOut", delay: s.delay }}
            >
              <ShuttleSvg color={s.color} />
            </motion.div>
          ))}
          {RACKETS.map((r, i) => (
            <motion.div
              key={`racket-${i}`}
              className="absolute"
              style={{ top: r.top, left: r.left, width: r.size, opacity: r.opacity }}
              initial={{ rotate: r.rotate }}
              animate={{ y: [0, -18, 0], rotate: [r.rotate, r.rotate + 10, r.rotate] }}
              transition={{ duration: r.duration, repeat: Infinity, ease: "easeInOut", delay: r.delay }}
            >
              <RacketSvg color={r.color} clipId={`racket-clip-${i}`} />
            </motion.div>
          ))}
        </div>

        <div className="text-center space-y-6 mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="flex justify-center"
          >
            <Image
              src="/assets/cbl-symbol.png"
              alt="CBL Tournament Symbol"
              width={160}
              height={200}
              className="h-32 md:h-40 w-auto object-contain"
              priority
            />
          </motion.div>
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
            <h2 className="text-3xl font-bold mb-2 neon-text tracking-tight">
              Official Rule Book
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Coditas Badminton League (CBL) – Official Rule Book.
            </p>

            <div className="mt-6 space-y-6">
              <section className="space-y-2">
                <h3 className="text-lg font-semibold text-brand-violet">Tournament Timeline</h3>
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
                <h3 className="text-lg font-semibold text-brand-violet">Schedule &amp; Availability</h3>
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
                <h3 className="text-lg font-semibold text-brand-violet">Team Structure &amp; Composition</h3>
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
                <h3 className="text-lg font-semibold text-brand-violet">Match Format &amp; Categories</h3>
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
                <h3 className="text-lg font-semibold text-brand-violet">Tournament Stages &amp; Progression</h3>
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
                <h3 className="text-lg font-semibold text-brand-violet">Scoring &amp; Tie-Breakers</h3>
                <p className="text-sm text-slate-700">
                  Standard BWF scoring applies. For group standings, if two teams have equal points, the tie-breaker is <span className="font-semibold">Point Difference</span>:
                </p>
                <div className="rounded-lg border border-border bg-white/70 p-4 text-sm text-slate-700">
                  Point Difference = Total Points Scored − Total Points Conceded
                </div>
              </section>

              <section className="space-y-2">
                <h3 className="text-lg font-semibold text-brand-violet">Attendance &amp; Rescheduling</h3>
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
                <h3 className="text-lg font-semibold text-brand-violet">General Rules &amp; Conduct</h3>
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
                <h3 className="text-lg font-semibold text-brand-violet">Fees &amp; Venue</h3>
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
