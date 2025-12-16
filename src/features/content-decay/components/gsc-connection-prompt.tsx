'use client';

/**
 * GSC Connection Prompt Component
 * @description Shows a prompt to connect GSC when not connected
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  AlertTriangle, 
  ArrowRight, 
  Sparkles,
  TrendingDown,
  Bell,
  BarChart3
} from 'lucide-react';

interface GSCConnectionPromptProps {
  onContinueWithDemo?: () => void;
}

export function GSCConnectionPrompt({ onContinueWithDemo }: GSCConnectionPromptProps) {
  const router = useRouter();
  const [showDemo, setShowDemo] = useState(false);

  const handleConnectGSC = () => {
    router.push('/settings?tab=integrations');
  };

  const handleContinueDemo = () => {
    setShowDemo(true);
    onContinueWithDemo?.();
  };

  if (showDemo) {
    return null;
  }

  return (
    <div className="flex-1 bg-background">
      <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6 px-0">
        {/* Main Prompt Card */}
        <Card className="border-red-500/40 bg-gradient-to-br from-red-500/10 via-orange-500/5 to-transparent shadow-lg shadow-red-500/10">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center mb-4 shadow-lg shadow-red-500/20">
              <Search className="h-8 w-8 text-red-500" />
            </div>
            <CardTitle className="text-2xl">Connect Google Search Console</CardTitle>
            <CardDescription className="text-base mt-2">
              Get real-time content decay alerts based on your actual search performance
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-muted/50 border border-border">
                <TrendingDown className="h-6 w-6 text-red-500 mx-auto mb-2" />
                <div className="font-medium text-sm">Auto-Detect Decay</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Spot traffic drops before they hurt
                </div>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50 border border-border">
                <Bell className="h-6 w-6 text-amber-500 mx-auto mb-2" />
                <div className="font-medium text-sm">Instant Alerts</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Email & Slack notifications
                </div>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50 border border-border">
                <BarChart3 className="h-6 w-6 text-green-500 mx-auto mb-2" />
                <div className="font-medium text-sm">Historical Trends</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Track performance over time
                </div>
              </div>
            </div>

            {/* How it works */}
            <div className="bg-muted/30 rounded-lg p-4 border border-border">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-foreground" />
                <span className="font-medium text-sm">How it works</span>
              </div>
              <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                <li>Connect your Google Search Console account (OAuth - secure)</li>
                <li>We sync your search performance data every 6 hours</li>
                <li>Our AI detects drops in traffic, clicks, or rankings</li>
                <li>You get alerted instantly with actionable insights</li>
              </ol>
            </div>

            {/* Security Note */}
            <div className="flex items-start gap-3 text-xs text-muted-foreground bg-muted/20 rounded-lg p-3 border border-border">
              <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
              <p>
                We use Google OAuth for secure authentication. We only request 
                read-only access to your Search Console data. Your credentials 
                are never stored.
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button 
              size="lg" 
              className="flex-1"
              onClick={handleConnectGSC}
            >
              <Search className="mr-2 h-4 w-4" />
              Connect Google Search Console
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={handleContinueDemo}
              className="flex-1"
            >
              Continue with Demo Data
            </Button>
          </CardFooter>
        </Card>

        {/* Demo Mode Badge */}
        <div className="text-center">
          <Badge variant="secondary" className="text-xs">
            You can always connect later from Settings → Integrations
          </Badge>
        </div>
      </div>
    </div>
  );
}
