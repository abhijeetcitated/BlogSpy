/**
 * Decay Detection Scores API Route
 * @description Get and manage decay scores
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
    const level = searchParams.get('level') as 'critical' | 'high' | 'medium' | 'low' | 'healthy' | null;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const result = await decayDetectionService.getDecayScores(userId, {
      level: level || undefined,
      limit,
      offset,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('[Decay Scores Error]:', error);
    return NextResponse.json(
      { error: 'Failed to get decay scores' },
      { status: 500 }
    );
  }
}
