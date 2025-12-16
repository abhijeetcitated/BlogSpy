// @ts-nocheck
/**
 * GSC Sync API Route
 * @description Trigger manual sync of GSC data
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

    const { force = false } = await request.json().catch(() => ({}));

    const result = await gscService.syncData(userId, { force });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('[GSC Sync Error]:', error);
    return NextResponse.json(
      { error: 'Failed to sync GSC data' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthUserId();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const syncStatus = await gscService.getSyncStatus(userId);

    return NextResponse.json({
      success: true,
      ...syncStatus,
    });
  } catch (error) {
    console.error('[GSC Sync Status Error]:', error);
    return NextResponse.json(
      { error: 'Failed to get sync status' },
      { status: 500 }
    );
  }
}
