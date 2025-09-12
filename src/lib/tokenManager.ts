export class TokenManager {
  private static readonly TOKEN_KEY = "access_token";
  private static readonly REFRESH_TOKEN_KEY = "refresh_token";

  static async getToken(): Promise<string | null> {
    // Server-side: try to read via next/headers if available
    if (typeof window === "undefined") {
      try {
        // Dynamic import to avoid bundling next/headers in client
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        const c = cookieStore.get(this.TOKEN_KEY);
        return c?.value ?? null;
      } catch (e) {
        return null;
      }
    }

    // Client-side: read from document.cookie
    const match = document.cookie.match(
      new RegExp("(^| )" + this.TOKEN_KEY + "=([^;]+)")
    );
    return match ? decodeURIComponent(match[2]) : null;
  }

  static setToken(
    token: string,
    opts?: {
      maxAge?: number;
      path?: string;
      secure?: boolean;
      sameSite?: "lax" | "strict" | "none";
    }
  ): void {
    if (typeof window === "undefined") return;
    const path = opts?.path ?? "/";
    let cookie = `${this.TOKEN_KEY}=${encodeURIComponent(token)}; path=${path}`;
    if (opts?.maxAge) cookie += `; max-age=${opts.maxAge}`;
    if (opts?.secure) cookie += `; Secure`;
    if (opts?.sameSite) cookie += `; SameSite=${opts.sameSite}`;
    document.cookie = cookie;
  }

  static async getRefreshToken(): Promise<string | null> {
    if (typeof window === "undefined") {
      try {
        // Dynamic import to avoid bundling next/headers in client
        const { cookies } = await import("next/headers");
        const c = await cookies();
        return c.get(this.REFRESH_TOKEN_KEY)?.value ?? null;
      } catch (e) {
        return null;
      }
    }

    const match = document.cookie.match(
      new RegExp("(^| )" + this.REFRESH_TOKEN_KEY + "=([^;]+)")
    );
    return match ? decodeURIComponent(match[2]) : null;
  }

  static setRefreshToken(
    token: string,
    opts?: {
      maxAge?: number;
      path?: string;
      secure?: boolean;
      sameSite?: "lax" | "strict" | "none";
    }
  ): void {
    if (typeof window === "undefined") return;
    const path = opts?.path ?? "/";
    let cookie = `${this.REFRESH_TOKEN_KEY}=${encodeURIComponent(
      token
    )}; path=${path}`;
    if (opts?.maxAge) cookie += `; max-age=${opts.maxAge}`;
    if (opts?.secure) cookie += `; Secure`;
    if (opts?.sameSite) cookie += `; SameSite=${opts?.sameSite}`;
    document.cookie = cookie;
  }

  static clearTokens(): void {
    if (typeof window === "undefined") return; // clearing on server requires response access
    document.cookie = `${this.TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    document.cookie = `${this.REFRESH_TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
}
