import axios from "axios";

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

export async function performTokenRefresh(): Promise<string | null> {
  if (isRefreshing && refreshPromise) return refreshPromise;

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const base =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3107/api";
      await axios.post(
        `${base}/auth/refresh`,
        {},
        { withCredentials: true, timeout: 10000 }
      );

      // With HTTP-only cookies, the token is automatically stored in cookies
      // No need to manually store the access token
      console.log("Token refresh successful via HTTP-only cookies");

      return "token-refreshed"; // Return a success indicator
    } catch (err) {
      // Clear any client-side token references
      // The actual HTTP-only cookies will be cleared by the server
      console.error("Token refresh failed:", err);

      // Preserve original error for upstream handling
      throw err instanceof Error ? err : new Error("Refresh failed");
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function refreshTokenIfNeeded(): Promise<void> {
  try {
    // With HTTP-only cookies, we can't check token expiration client-side
    // The server will handle token validation and refresh automatically
    // This function can be simplified or removed in HTTP-only cookie implementation
    console.log("Token management handled by HTTP-only cookies");
  } catch {
    console.warn("refreshTokenIfNeeded failed");
  }
}
