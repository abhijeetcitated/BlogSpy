/**
 * Alert Preferences API Route
 * @description Get and update user alert preferences
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/clerk';
import { alertsService } from '@/services/alerts.service';

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthUserId();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const preferences = await alertsService.getPreferences(userId);

    return NextResponse.json({
      success: true,
      preferences,
    });
  } catch (error) {
    console.error('[Alert Preferences Error]:', error);
    return NextResponse.json(
      { error: 'Failed to get alert preferences' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = await getAuthUserId();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const preferences = await request.json();

    const updated = await alertsService.savePreferences(userId, preferences);

    return NextResponse.json({
      success: true,
      preferences: updated,
      message: 'Preferences updated successfully',
    });
  } catch (error) {
    console.error('[Update Alert Preferences Error]:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}
