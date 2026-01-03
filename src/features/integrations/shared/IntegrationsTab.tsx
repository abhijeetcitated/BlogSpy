'use client';

/**
 * Integrations Tab Component
 * @description Tab for settings page showing all integrations
 */

import { GSCConnectionCard } from '../gsc/components/GSCConnectionCard';
import { GA4ConnectionCard } from '../ga4/components/GA4ConnectionCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Shield, Clock } from 'lucide-react';

export function IntegrationsTab() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold">Data Integrations</h3>
        <p className="text-sm text-muted-foreground">
          Connect your Google accounts to enable real-time content decay detection
        </p>
      </div>

      {/* Benefits Card */}
      <Card className="bg-linear-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-2">
              <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div className="text-sm font-medium">Real-time Data</div>
              <div className="text-xs text-muted-foreground">
                Auto-sync every 6 hours
              </div>
            </div>
            <div className="space-y-2">
              <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div className="text-sm font-medium">Secure OAuth</div>
              <div className="text-xs text-muted-foreground">
                No passwords stored
              </div>
            </div>
            <div className="space-y-2">
              <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div className="text-sm font-medium">Instant Alerts</div>
              <div className="text-xs text-muted-foreground">
                Get notified immediately
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Google Integrations */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium text-muted-foreground">Google Services</h4>
          <Badge variant="outline" className="text-xs">
            Recommended
          </Badge>
        </div>
        
        {/* GSC Card */}
        <GSCConnectionCard />
        
        {/* GA4 Card */}
        <GA4ConnectionCard />
      </div>

      {/* Future Integrations Placeholder */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-muted-foreground">Coming Soon</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <Card className="opacity-60">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-lg">
                  📊
                </div>
                <CardTitle className="text-sm">Ahrefs</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs">
                Import backlink and keyword data
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="opacity-60">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-lg">
                  🔍
                </div>
                <CardTitle className="text-sm">SEMrush</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs">
                Import competitive analysis data
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
