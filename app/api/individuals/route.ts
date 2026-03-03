import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const INDIVIDUALS_APPS_SCRIPT_EXEC_URL =
  "https://script.google.com/macros/s/AKfycbxlTxgIRAyWPbM2yJuGtpPM2BkizGBQM7Si7u6SJx4fOreVtbzWNUYBTmyFzAahblzq/exec";

export async function GET(_request: NextRequest) {
  try {
    const url = new URL(INDIVIDUALS_APPS_SCRIPT_EXEC_URL);
    url.searchParams.set("action", "individuals");
    url.searchParams.set("_ts", String(Date.now()));

    const response = await fetch(url.toString(), {
      method: "GET",
      redirect: "follow",
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache",
      },
    });

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.ok ? 200 : response.status,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch individuals",
      },
      { status: 500 }
    );
  }
}

