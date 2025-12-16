// @ts-nocheck
/**
 * GSC OAuth Callback Route
 * @description Handle Google Search Console OAuth callback
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/clerk';
import { gscService } from '@/services/gsc.service';

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthUserId();
    
    if (!userId) {
      // Redirect to login if not authenticated
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      console.error('[GSC Callback Error]:', error);
      return NextResponse.redirect(
        new URL('/settings/integrations?error=gsc_auth_failed', request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/settings/integrations?error=gsc_no_code', request.url)
      );
    }

    // Exchange code for tokens and save integration
    await gscService.handleCallback(userId, code);

    // Redirect to success page
    return NextResponse.redirect(
      new URL('/settings/integrations?success=gsc_connected', request.url)
    );
  } catch (error) {
    console.error('[GSC Callback Error]:', error);
    return NextResponse.redirect(
      new URL('/settings/integrations?error=gsc_callback_failed', request.url)
    );
  }
}
