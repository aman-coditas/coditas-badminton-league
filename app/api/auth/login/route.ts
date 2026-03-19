import { NextResponse } from "next/server";

// Generate a random string for PKCE code verifier
function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

// Base64 URL encode
function base64UrlEncode(buffer: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...buffer));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// Generate code challenge from verifier using SHA256
async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return base64UrlEncode(new Uint8Array(hash));
}

export async function GET() {
  const clientId = process.env.CODITAS_CLIENT_ID;
  const authUrl = process.env.CODITAS_AUTH_URL;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const redirectUri = `${appUrl}/api/auth/callback`;

  if (!clientId || !authUrl) {
    return NextResponse.json(
      { error: "OAuth configuration missing" },
      { status: 500 }
    );
  }

  // Generate a random state for CSRF protection
  const state = crypto.randomUUID();

  // Generate PKCE code verifier and challenge
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  // Build the authorization URL
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid profile email",
    state: state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  const authorizationUrl = `${authUrl}?${params.toString()}`;

  // Create response with redirect
  const response = NextResponse.redirect(authorizationUrl);

  // Store state and code verifier in cookies for verification in callback
  response.cookies.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10, // 10 minutes
    path: "/",
  });

  response.cookies.set("oauth_code_verifier", codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10, // 10 minutes
    path: "/",
  });

  return response;
}
