import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const INDIVIDUAL_REGISTRATION_APPS_SCRIPT_EXEC_URL =
  "https://script.google.com/macros/s/AKfycbxlTxgIRAyWPbM2yJuGtpPM2BkizGBQM7Si7u6SJx4fOreVtbzWNUYBTmyFzAahblzq/exec";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(INDIVIDUAL_REGISTRATION_APPS_SCRIPT_EXEC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Cache-Control": "no-cache" },
      body: JSON.stringify(body),
      redirect: "follow",
      cache: "no-store",
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
        message: error instanceof Error ? error.message : "Individual registration request failed",
      },
      { status: 500 }
    );
  }
}

