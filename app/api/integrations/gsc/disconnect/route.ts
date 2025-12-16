/**
 * GSC Disconnect API Route
 * @description Disconnect Google Search Console integration
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/clerk';
import { gscService } from '@/services/gsc.service';

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthUserId();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await gscService.disconnect(userId);

    return NextResponse.json({
      success: true,
      message: 'GSC disconnected successfully',
    });
  } catch (error) {
    console.error('[GSC Disconnect Error]:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect GSC' },
      { status: 500 }
    );
  }
}
