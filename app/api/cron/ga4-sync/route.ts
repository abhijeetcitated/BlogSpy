// @ts-nocheck
/**
 * GA4 Data Sync Cron Job
 * @description Syncs GA4 data for all users every 6 hours
 * 
 * Vercel Cron Schedule: "0 1,7,13,19 * * *" (Every 6 hours, offset by 1 hour from GSC)
 */

import { NextRequest, NextResponse } from 'next/server';
import { ga4Service } from '@/services/ga4.service';

// Verify cron secret to prevent unauthorized access
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (!cronSecret) {
    console.warn('[Cron] CRON_SECRET not configured');
    return false;
  }
  
  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request
    if (!verifyCronSecret(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[Cron] Starting GA4 data sync...');
    const startTime = Date.now();

    // Get all users with active GA4 integration
    const users = await ga4Service.getUsersWithActiveIntegration();
    
    console.log(`[Cron] Found ${users.length} users with GA4 integration`);

    const results = {
      processed: 0,
      succeeded: 0,
      failed: 0,
      tokensRefreshed: 0,
      errors: [] as string[],
    };

    // Process each user
    for (const user of users) {
      try {
        results.processed++;
        
        // Sync GA4 data for this user
        const syncResult = await ga4Service.syncData(user.id, {
          force: false, // Only sync if needed
        });
        
        if (syncResult.tokenRefreshed) {
          results.tokensRefreshed++;
        }
        
        results.succeeded++;
        console.log(`[Cron] Synced GA4 for user ${user.id}: ${syncResult.pagesUpdated} pages`);
        
      } catch (error) {
        results.failed++;
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        results.errors.push(`User ${user.id}: ${errorMsg}`);
        console.error(`[Cron] Failed for user ${user.id}:`, error);
      }
    }

    const duration = Date.now() - startTime;
    console.log(`[Cron] GA4 sync completed in ${duration}ms. Results:`, results);

    return NextResponse.json({
      success: true,
      message: 'GA4 data sync completed',
      duration: `${duration}ms`,
      results,
    });
  } catch (error) {
    console.error('[Cron] Fatal error:', error);
    return NextResponse.json(
      { error: 'Cron job failed' },
      { status: 500 }
    );
  }
}

// Vercel Cron configuration
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max
