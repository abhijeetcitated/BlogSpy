// @ts-nocheck
/**
 * GA4 Properties API Route
 * @description Get list of GA4 properties
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

    const properties = await ga4Service.getProperties(userId);

    return NextResponse.json({
      success: true,
      properties,
    });
  } catch (error) {
    console.error('[GA4 Properties Error]:', error);
    return NextResponse.json(
      { error: 'Failed to get GA4 properties' },
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

    const { propertyId } = await request.json();

    if (!propertyId) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      );
    }

    await ga4Service.selectProperty(userId, propertyId);

    return NextResponse.json({
      success: true,
      message: 'Property selected successfully',
    });
  } catch (error) {
    console.error('[GA4 Select Property Error]:', error);
    return NextResponse.json(
      { error: 'Failed to select property' },
      { status: 500 }
    );
  }
}
