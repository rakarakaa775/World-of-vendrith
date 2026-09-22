import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    return NextResponse.json({ ok: false, error }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json({ ok: false, error: "missing_authorization_code" }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    status: "authorization_callback_received",
    message: "Authorization code received. Token exchange must be completed server-side after the Vercel integration credentials are configured.",
  });
}
