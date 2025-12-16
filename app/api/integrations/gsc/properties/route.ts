// @ts-nocheck
/**
 * GSC Properties API Route
 * @description Get list of verified GSC properties (sites)
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

    const properties = await gscService.getProperties(userId);

    return NextResponse.json({
      success: true,
      properties,
    });
  } catch (error) {
    console.error('[GSC Properties Error]:', error);
    return NextResponse.json(
      { error: 'Failed to get GSC properties' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthUserId();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { propertyUrl } = await request.json();

    if (!propertyUrl) {
      return NextResponse.json(
        { error: 'Property URL is required' },
        { status: 400 }
      );
    }

    await gscService.selectProperty(userId, propertyUrl);

    return NextResponse.json({
      success: true,
      message: 'Property selected successfully',
    });
  } catch (error) {
    console.error('[GSC Select Property Error]:', error);
    return NextResponse.json(
      { error: 'Failed to select property' },
      { status: 500 }
    );
  }
}
