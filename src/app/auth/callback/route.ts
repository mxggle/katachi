import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(`${origin}/?error=auth_failed`)
  }

  // Must use server client — it has access to response cookies
  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('[katachi] OAuth callback error:', error.message)
    return NextResponse.redirect(`${origin}/?error=auth_failed`)
  }

  return NextResponse.redirect(origin)
}
