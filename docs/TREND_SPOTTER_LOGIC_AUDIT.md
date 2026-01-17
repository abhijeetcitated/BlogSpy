# Trend Spotter Logic Audit

Scope:
1) `src/features/trend-spotter/utils/cache-logic.ts`
2) `src/features/trend-spotter/components/trend-spotter.tsx`
3) `src/app/api/trend-spotter/analyze/route.ts`
4) `src/features/trend-spotter/utils/trend-math.ts`

## Status Summary
- TTL Logic: ✅ Implemented
- Stale UI (Blur): ✅ Implemented
- Custom Date Key: ✅ Implemented
- Map Volume Math: ✅ Implemented

## Evidence

### 1) TTL Logic
File: `src/features/trend-spotter/utils/cache-logic.ts`
- `getCacheTtlMinutes` returns:
  - 4H -> 15 minutes
  - 12M -> 7 days (10080 minutes)
- `getCacheExpiry` uses that TTL to compute an ISO expiry.

### 2) Stale UI
File: `src/features/trend-spotter/components/trend-spotter.tsx`
- Chart is wrapped with `opacity-60 blur-[1px]` when `isStale` is true.
- Analyze button text changes to `Refresh (1 Credit)` for stale data.

### 3) Custom Date Cache
File: `src/app/api/trend-spotter/analyze/route.ts`
- `start_date` and `end_date` are accepted and validated.
- Cache key uses `buildCacheTimeframeKey(timeframe, start_date, end_date)` so custom ranges do not collide.
- Cache writes persist the custom key into `trend_cache.timeframe`.

### 4) Volume Math
File: `src/features/trend-spotter/utils/trend-math.ts`
- `distributeVolume` calculates `estimated_volume = (value / totalScore) * totalVolume` with edge case guards.
