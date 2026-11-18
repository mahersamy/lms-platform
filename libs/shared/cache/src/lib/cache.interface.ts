export const CACHE_STORE = Symbol('CACHE_STORE');

export interface CacheStore {
  get<T>(key: string): Promise<T | null>;

  set<T>(
    key: string,
    value: T,
    ttl?: number,
  ): Promise<void>;

  delete(key: string): Promise<void>;
}
