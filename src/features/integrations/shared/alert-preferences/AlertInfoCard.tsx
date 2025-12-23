'use client';

/**
 * Alert Info Card Component
 * @description Information about how alerts work
 */

import { Card, CardContent } from '@/components/ui/card';
import { Info } from 'lucide-react';

export function AlertInfoCard() {
  return (
    <Card className="bg-muted/50 border-muted">
      <CardContent className="pt-4">
        <div className="flex gap-3">
          <Info className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">How alerts work</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Content is scanned every 6 hours for changes</li>
              <li>You&apos;ll be notified when traffic drops by 20% or more</li>
              <li>Position drops of 5+ spots also trigger alerts</li>
              <li>Critical alerts are sent for 30%+ traffic drops</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
