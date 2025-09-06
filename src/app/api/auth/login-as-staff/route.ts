import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  console.log("[/api/auth/login-as-staff] API called");

  try {
    // NextAuthのcredentials providerのcallback URLを直接叩く
    const callbackUrl = new URL(
      "/api/auth/callback/email-password",
      process.env.NEXTAUTH_URL
    );

    const demoAuthRequest = new Request(callbackUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        email: "demo_staff@yoyaku.com",
        password: "demostaff",
        csrfToken: "", // 必要ならCSRFトークンをセット
        json: "true",
      }),
    });

    const response = await fetch(demoAuthRequest);

    if (response.ok) {
      console.log("Login as staff successful. Redirecting to /");
      return NextResponse.json({ success: true, redirectUrl: "/" });
    } else {
      const errorData = await response.json();
      console.error("Login as staff failed:", errorData);
      return NextResponse.json(
        { error: errorData?.error ?? "Unknown error" },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error("Login as staff API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
