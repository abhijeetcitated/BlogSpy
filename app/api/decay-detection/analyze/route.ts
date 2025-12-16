// @ts-nocheck
/**
 * Decay Detection Analyze API Route
 * @description Trigger decay analysis for a specific URL or all URLs
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/clerk';
import { decayDetectionService } from '@/services/decay-detection.service';

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthUserId();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { url, force = false } = body;

    if (url) {
      // Analyze single URL
      const result = await decayDetectionService.analyzeUrl(userId, url, { force });
      
      return NextResponse.json({
        success: true,
        result,
      });
    } else {
      // Trigger batch analysis for all URLs
      const job = await decayDetectionService.triggerBatchAnalysis(userId, { force });
      
      return NextResponse.json({
        success: true,
        job,
        message: 'Batch analysis started',
      });
    }
  } catch (error) {
    console.error('[Decay Analyze Error]:', error);
    return NextResponse.json(
      { error: 'Failed to analyze content decay' },
      { status: 500 }
    );
  }
}
