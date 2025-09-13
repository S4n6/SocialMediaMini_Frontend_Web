export function decodeJwtPayload(
  token: string
): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decodeURIComponent(escape(decoded))) as Record<
      string,
      unknown
    >;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string, aheadSeconds = 300): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== "number") return true;
  const current = Math.floor(Date.now() / 1000);
  return payload.exp < current + aheadSeconds;
}
