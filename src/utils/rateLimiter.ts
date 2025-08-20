type Stamp = number;

export class SlidingWindowRateLimiter {
  private windows: Map<string, Stamp[]> = new Map();

  constructor(
    private maxEvents: number,
    private windowMs: number,
  ) {}

  allow(key: string): boolean {
    const now = Date.now();
    const start = now - this.windowMs;
    const arr = this.windows.get(key) ?? [];
    const filtered = arr.filter((t) => t > start);
    if (filtered.length >= this.maxEvents) {
      this.windows.set(key, filtered);
      return false;
    }
    filtered.push(now);
    this.windows.set(key, filtered);
    return true;
  }
}
