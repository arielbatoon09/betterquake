export const CACHE_KEY = "betterquake_data";
export const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export interface CachedData<T> {
  data: T;
  timestamp: number;
}

export function getCachedData<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const parsedCache: CachedData<T> = JSON.parse(cached);
    const now = Date.now();
    
    // Check if cache is still valid (within 5 minutes)
    if (now - parsedCache.timestamp < CACHE_DURATION) {
      return parsedCache.data;
    }
    
    // Cache expired, remove it
    localStorage.removeItem(key);
    return null;
  } catch (error) {
    console.error("Error reading from cache:", error);
    return null;
  }
}

export function setCachedData<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  
  try {
    const cacheData: CachedData<T> = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(cacheData));
  } catch (error) {
    console.error("Error writing to cache:", error);
  }
}

export function clearCache(key: string): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error("Error clearing cache:", error);
  }
}

export function getCacheAge(key: string): number | null {
  if (typeof window === "undefined") return null;
  
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const parsedCache: CachedData<unknown> = JSON.parse(cached);
    return Date.now() - parsedCache.timestamp;
  } catch {
    return null;
  }
}

