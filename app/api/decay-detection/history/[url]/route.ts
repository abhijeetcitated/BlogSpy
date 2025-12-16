// @ts-nocheck
/**
 * Decay Detection History API Route
 * @description Get decay history for a specific URL
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/clerk';
import { decayDetectionService } from '@/services/decay-detection.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ url: string }> }
) {
  try {
    const userId = await getAuthUserId();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { url } = await params;
    const decodedUrl = decodeURIComponent(url);

    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '90');

    const history = await decayDetectionService.getDecayHistory(userId, decodedUrl, { days });

    return NextResponse.json({
      success: true,
      url: decodedUrl,
      history,
    });
  } catch (error) {
    console.error('[Decay History Error]:', error);
    return NextResponse.json(
      { error: 'Failed to get decay history' },
      { status: 500 }
    );
  }
}
