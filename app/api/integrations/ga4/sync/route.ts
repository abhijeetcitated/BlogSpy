// @ts-nocheck
/**
 * GA4 Sync API Route
 * @description Trigger manual sync of GA4 data
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/clerk';
import { ga4Service } from '@/services/ga4.service';

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

    const result = await ga4Service.syncData(userId, { force });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('[GA4 Sync Error]:', error);
    return NextResponse.json(
      { error: 'Failed to sync GA4 data' },
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

    const syncStatus = await ga4Service.getSyncStatus(userId);

    return NextResponse.json({
      success: true,
      ...syncStatus,
    });
  } catch (error) {
    console.error('[GA4 Sync Status Error]:', error);
    return NextResponse.json(
      { error: 'Failed to get sync status' },
      { status: 500 }
    );
  }
}
