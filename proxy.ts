import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, expectedToken, safeEqual } from "./lib/auth.ts";

const LANGS = ["fa", "en"];

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const [, first, second] = pathname.split("/");

  if (!LANGS.includes(first)) {
    const url = request.nextUrl.clone();
    url.pathname = "/fa";
    url.search = "";
    return NextResponse.redirect(url);
  }

  const expected = await expectedToken();
  const cookie = request.cookies.get(SESSION_COOKIE)?.value ?? "";
  const authed = expected !== null && safeEqual(cookie, expected);
  const onLogin = second === "login";

  if (!authed && !onLogin) {
    const url = request.nextUrl.clone();
    url.pathname = `/${first}/login`;
    url.search = "";
    if (pathname !== `/${first}`) url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }
  if (authed && onLogin) {
    const url = request.nextUrl.clone();
    url.pathname = `/${first}`;
    url.search = "";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/|_next/static|_next/image|favicon.ico|icon.svg|robots.txt).*)"],
};
