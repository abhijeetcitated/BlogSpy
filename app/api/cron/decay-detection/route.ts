// @ts-nocheck
/**
 * Daily Decay Detection Cron Job
 * @description Runs daily to detect content decay for all users
 * 
 * Vercel Cron Schedule: 0 6 * * * (Every day at 6 AM UTC)
 */

import { NextRequest, NextResponse } from 'next/server';
import { decayDetectionService } from '@/services/decay-detection.service';
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

    console.log('[Cron] Starting daily decay detection...');
    const startTime = Date.now();

    // Get all users with active GSC integration
    const users = await decayDetectionService.getUsersWithActiveIntegration();
    
    console.log(`[Cron] Found ${users.length} users with active integrations`);

    const results = {
      processed: 0,
      succeeded: 0,
      failed: 0,
      alertsSent: 0,
      errors: [] as string[],
    };

    // Process each user
    for (const user of users) {
      try {
        results.processed++;
        
        // Run decay analysis for this user
        const analysisResult = await decayDetectionService.triggerBatchAnalysis(user.id, {
          force: false, // Only analyze if data is stale
        });
        
        // Check for critical decay and send alerts
        if (analysisResult.criticalCount > 0 || analysisResult.highCount > 0) {
          const alertResult = await alertsService.sendDecayAlerts(user.id, analysisResult);
          results.alertsSent += alertResult.sentCount;
        }
        
        results.succeeded++;
        console.log(`[Cron] Processed user ${user.id}: ${analysisResult.totalAnalyzed} URLs`);
        
      } catch (error) {
        results.failed++;
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        results.errors.push(`User ${user.id}: ${errorMsg}`);
        console.error(`[Cron] Failed for user ${user.id}:`, error);
      }
    }

    const duration = Date.now() - startTime;
    console.log(`[Cron] Completed in ${duration}ms. Results:`, results);

    return NextResponse.json({
      success: true,
      message: 'Daily decay detection completed',
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
