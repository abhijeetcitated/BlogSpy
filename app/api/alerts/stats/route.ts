/**
 * Alert Statistics API Route
 * @description Get alert statistics and analytics
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

    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '30');

    const stats = await alertsService.getStatistics(userId, days);

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('[Alert Stats Error]:', error);
    return NextResponse.json(
      { error: 'Failed to get alert statistics' },
      { status: 500 }
    );
  }
}
