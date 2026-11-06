/** Fixed-window, in-memory rate limiter keyed by an opaque string (the client IP; never persisted). */
export class RateLimiter {
  private hits = new Map<string, { windowStart: number; count: number }>();
  private limit: number;
  private windowMs: number;
  private now: () => number;

  constructor(limit: number, windowMs = 60_000, now: () => number = Date.now) {
    this.limit = limit;
    this.windowMs = windowMs;
    this.now = now;
  }

  /** Returns 0 when allowed, otherwise the seconds until the window resets. */
  check(key: string): number {
    const t = this.now();
    if (this.hits.size > 10_000) this.sweep(t);
    const e = this.hits.get(key);
    if (!e || t - e.windowStart >= this.windowMs) {
      this.hits.set(key, { windowStart: t, count: 1 });
      return 0;
    }
    if (e.count >= this.limit) return Math.ceil((e.windowStart + this.windowMs - t) / 1000);
    e.count++;
    return 0;
  }

  private sweep(t: number): void {
    for (const [k, e] of this.hits) if (t - e.windowStart >= this.windowMs) this.hits.delete(k);
  }
}
