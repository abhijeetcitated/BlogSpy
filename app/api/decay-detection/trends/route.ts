// @ts-nocheck
/**
 * Decay Detection Trends API Route
 * @description Get decay trends and insights
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/clerk';
import { decayDetectionService } from '@/services/decay-detection.service';

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthUserId();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '30');

    const trends = await decayDetectionService.getDecayTrends(userId, { days });

    return NextResponse.json({
      success: true,
      trends,
    });
  } catch (error) {
    console.error('[Decay Trends Error]:', error);
    return NextResponse.json(
      { error: 'Failed to get decay trends' },
      { status: 500 }
    );
  }
}
