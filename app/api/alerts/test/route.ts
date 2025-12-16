// @ts-nocheck
/**
 * Test Alert API Route
 * @description Send a test alert to verify configuration
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/clerk';
import { alertsService } from '@/services/alerts.service';

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthUserId();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { channel } = await request.json();

    if (!channel) {
      return NextResponse.json(
        { error: 'Channel is required (email, slack, or webhook)' },
        { status: 400 }
      );
    }

    const result = await alertsService.sendTestAlert(userId, channel);

    return NextResponse.json({
      success: true,
      result,
      message: `Test alert sent to ${channel}`,
    });
  } catch (error) {
    console.error('[Test Alert Error]:', error);
    return NextResponse.json(
      { error: 'Failed to send test alert' },
      { status: 500 }
    );
  }
}
