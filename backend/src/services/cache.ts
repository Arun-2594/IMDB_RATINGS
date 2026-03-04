import NodeCache from 'node-cache';

const CACHE_TTL = parseInt(process.env.CACHE_TTL_SECONDS || '300', 10);

const cache = new NodeCache({
  stdTTL: CACHE_TTL,
  checkperiod: 60,
  useClones: false,
});

export function getCached<T>(key: string): T | undefined {
  return cache.get<T>(key);
}

export function setCache<T>(key: string, value: T, ttl?: number): void {
  cache.set(key, value, ttl ?? CACHE_TTL);
}

export function cacheKey(prefix: string, id: string): string {
  return `${prefix}:${id}`;
}

export function flushCache(): void {
  cache.flushAll();
}

export default cache;
