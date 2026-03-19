import { NextResponse } from "next/server";

export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const response = NextResponse.redirect(`${appUrl}/login`);

  // Clear session cookies
  response.cookies.delete("cbl_session");
  response.cookies.delete("cbl_logged_in");

  return response;
}

export async function POST() {
  return GET();
}
