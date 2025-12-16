'use client';

/**
 * GSC Connection Card Component
 * @description Full card for GSC integration in settings page
 */

import { useState } from 'react';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Search, 
  RefreshCw, 
  Unlink, 
  Settings2,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';
import { ConnectGSCButton } from './ConnectGSCButton';
import { GSCConnectionStatus } from './GSCConnectionStatus';
import { GSCPropertySelector } from './GSCPropertySelector';
import { useGSCAuth } from '../hooks/use-gsc-auth';

export function GSCConnectionCard() {
  const { 
    isConnected, 
    isLoading, 
    properties, 
    selectedProperty,
    lastSyncAt,
    syncStatus,
    disconnect,
    syncNow,
    selectProperty,
  } = useGSCAuth();
  
  const [showPropertySelector, setShowPropertySelector] = useState(false);

  const handleDisconnect = async () => {
    try {
      await disconnect();
      console.log('Google Search Console has been disconnected.');
    } catch (error) {
      console.error('Failed to disconnect:', error);
      alert('Failed to disconnect. Please try again.');
    }
  };

  const handleSync = async () => {
    try {
      await syncNow();
      console.log('GSC data sync has been initiated.');
    } catch (error) {
      console.error('Sync failed:', error);
      alert('Failed to sync data. Please try again.');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Search className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Google Search Console</CardTitle>
              <CardDescription>
                Connect to get real search performance data
              </CardDescription>
            </div>
          </div>
          <GSCConnectionStatus
            isConnected={isConnected}
            lastSyncAt={lastSyncAt}
            syncStatus={syncStatus}
            propertyUrl={selectedProperty ?? undefined}
          />
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : isConnected ? (
          <div className="space-y-4">
            {/* Connected State */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Connected and syncing automatically every 6 hours</span>
            </div>

            {/* Property Selector */}
            {showPropertySelector && properties.length > 0 && (
              <GSCPropertySelector
                properties={properties}
                selectedProperty={selectedProperty ?? undefined}
                onSelect={(property) => {
                  selectProperty(property);
                  setShowPropertySelector(false);
                }}
              />
            )}

            {/* Data Summary */}
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">24</div>
                <div className="text-xs text-muted-foreground">Pages Tracked</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-green-600">12.5K</div>
                <div className="text-xs text-muted-foreground">Total Clicks</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-blue-600">8.2</div>
                <div className="text-xs text-muted-foreground">Avg Position</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 space-y-4">
            <div className="text-muted-foreground">
              <XCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Connect your Google Search Console to enable:</p>
              <ul className="text-sm mt-2 space-y-1">
                <li>• Real-time content decay detection</li>
                <li>• Automatic ranking alerts</li>
                <li>• Performance trend analysis</li>
              </ul>
            </div>
            <ConnectGSCButton variant="default" size="lg" />
          </div>
        )}
      </CardContent>

      {isConnected && (
        <CardFooter className="flex justify-between border-t pt-4">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowPropertySelector(!showPropertySelector)}
            >
              <Settings2 className="h-4 w-4 mr-1" />
              Change Property
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={syncStatus === 'syncing'}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
              Sync Now
            </Button>
          </div>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                <Unlink className="h-4 w-4 mr-1" />
                Disconnect
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Disconnect Google Search Console?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will stop syncing data from GSC. Your historical data will be preserved,
                  but decay detection will no longer have access to real-time search data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDisconnect} className="bg-destructive text-destructive-foreground">
                  Disconnect
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      )}
    </Card>
  );
}
