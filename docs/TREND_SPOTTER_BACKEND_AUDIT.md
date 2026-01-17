# Trend Spotter Backend Audit

Audit scope:
1) `src/features/trend-spotter/utils/trend-math.ts`
2) `src/app/api/trend-spotter/region/route.ts`
3) `src/features/trend-spotter/services/trend-api.ts`

Report format:
- Math Status: [Real / Fake]
- Region Route: [Exists / Missing]
- Batch Logic: [Correct / Incorrect]

## Summary
- Math Status: Real
- Region Route: Exists
- Batch Logic: Correct

## Details

### 1) Trend Math (`src/features/trend-spotter/utils/trend-math.ts`)
- `calculateForecast` uses least-squares regression over the last 50% of points. It computes sums (sumX, sumY, sumXX, sumXY), derives slope and intercept, and returns numeric predictions. This is real math, not placeholder data.
- `distributeVolume` implements proportional distribution: it calculates a total score, then `estimated_volume = (value / totalScore) * totalVolume` with rounding. It also handles edge cases (zero/invalid totals).

Confirmations:
- Math Status: Real

### 2) Region Route (`src/app/api/trend-spotter/region/route.ts`)
- File exists.
- Route calls `fetchRegionInterests`, which hits DataForSEO `google_trends/subregion_interests/live`.

Confirmations:
- Region Route: Exists

### 3) Trend API Service (`src/features/trend-spotter/services/trend-api.ts`)
- `fetchTrendBatch` constructs four trend tasks (web, youtube, news, shopping) and runs a Labs volume task in parallel.
- This results in 5 tasks total across the two requests (4 Trends + 1 Volume). The JSON parsing is explicit: it selects items by type (`google_trends_graph`, `google_trends_map`, `google_trends_topics_list`, `google_trends_queries_list`) and normalizes values.

Confirmations:
- Batch Logic: Correct

## Notes
- The Trends and Volume tasks are executed via separate endpoints, which is required by DataForSEO.
- No placeholder data found in the audited logic paths.
