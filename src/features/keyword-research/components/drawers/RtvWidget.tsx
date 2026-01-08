"use client";

import * as React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { calculateRtv } from "../../utils/rtv-calculator";

type KeywordDataLike = {
  volume?: number | null;
  cpc?: number | null;
  serp_features?: unknown;
  serpFeatures?: unknown;
};

export function RtvWidget({ keywordData }: { keywordData: KeywordDataLike }) {
  const volume = Number(keywordData.volume ?? 0);
  const cpc = keywordData.cpc ?? 0;
  const serpFeatures = (keywordData.serp_features ?? keywordData.serpFeatures) as unknown;

  const rtv = React.useMemo(
    () =>
      calculateRtv({
        volume,
        cpc,
        serpFeatures,
      }),
    [volume, cpc, serpFeatures]
  );

  const trafficLeftPct = Math.max(0, Math.min(100, Math.round((1 - rtv.lossPercentage) * 100)));
  const trafficLostPct = 100 - trafficLeftPct;

  const fmt = React.useMemo(
    () =>
      new Intl.NumberFormat(undefined, {
        maximumFractionDigits: 0,
      }),
    []
  );

  return (
    <Card className="bg-zinc-950/40 border-zinc-800/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-zinc-200">
          Realizable Traffic Potential
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar: traffic left vs lost */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-emerald-400 font-medium">{trafficLeftPct}% left</span>
            <span className="text-rose-400 font-medium">{trafficLostPct}% lost</span>
          </div>

          <div className="h-2 w-full rounded-full bg-zinc-900 overflow-hidden border border-zinc-800">
            <div className="h-full flex">
              <div
                className="h-full bg-emerald-500/80"
                style={{ width: `${trafficLeftPct}%` }}
              />
              <div
                className="h-full bg-rose-500/70"
                style={{ width: `${trafficLostPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Big stat */}
        <div className="flex items-baseline gap-2">
          <div className="text-2xl font-semibold text-zinc-50 tabular-nums">
            {fmt.format(rtv.rtv)}
          </div>
          <div className="text-sm text-zinc-400 tabular-nums">
            / {fmt.format(Math.max(0, volume))}
          </div>
        </div>

        {/* Breakdown */}
        <div className="space-y-1.5">
          {rtv.breakdown.length === 0 ? (
            <div className="text-xs text-zinc-500">
              No major SERP suppressors detected for this keyword.
            </div>
          ) : (
            <ul className="space-y-1">
              {rtv.breakdown.map((b) => (
                <li key={b.label} className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300">{b.label}</span>
                  <span className="text-rose-400 tabular-nums">-{b.value}%</span>
                </li>
              ))}
            </ul>
          )}

          <div className="pt-2 text-[11px] leading-4 text-zinc-500">
            RTV is an estimate: search volume adjusted for SERP features that reduce clicks.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default RtvWidget;
