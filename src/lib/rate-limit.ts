type Bucket = { tokens: number; updatedAt: number };

const buckets = new Map<string, Bucket>();

/**
 * In-memory token bucket. Fine for a single Node instance; swap the Map for
 * Redis (INCR + EXPIRE) when running more than one.
 */
export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now - bucket.updatedAt >= windowMs) {
    buckets.set(key, { tokens: limit - 1, updatedAt: now });
    return { ok: true, remaining: limit - 1, retryAfter: 0 };
  }

  if (bucket.tokens <= 0) {
    return {
      ok: false,
      remaining: 0,
      retryAfter: Math.ceil((windowMs - (now - bucket.updatedAt)) / 1000),
    };
  }

  bucket.tokens -= 1;
  return { ok: true, remaining: bucket.tokens, retryAfter: 0 };
}

export function clientKey(req: Request, scope: string) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'local';
  return `${scope}:${ip}`;
}

// Opportunistic cleanup so the Map cannot grow without bound.
setInterval(() => {
  const cutoff = Date.now() - 10 * 60 * 1000;
  for (const [key, bucket] of buckets) {
    if (bucket.updatedAt < cutoff) buckets.delete(key);
  }
}, 5 * 60 * 1000).unref?.();
