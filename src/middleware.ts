import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  // Check auth status
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If user is not signed in and the current path is not /login redirect the user to /login
  if (!session && request.nextUrl.pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If user is signed in and the current path is /login redirect the user to /dashboard
  if (session && request.nextUrl.pathname === '/login') {
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

// Ensure middleware runs on all routes except public assets
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
} 