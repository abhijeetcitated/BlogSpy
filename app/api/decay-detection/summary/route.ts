/**
 * Decay Detection Summary API Route
 * @description Get decay summary and statistics
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

    const summary = await decayDetectionService.getSummary(userId);

    return NextResponse.json({
      success: true,
      summary,
    });
  } catch (error) {
    console.error('[Decay Summary Error]:', error);
    return NextResponse.json(
      { error: 'Failed to get decay summary' },
      { status: 500 }
    );
  }
}
