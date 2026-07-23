export const SESSION_COOKIE = "dash_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Cookie value doubles as the session token: it's a hash of the shared
// password, so rotating DASHBOARD_PASSWORD invalidates existing sessions
// without needing a separate secret or a database-backed session store.
export async function expectedSessionValue(): Promise<string | null> {
  const password = process.env.DASHBOARD_PASSWORD;
  if (!password) return null;
  return sha256Hex(password);
}

export async function checkPassword(candidate: string): Promise<boolean> {
  const password = process.env.DASHBOARD_PASSWORD;
  return Boolean(password) && candidate === password;
}
