/**
 * GSC Connect API Route
 * @description Initiate Google Search Console OAuth flow
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/clerk';
import { gscService } from '@/services/gsc.service';

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthUserId();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Generate OAuth URL for GSC
    const authUrl = await gscService.getAuthUrl(userId);

    return NextResponse.json({
      success: true,
      authUrl,
    });
  } catch (error) {
    console.error('[GSC Connect Error]:', error);
    return NextResponse.json(
      { error: 'Failed to initiate GSC connection' },
      { status: 500 }
    );
  }
}
