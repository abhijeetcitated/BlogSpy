/**
 * GA4 Status API Route
 * @description Get Google Analytics 4 connection status
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/clerk';
import { ga4Service } from '@/services/ga4.service';

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthUserId();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const status = await ga4Service.getConnectionStatus(userId);

    return NextResponse.json({
      success: true,
      ...status,
    });
  } catch (error) {
    console.error('[GA4 Status Error]:', error);
    return NextResponse.json(
      { error: 'Failed to get GA4 status' },
      { status: 500 }
    );
  }
}
