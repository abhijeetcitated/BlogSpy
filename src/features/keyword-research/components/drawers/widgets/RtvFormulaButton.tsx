"use client";

import { Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

interface RtvFormulaButtonProps {
  volume: number;
  rtv: number;
  lossPercentage: number;
  breakdown: Array<{ label: string; value: number }>;
}

function formatInt(value: number): string {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(value);
}

function normalizeLoss(lossPercentage: number): number {
  if (!Number.isFinite(lossPercentage)) return 0;
  const pct = lossPercentage <= 1 ? lossPercentage * 100 : lossPercentage;
  return Math.max(0, Math.min(100, pct));
}

export function RtvFormulaButton({
  volume,
  rtv,
  lossPercentage,
  breakdown,
}: RtvFormulaButtonProps) {
  const lossPct = Math.round(normalizeLoss(lossPercentage));
  const safeVolume = Math.max(0, Number(volume) || 0);
  const safeRtv = Math.max(0, Number(rtv) || 0);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs">
          <Calculator className="h-3.5 w-3.5" />
          Formula
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 space-y-3">
        <div className="text-sm font-semibold">RTV Calculation</div>

        <div className="rounded-md bg-muted/50 p-2 text-center font-mono text-sm whitespace-nowrap">
          RTV = Volume × (100% - Loss)
        </div>

        <div className="flex items-center justify-between gap-4 text-xs">
          <span className="text-muted-foreground whitespace-nowrap">
            Volume: <span className="font-semibold text-foreground">{formatInt(safeVolume)}</span>
          </span>
          <span className="text-rose-500 font-semibold whitespace-nowrap">Loss: {lossPct}%</span>
          <span className="text-emerald-500 font-semibold whitespace-nowrap">RTV: {formatInt(safeRtv)}</span>
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="text-xs uppercase text-muted-foreground">LOSS BREAKDOWN</div>
          {breakdown.length === 0 ? (
            <div className="text-xs text-muted-foreground/60 italic">
              No SERP suppressors detected for this keyword.
            </div>
          ) : (
            <div className="space-y-1.5">
              {breakdown.map((item) => (
                <div key={item.label} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-rose-500" />
                    <span className="text-foreground">{item.label}</span>
                  </div>
                  <span className="text-rose-500 font-semibold">
                    -{Math.round(Math.abs(item.value))}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default RtvFormulaButton;
