"use client";

import { cn } from "@/lib/utils";

export default function CblDisclaimer({
  accepted,
  onAcceptedChange,
  className,
}: {
  accepted: boolean;
  onAcceptedChange: (nextValue: boolean) => void;
  className?: string;
}) {
  return (
    <aside className={cn("glass rounded-xl p-6 md:p-8", className)}>
      <h2 className="text-2xl font-bold mb-4 text-neon-blue">Disclaimer</h2>

      <div className="space-y-5 text-sm text-slate-700 leading-relaxed max-h-[70vh] overflow-auto pr-2">
        <section className="space-y-2">
          <h3 className="font-semibold text-slate-900">Medical Conditions &amp; Health Disclosure</h3>
          <p>
            Players must ensure that they are in good physical health and capable of participating in badminton matches.
            If you have any pre-existing medical conditions such as heart conditions, asthma, joint injuries, ligament
            issues, diabetes, or any other condition that may affect your ability to safely participate, you are
            required to disclose it during the registration process.
          </p>
          <p>
            By registering for the Coditas Badminton League (CBL), you confirm that you do not have any medical
            condition that would prevent you from safely participating. If you do have such a condition, you
            acknowledge that you are participating at your own risk and will take full responsibility for any
            health-related consequences.
          </p>
          <p>
            Coditas Solutions LLP reserves the right to request a medical certificate or proof of fitness at any time
            before or during the tournament.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-semibold text-slate-900">Liability Disclaimer</h3>
          <p>
            Coditas Solutions LLP shall not be held liable for any injury, illness, accident, or physical damage that
            may occur as a result of participating in the Coditas Badminton League (CBL), whether caused by negligence,
            other participants, court conditions, equipment usage, or any unforeseen circumstances.
          </p>
          <p>
            Players understand that badminton is a physically demanding sport that involves rapid movements, jumping,
            lunging, and quick directional changes, which carry inherent risks of injury.
          </p>
          <p>
            By participating, players agree to do so at their own risk and accept full responsibility for their safety
            and well-being during the tournament.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-semibold text-slate-900">Loss of Personal Belongings</h3>
          <p>
            Coditas Solutions LLP is not responsible for the loss, theft, or damage of personal belongings during the
            tournament at LSBI Badminton Turf or any associated venue.
          </p>
          <p>
            Players are advised to take proper care of their rackets, shoes, bags, electronic devices, and other
            valuables. Any lost, stolen, or damaged property remains the sole responsibility of the individual player.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-semibold text-slate-900">Voluntary Participation</h3>
          <p>
            Participation in the Coditas Badminton League (CBL) is entirely voluntary. By registering, players
            acknowledge that they are under no obligation to participate and are doing so of their own free will.
          </p>
          <p>
            Players confirm that they understand the physical demands and competitive nature of the tournament and
            willingly accept the associated risks.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-semibold text-slate-900">Conduct &amp; Code of Behavior</h3>
          <p>All participants are expected to maintain professional, respectful, and sportsmanlike conduct throughout the tournament.</p>
          <p>Any inappropriate behavior, including but not limited to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Physical altercations</li>
            <li>Verbal abuse</li>
            <li>Aggressive arguments with opponents or officials</li>
            <li>Damage to property</li>
            <li>Unsportsmanlike conduct</li>
          </ul>
          <p>
            may result in immediate disqualification from the tournament. Players agree to follow all rules and
            regulations set forth by the CBL organizers and comply with the decisions made by match officials and
            referees at all times.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-semibold text-slate-900">CBL Committee &amp; Rule Modifications</h3>
          <p>
            The CBL Committee (Coditas Badminton League Committee) reserves the right to modify, add, or remove any
            rules or regulations at any time if deemed necessary for the smooth and fair conduct of the tournament.
          </p>
          <p>
            Any updates or changes will be communicated to team captains or participants through the official league
            portal. All players are expected to adhere to the revised rules once communicated.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-semibold text-slate-900">Insurance Advisory</h3>
          <p>Players are strongly advised to carry personal health insurance or accidental insurance coverage.</p>
          <p>
            Coditas Solutions LLP does not provide medical insurance, health coverage, or accident compensation for any
            injuries sustained during the tournament.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-semibold text-slate-900">Use of Likeness</h3>
          <p>
            By participating in the Coditas Badminton League (CBL), players grant Coditas Solutions LLP the right to
            capture and use photographs, videos, and other media taken during the tournament for promotional, marketing,
            social media, and internal communication purposes.
          </p>
          <p>Participation implies consent for such usage without any claim for compensation.</p>
        </section>
      </div>

      <div className="mt-6 pt-6 border-t border-border">
        <label className="flex items-start gap-3 text-sm text-slate-700">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-border"
            checked={accepted}
            onChange={(e) => onAcceptedChange(e.target.checked)}
          />
          <span>
            <span className="font-semibold text-slate-900">I accept</span>
          </span>
        </label>
      </div>
    </aside>
  );
}

