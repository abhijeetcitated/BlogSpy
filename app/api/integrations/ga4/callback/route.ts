// @ts-nocheck
/**
 * GA4 OAuth Callback Route
 * @description Handle Google Analytics 4 OAuth callback
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/clerk';
import { ga4Service } from '@/services/ga4.service';

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
      console.error('[GA4 Callback Error]:', error);
      return NextResponse.redirect(
        new URL('/settings/integrations?error=ga4_auth_failed', request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/settings/integrations?error=ga4_no_code', request.url)
      );
    }

    // Exchange code for tokens and save integration
    await ga4Service.handleCallback(userId, code);

    // Redirect to success page
    return NextResponse.redirect(
      new URL('/settings/integrations?success=ga4_connected', request.url)
    );
  } catch (error) {
    console.error('[GA4 Callback Error]:', error);
    return NextResponse.redirect(
      new URL('/settings/integrations?error=ga4_callback_failed', request.url)
    );
  }
}
