"use client";

import { cn } from "@/lib/utils";

export default function CblGuidelines({ className }: { className?: string }) {
  return (
    <aside className={cn("glass rounded-xl p-6 md:p-8", className)}>
      <h2 className="text-2xl font-bold mb-4 text-neon-blue">Guidelines</h2>

      <div className="space-y-5 text-sm text-slate-700 leading-relaxed max-h-[70vh] overflow-auto pr-2">
        <p className="font-semibold text-slate-900">Please read the guidelines carefully before signing up.</p>

        <section className="space-y-2">
          <h3 className="font-semibold text-slate-900">1️⃣ Registration Options</h3>
          <p>You can register in either of the following ways:</p>

          <div className="space-y-1">
            <p className="font-semibold text-slate-900">Option A: Complete Team Registration</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Register as a team of 4 players</li>
              <li>Mandatory composition: 2 Female players and 2 Male players</li>
            </ul>
          </div>

          <div className="space-y-1">
            <p className="font-semibold text-slate-900">Option B: Individual Registration</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Register as an individual</li>
              <li>
                Even if you are already a group of 2–3 players, each member must register individually if the team is
                incomplete
              </li>
              <li>
                Please note: You are registering individually, but you will be playing as part of a 4-player team once
                teams are formed
              </li>
            </ul>
          </div>
        </section>

        <section className="space-y-2">
          <h3 className="font-semibold text-slate-900">2️⃣ Team Limit &amp; Priority</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>The league is limited to 32 teams only</li>
            <li>Complete team registrations will be given priority over individual registrations</li>
          </ul>

          <div className="rounded-lg border border-border bg-white/70 p-4">
            <p className="font-semibold text-slate-900">Example:</p>
            <p className="mt-1">
              If 30 full teams register, only 2 teams will be formed from the individual registrations.
            </p>
          </div>

          <p>
            Teams from the individual list will be formed only if the required ratio of 2 Female and 2 Male players is
            available to complete a team.
          </p>
          <p>
            Any remaining individuals who cannot be accommodated within the 32-team limit will receive a full refund.
          </p>
          <p>Registrations will close immediately once 32 teams are confirmed.</p>
        </section>

        <section className="space-y-2">
          <h3 className="font-semibold text-slate-900">3️⃣ Team Formation from Individual Registrations</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>The list of all individual players will be published on the CBL portal</li>
            <li>Players can connect with others, form teams of their choice, and inform the CBL Committee</li>
            <li>Team confirmations will be processed on a First Come, First Serve basis</li>
          </ul>
          <p>Once 32 teams are finalized, registration will close and remaining individuals will be refunded.</p>
        </section>

        <section className="space-y-2">
          <h3 className="font-semibold text-slate-900">4️⃣ Random Team Formation (If Required)</h3>
          <p>If team slots are still available at the end of registration:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>The CBL Committee will form teams randomly from the remaining individual players</li>
            <li>Teams will only be formed if the 2 Female + 2 Male ratio can be maintained</li>
            <li>If complete teams cannot be formed due to insufficient numbers, the remaining participants will receive a refund</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h3 className="font-semibold text-slate-900">5️⃣ Important Note ⚠️</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Once a team is officially registered, no player changes will be allowed</li>
            <li>Please choose your teammates carefully</li>
            <li>Ensure you read the complete rule book before registering</li>
          </ul>
          <p className="font-semibold text-slate-900">We’re looking forward to an exciting and competitive season ahead! 💪🏸</p>
        </section>
      </div>
    </aside>
  );
}

