'use client';

/**
 * Connect GA4 Button Component
 * @description Button to initiate Google Analytics 4 OAuth flow
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, BarChart3 } from 'lucide-react';

interface ConnectGA4ButtonProps {
  onConnect?: () => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export function ConnectGA4Button({
  onConnect,
  variant = 'default',
  size = 'default',
  className,
}: ConnectGA4ButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/integrations/ga4/connect', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to initiate connection');
      }

      const { authUrl } = await response.json();

      if (authUrl) {
        window.location.href = authUrl;
      } else {
        console.log('Demo Mode: GA4 connection would redirect to Google OAuth in production');
        onConnect?.();
      }
    } catch (error) {
      console.error('GA4 connect error:', error);
      alert('Unable to connect to Google Analytics 4. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleConnect}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <BarChart3 className="mr-2 h-4 w-4" />
          Connect Google Analytics 4
        </>
      )}
    </Button>
  );
}
