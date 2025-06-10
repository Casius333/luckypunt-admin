import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  // Check auth status
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If user is not signed in and the current path is not / redirect the user to /
  if (!session && request.nextUrl.pathname !== '/') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // If user is signed in and the current path is / redirect the user to /dashboard
  if (session && request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // For settings page, check if user is an admin
  if (request.nextUrl.pathname.startsWith('/dashboard/settings')) {
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', session?.user?.id)
      .single()

    if (!adminUser) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/', '/dashboard/:path*']
} 