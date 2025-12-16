// @ts-nocheck
/**
 * Alert Digest Cron Job
 * @description Sends weekly alert digest to users who prefer summary emails
 * 
 * Vercel Cron Schedule: 0 9 * * 1 (Every Monday at 9 AM UTC)
 */

import { NextRequest, NextResponse } from 'next/server';
import { alertsService } from '@/services/alerts.service';

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

    console.log('[Cron] Starting weekly alert digest...');
    const startTime = Date.now();

    // Get all users who want digest emails
    const users = await alertsService.getUsersWithDigestEnabled();
    
    console.log(`[Cron] Found ${users.length} users with digest enabled`);

    const results = {
      processed: 0,
      sent: 0,
      skipped: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Process each user
    for (const user of users) {
      try {
        results.processed++;
        
        // Generate and send digest
        const digestResult = await alertsService.sendWeeklyDigest(user.id);
        
        if (digestResult.sent) {
          results.sent++;
          console.log(`[Cron] Sent digest to user ${user.id}`);
        } else {
          results.skipped++;
          console.log(`[Cron] Skipped digest for user ${user.id}: no alerts`);
        }
        
      } catch (error) {
        results.failed++;
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        results.errors.push(`User ${user.id}: ${errorMsg}`);
        console.error(`[Cron] Failed for user ${user.id}:`, error);
      }
    }

    const duration = Date.now() - startTime;
    console.log(`[Cron] Alert digest completed in ${duration}ms. Results:`, results);

    return NextResponse.json({
      success: true,
      message: 'Weekly alert digest completed',
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
