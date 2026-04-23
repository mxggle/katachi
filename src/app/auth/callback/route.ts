import { NextResponse, type NextRequest } from 'next/server';
import { createRouteClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const redirectTo = new URL('/', requestUrl.origin);

  if (!code) {
    redirectTo.searchParams.set('error', 'auth_failed');
    return NextResponse.redirect(redirectTo);
  }

  const supabase = await createRouteClient();

  if (!supabase) {
    redirectTo.searchParams.set('error', 'auth_unconfigured');
    return NextResponse.redirect(redirectTo);
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    redirectTo.searchParams.set('error', 'auth_failed');
  }

  return NextResponse.redirect(redirectTo);
}
