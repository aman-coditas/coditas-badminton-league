import { NextRequest, NextResponse } from "next/server";

const REGISTRATION_APPS_SCRIPT_EXEC_URL =
  "https://script.google.com/macros/s/AKfycbxlTxgIRAyWPbM2yJuGtpPM2BkizGBQM7Si7u6SJx4fOreVtbzWNUYBTmyFzAahblzq/exec";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(REGISTRATION_APPS_SCRIPT_EXEC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      redirect: "follow",
    });

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.ok ? 200 : response.status,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Registration request failed",
      },
      { status: 500 }
    );
  }
}

