/**
 * GA4 Disconnect API Route
 * @description Disconnect Google Analytics 4 integration
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

    await ga4Service.disconnect(userId);

    return NextResponse.json({
      success: true,
      message: 'GA4 disconnected successfully',
    });
  } catch (error) {
    console.error('[GA4 Disconnect Error]:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect GA4' },
      { status: 500 }
    );
  }
}
