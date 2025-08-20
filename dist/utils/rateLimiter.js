"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlidingWindowRateLimiter = void 0;
class SlidingWindowRateLimiter {
    constructor(maxEvents, windowMs) {
        this.maxEvents = maxEvents;
        this.windowMs = windowMs;
        this.windows = new Map();
    }
    allow(key) {
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
exports.SlidingWindowRateLimiter = SlidingWindowRateLimiter;
//# sourceMappingURL=rateLimiter.js.map