/**
 * GSC Status API Route
 * @description Get Google Search Console connection status
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/clerk';
import { gscService } from '@/services/gsc.service';

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthUserId();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const status = await gscService.getConnectionStatus(userId);

    return NextResponse.json({
      success: true,
      ...status,
    });
  } catch (error) {
    console.error('[GSC Status Error]:', error);
    return NextResponse.json(
      { error: 'Failed to get GSC status' },
      { status: 500 }
    );
  }
}
