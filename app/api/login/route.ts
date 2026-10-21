import { NextResponse } from "next/server";
import { SESSION_COOKIE, SESSION_MAX_AGE, expectedToken, safeEqual, sessionToken } from "@/lib/auth.ts";

export async function POST(request: Request) {
  const expected = await expectedToken();
  if (!expected) {
    return NextResponse.json({ ok: false, error: "not-configured" }, { status: 503 });
  }

  let password = "";
  try {
    const body = await request.json();
    password = typeof body?.password === "string" ? body.password : "";
  } catch {
    // fall through with an empty password
  }

  if (!safeEqual(await sessionToken(password), expected)) {
    await new Promise((r) => setTimeout(r, 700)); // slow down guessing
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, expected, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}
