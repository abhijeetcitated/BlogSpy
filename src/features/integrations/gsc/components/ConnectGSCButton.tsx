'use client';

/**
 * Connect GSC Button Component
 * @description Button to initiate Google Search Console OAuth flow
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Link2 } from 'lucide-react';

interface ConnectGSCButtonProps {
  onConnect?: () => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export function ConnectGSCButton({
  onConnect,
  variant = 'default',
  size = 'default',
  className,
}: ConnectGSCButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      
      // Call API to get OAuth URL
      const response = await fetch('/api/integrations/gsc/connect', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to initiate connection');
      }

      const { authUrl } = await response.json();

      // Redirect to Google OAuth
      if (authUrl) {
        window.location.href = authUrl;
      } else {
        // For demo/mock mode
        console.log('Demo Mode: GSC connection would redirect to Google OAuth in production');
        onConnect?.();
      }
    } catch (error) {
      console.error('GSC connect error:', error);
      alert('Unable to connect to Google Search Console. Please try again.');
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
          <Link2 className="mr-2 h-4 w-4" />
          Connect Google Search Console
        </>
      )}
    </Button>
  );
}
