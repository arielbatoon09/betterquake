import { NextResponse } from "next/server";

interface RateLimitStore {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting
const rateLimitStore = new Map<string, RateLimitStore>();

// Cleanup old entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 10 * 60 * 1000);

export interface RateLimitConfig {
  interval: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests allowed in the time window
}

export function getRateLimitKey(identifier: string, endpoint: string): string {
  return `${identifier}:${endpoint}`;
}

export function checkRateLimit(
  identifier: string,
  endpoint: string,
  config: RateLimitConfig
): {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
} {
  const key = getRateLimitKey(identifier, endpoint);
  const now = Date.now();
  
  let store = rateLimitStore.get(key);

  // Initialize or reset if window has passed
  if (!store || now > store.resetTime) {
    store = {
      count: 0,
      resetTime: now + config.interval,
    };
    rateLimitStore.set(key, store);
  }

  // Check if limit exceeded
  if (store.count >= config.maxRequests) {
    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      reset: store.resetTime,
    };
  }

  // Increment counter
  store.count++;

  return {
    success: true,
    limit: config.maxRequests,
    remaining: config.maxRequests - store.count,
    reset: store.resetTime,
  };
}

export function createRateLimitResponse(rateLimitInfo: {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}): NextResponse {
  const retryAfter = Math.ceil((rateLimitInfo.reset - Date.now()) / 1000);

  return NextResponse.json(
    {
      error: "Too many requests",
      message: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
      limit: rateLimitInfo.limit,
      remaining: rateLimitInfo.remaining,
      resetAt: new Date(rateLimitInfo.reset).toISOString(),
    },
    {
      status: 429,
      headers: {
        "X-RateLimit-Limit": rateLimitInfo.limit.toString(),
        "X-RateLimit-Remaining": rateLimitInfo.remaining.toString(),
        "X-RateLimit-Reset": rateLimitInfo.reset.toString(),
        "Retry-After": retryAfter.toString(),
      },
    }
  );
}

export function addRateLimitHeaders(
  response: NextResponse,
  rateLimitInfo: {
    limit: number;
    remaining: number;
    reset: number;
  }
): NextResponse {
  response.headers.set("X-RateLimit-Limit", rateLimitInfo.limit.toString());
  response.headers.set("X-RateLimit-Remaining", rateLimitInfo.remaining.toString());
  response.headers.set("X-RateLimit-Reset", rateLimitInfo.reset.toString());
  return response;
}

// Helper to get client identifier (IP address or fallback)
export function getClientIdentifier(request: Request): string {
  // Try to get real IP from various headers (for proxies/load balancers)
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  // Fallback to a generic identifier
  return "unknown";
}

