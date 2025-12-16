// @ts-nocheck
/**
 * Alert Actions API Route
 * @description Dismiss or acknowledge an alert
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/clerk';
import { alertsService } from '@/services/alerts.service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthUserId();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: alertId } = await params;
    const { action } = await request.json();

    if (!['dismiss', 'acknowledge', 'snooze'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be dismiss, acknowledge, or snooze' },
        { status: 400 }
      );
    }

    const result = await alertsService.updateAlertStatus(userId, alertId, action);

    return NextResponse.json({
      success: true,
      alert: result,
      message: `Alert ${action}ed successfully`,
    });
  } catch (error) {
    console.error('[Alert Action Error]:', error);
    return NextResponse.json(
      { error: 'Failed to update alert' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthUserId();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: alertId } = await params;

    await alertsService.deleteAlert(userId, alertId);

    return NextResponse.json({
      success: true,
      message: 'Alert deleted successfully',
    });
  } catch (error) {
    console.error('[Delete Alert Error]:', error);
    return NextResponse.json(
      { error: 'Failed to delete alert' },
      { status: 500 }
    );
  }
}
