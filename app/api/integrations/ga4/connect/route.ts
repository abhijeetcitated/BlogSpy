/**
 * GA4 Connect API Route
 * @description Initiate Google Analytics 4 OAuth flow
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

    // Generate OAuth URL for GA4
    const authUrl = await ga4Service.getAuthUrl(userId);

    return NextResponse.json({
      success: true,
      authUrl,
    });
  } catch (error) {
    console.error('[GA4 Connect Error]:', error);
    return NextResponse.json(
      { error: 'Failed to initiate GA4 connection' },
      { status: 500 }
    );
  }
}
