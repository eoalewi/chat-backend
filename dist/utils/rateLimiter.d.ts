export declare class SlidingWindowRateLimiter {
    private maxEvents;
    private windowMs;
    private windows;
    constructor(maxEvents: number, windowMs: number);
    allow(key: string): boolean;
}
//# sourceMappingURL=rateLimiter.d.ts.map