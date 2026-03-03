import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const APPS_SCRIPT_EXEC_URL =
  "https://script.google.com/macros/s/AKfycbxlTxgIRAyWPbM2yJuGtpPM2BkizGBQM7Si7u6SJx4fOreVtbzWNUYBTmyFzAahblzq/exec";

type ValidateEmailsRequest = {
  emails?: unknown;
};

function normalize_email(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return null;
  return trimmed;
}

function collect_registered_emails_from_teams(payload: unknown): Set<string> {
  const out = new Set<string>();
  if (!payload || typeof payload !== "object") return out;

  const teams = (payload as Record<string, unknown>).teams;
  if (!Array.isArray(teams)) return out;

  for (const team of teams) {
    if (!team || typeof team !== "object") continue;
    const players = (team as Record<string, unknown>).players;
    if (!Array.isArray(players)) continue;
    for (const player of players) {
      if (!player || typeof player !== "object") continue;
      const email = normalize_email((player as Record<string, unknown>).email);
      if (email) out.add(email);
    }
  }

  return out;
}

function collect_registered_emails_from_individuals(payload: unknown): Set<string> {
  const out = new Set<string>();
  if (!payload || typeof payload !== "object") return out;

  const individuals = (payload as Record<string, unknown>).individuals;
  if (!Array.isArray(individuals)) return out;

  for (const person of individuals) {
    if (!person || typeof person !== "object") continue;
    const email = normalize_email((person as Record<string, unknown>).email);
    if (email) out.add(email);
  }

  return out;
}

async function fetch_action(action: "teams" | "individuals"): Promise<unknown> {
  const url = new URL(APPS_SCRIPT_EXEC_URL);
  url.searchParams.set("action", action);
  url.searchParams.set("_ts", String(Date.now()));

  const response = await fetch(url.toString(), {
    method: "GET",
    redirect: "follow",
    cache: "no-store",
    headers: {
      "Cache-Control": "no-cache",
    },
  });

  if (!response.ok) throw new Error(`Failed to fetch ${action} (${response.status})`);
  return await response.json();
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ValidateEmailsRequest;
    const raw_emails = Array.isArray(body?.emails) ? body.emails : [];

    const normalized = raw_emails
      .map(normalize_email)
      .filter((v): v is string => Boolean(v));

    const unique = Array.from(new Set(normalized));
    if (unique.length === 0) {
      return NextResponse.json({ success: true, conflicts: [] as string[] }, { status: 200 });
    }

    const [teams_payload, individuals_payload] = await Promise.all([fetch_action("teams"), fetch_action("individuals")]);

    const registered = new Set<string>();
    for (const email of collect_registered_emails_from_teams(teams_payload)) registered.add(email);
    for (const email of collect_registered_emails_from_individuals(individuals_payload)) registered.add(email);

    const conflicts = unique.filter((email) => registered.has(email));

    return NextResponse.json(
      { success: true, conflicts },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to validate emails",
        conflicts: [] as string[],
      },
      { status: 500 }
    );
  }
}

