import axios from "axios";
import { TokenManager } from "@/lib/tokenManager";
import { isTokenExpired } from "@/lib/utils/jwt";

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

export async function performTokenRefresh(): Promise<string | null> {
  if (isRefreshing && refreshPromise) return refreshPromise;

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const base =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3107/api";
      const resp = await axios.post(
        `${base}/auth/refresh`,
        {},
        { withCredentials: true, timeout: 10000 }
      );
      const data = resp.data.data || resp.data;
      const newAccessToken = data.accessToken || data.access_token;
      if (!newAccessToken)
        throw new Error("No access token in refresh response");

      await TokenManager.setToken(newAccessToken, {
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      return newAccessToken;
    } catch {
      await TokenManager.clearTokens();
      if (typeof window !== "undefined") window.location.href = "/login";
      throw new Error("Refresh failed");
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function refreshTokenIfNeeded(): Promise<void> {
  try {
    const token = await TokenManager.getToken();
    if (!token) return;
    if (isTokenExpired(token)) {
      await performTokenRefresh();
    }
  } catch {
    console.warn("refreshTokenIfNeeded failed");
  }
}
