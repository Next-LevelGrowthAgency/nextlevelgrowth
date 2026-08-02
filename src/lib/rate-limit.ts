/**
 * Shared, per-instance in-memory rate limiter — same lightweight pattern
 * already duplicated in /api/contact and /api/growth-audit, extracted here
 * so the new /api/growth-coach/lead route doesn't copy it a third time.
 * Replace with a durable store (e.g. Upstash Redis) for real production
 * traffic, since serverless functions don't share memory across invocations.
 */

const logs = new Map<string, Map<string, number[]>>();

export function isRateLimited(bucket: string, key: string, windowMs: number, max: number): boolean {
  const bucketLog = logs.get(bucket) ?? new Map<string, number[]>();
  const now = Date.now();
  const timestamps = (bucketLog.get(key) ?? []).filter((t) => now - t < windowMs);
  timestamps.push(now);
  bucketLog.set(key, timestamps);
  logs.set(bucket, bucketLog);
  return timestamps.length > max;
}
