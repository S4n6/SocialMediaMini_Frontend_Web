/**
 * Simple client-side rate limiter for auth actions.
 * Use alongside server-side rate limiting — never as sole protection.
 */
export class AuthRateLimiter {
  private attempts = new Map<string, { count: number; resetAt: number }>();

  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 15 * 60 * 1000, // 15 minutes
  ) {}

  canAttempt(key: string): boolean {
    this.cleanup(key);
    const record = this.attempts.get(key);
    return !record || record.count < this.maxAttempts;
  }

  recordAttempt(key: string): void {
    this.cleanup(key);
    const record = this.attempts.get(key) || {
      count: 0,
      resetAt: Date.now() + this.windowMs,
    };
    record.count += 1;
    this.attempts.set(key, record);
  }

  getRemainingAttempts(key: string): number {
    this.cleanup(key);
    const record = this.attempts.get(key);
    return record
      ? Math.max(0, this.maxAttempts - record.count)
      : this.maxAttempts;
  }

  getTimeUntilReset(key: string): number {
    const record = this.attempts.get(key);
    if (!record) return 0;
    return Math.max(0, record.resetAt - Date.now());
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }

  private cleanup(key: string): void {
    const record = this.attempts.get(key);
    if (record && Date.now() > record.resetAt) {
      this.attempts.delete(key);
    }
  }
}

/** Pre-configured limiters for common auth actions */
export const loginRateLimiter = new AuthRateLimiter(5, 15 * 60 * 1000); // 5 attempts / 15 min
export const forgotPasswordRateLimiter = new AuthRateLimiter(3, 60 * 60 * 1000); // 3 attempts / 1 hour
