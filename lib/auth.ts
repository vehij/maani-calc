// Shared-password access. The session cookie holds a hash derived from the
// configured password, so changing ACCESS_PASSWORD signs everyone out.

export const SESSION_COOKIE = "maani_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function sessionToken(password: string): Promise<string> {
  const data = new TextEncoder().encode(`maani-calc:v1:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function expectedToken(): Promise<string | null> {
  const password = process.env.ACCESS_PASSWORD;
  return password ? sessionToken(password) : null;
}

export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
