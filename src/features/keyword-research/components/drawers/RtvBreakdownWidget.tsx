"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RtvResult } from "../../utils/rtv-calculator";
import { RtvFormulaButton } from "./widgets/RtvFormulaButton";

type Segment = {
  key: string;
  label: string;
  pct: number;
  className: string;
};

function clampPct(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

function formatInt(n: number): string {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n);
}

function lossClassForLabel(label: string): { bar: string; pill: string; icon: string; pretty: string } {
  const l = label.toLowerCase();

  if (l.includes("ai")) {
    return {
      bar: "bg-rose-500/70",
      pill: "border-rose-500/20 bg-rose-500/10 text-rose-300",
      icon: "📉",
      pretty: "AI Overview",
    };
  }

  if (l.includes("snippet")) {
    return {
      bar: "bg-orange-500/70",
      pill: "border-orange-500/20 bg-orange-500/10 text-orange-300",
      icon: "📉",
      pretty: "Featured Snippet",
    };
  }

  if (l.includes("video")) {
    return {
      bar: "bg-amber-500/70",
      pill: "border-amber-500/20 bg-amber-500/10 text-amber-300",
      icon: "📉",
      pretty: "Video Carousel",
    };
  }

  if (l.includes("ads") || l.includes("cpc") || l.includes("paid")) {
    return {
      bar: "bg-yellow-500/70",
      pill: "border-yellow-500/20 bg-yellow-500/10 text-yellow-200",
      icon: "📉",
      pretty: "Paid Ads",
    };
  }

  return {
    bar: "bg-zinc-500/70",
    pill: "border-zinc-500/20 bg-zinc-500/10 text-zinc-300",
    icon: "📉",
    pretty: label,
  };
}

export function RtvBreakdownWidget({
  volume,
  rtv,
  className,
}: {
  volume: number;
  rtv: RtvResult;
  className?: string;
}) {
  const safeVolume = Math.max(0, Number(volume) || 0);

  const segments: Segment[] = React.useMemo(() => {
    const losses = (rtv.breakdown ?? []).map((b) => ({
      key: b.label,
      label: b.label,
      pct: clampPct(b.value),
      className: lossClassForLabel(b.label).bar,
    }));

    const lossSum = clampPct(losses.reduce((acc, x) => acc + x.pct, 0));
    const trafficPct = clampPct(100 - lossSum);

    const all: Segment[] = [
      {
        key: "real_traffic",
        label: "Real Traffic",
        pct: trafficPct,
        className: "bg-emerald-500/80",
      },
      ...losses,
    ];

    // Remove zero-width segments to avoid rendering artifacts.
    return all.filter((s) => s.pct > 0);
  }, [rtv.breakdown]);

  const realTrafficPct = Math.max(0, Math.min(100, Math.round((1 - rtv.lossPercentage) * 100)));

  return (
    <Card className={cn("bg-zinc-950/40 border-zinc-800/60", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-sm font-medium text-zinc-200">
                Realizable Traffic Potential
              </CardTitle>
              <RtvFormulaButton
                volume={safeVolume}
                rtv={rtv.rtv}
                lossPercentage={rtv.lossPercentage}
                breakdown={rtv.breakdown ?? []}
              />
            </div>
            <div className="text-[11px] text-zinc-500">
              Estimates based on SERP features and industry CTR standards.
            </div>
          </div>

          <div className="shrink-0 rounded-full border border-zinc-800 bg-zinc-950/50 px-2 py-1 text-[11px] text-zinc-400">
            Estimated
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Main number */}
        <div className="flex items-baseline gap-2">
          <div className="text-3xl font-semibold text-emerald-300 tabular-nums">
            {formatInt(rtv.rtv)}
          </div>
          <div className="text-sm text-zinc-400 tabular-nums">/ {formatInt(safeVolume)}</div>
        </div>

        {/* Stacked bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-emerald-400 font-medium">{realTrafficPct}% real</span>
            <span className="text-rose-400 font-medium">{100 - realTrafficPct}% lost</span>
          </div>

          <div className="h-3 w-full rounded-full bg-zinc-900 overflow-hidden border border-zinc-800">
            <div className="h-full flex">
              {segments.map((s) => (
                <div
                  key={s.key}
                  className={cn("h-full", s.className)}
                  style={{ width: `${s.pct}%` }}
                  aria-label={`${s.label}: ${s.pct}%`}
                  title={`${s.label}: ${s.pct}%`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Breakdown pills */}
        <div className="flex flex-wrap gap-2">
          {(rtv.breakdown ?? []).length === 0 ? (
            <div className="text-xs text-zinc-500">
              No major SERP suppressors detected for this keyword.
            </div>
          ) : (
            (rtv.breakdown ?? []).map((b) => {
              const meta = lossClassForLabel(b.label);
              return (
                <div
                  key={b.label}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[11px]",
                    meta.pill
                  )}
                >
                  <span aria-hidden="true">{meta.icon}</span>
                  <span className="text-zinc-200/90">Lost to {meta.pretty}</span>
                  <span className="tabular-nums">(-{clampPct(b.value)}%)</span>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default RtvBreakdownWidget;
