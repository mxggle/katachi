import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@/lib/supabase/server';

export async function proxy(request: NextRequest) {
  const client = createMiddlewareClient(request);

  if (client.supabase) {
    await client.supabase.auth.getUser();
  }

  return client.response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
