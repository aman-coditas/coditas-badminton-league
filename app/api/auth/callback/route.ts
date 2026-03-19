import { NextRequest, NextResponse } from "next/server";

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  refresh_token?: string;
  id_token?: string;
}

interface UserInfo {
  sub?: string;
  email?: string;
  name?: string;
  picture?: string;
  employee_id?: string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Handle OAuth errors
  if (error) {
    const errorDescription = searchParams.get("error_description") || "Authentication failed";
    return NextResponse.redirect(`${appUrl}/login?error=${encodeURIComponent(errorDescription)}`);
  }

  if (!code) {
    return NextResponse.redirect(`${appUrl}/login?error=No+authorization+code`);
  }

  if (!state) {
    return NextResponse.redirect(`${appUrl}/login?error=Missing+state`);
  }

  // Decode state to get code verifier
  let codeVerifier: string;
  try {
    const stateData = JSON.parse(atob(state));
    codeVerifier = stateData.verifier;
    if (!codeVerifier) {
      throw new Error("No verifier in state");
    }
  } catch {
    return NextResponse.redirect(`${appUrl}/login?error=Invalid+state`);
  }

  const clientId = process.env.CODITAS_CLIENT_ID;
  const clientSecret = process.env.CODITAS_CLIENT_SECRET;
  const tokenUrl = process.env.CODITAS_TOKEN_URL;
  const userInfoUrl = process.env.CODITAS_USERINFO_URL;
  const redirectUri = `${appUrl}/api/auth/callback`;

  if (!clientId || !clientSecret || !tokenUrl) {
    return NextResponse.redirect(`${appUrl}/login?error=OAuth+configuration+missing`);
  }

  try {
    // Exchange authorization code for tokens with PKCE verifier
    const tokenResponse = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Token exchange failed:", errorText);
      return NextResponse.redirect(`${appUrl}/login?error=Token+exchange+failed`);
    }

    const tokens: TokenResponse = await tokenResponse.json();

    // Fetch user info if endpoint is configured
    let userInfo: UserInfo | null = null;
    if (userInfoUrl && tokens.access_token) {
      try {
        const userResponse = await fetch(userInfoUrl, {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
          },
        });
        if (userResponse.ok) {
          userInfo = await userResponse.json();
        }
      } catch (e) {
        console.error("Failed to fetch user info:", e);
      }
    }

    // Create response with redirect to home
    const response = NextResponse.redirect(appUrl);

    
    // Store session info in cookies (simplified - consider using a proper session library in production)
    response.cookies.set("cbl_session", JSON.stringify({
      access_token: tokens.access_token,
      user: userInfo,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    // Set a non-httpOnly cookie for client-side auth state check
    response.cookies.set("cbl_logged_in", "true", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(`${appUrl}/login?error=Authentication+failed`);
  }
}
