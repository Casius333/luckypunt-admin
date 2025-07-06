import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  
  try {
    const supabase = createMiddlewareClient({ req: request, res })

    // Check auth status with error handling
    const {
      data: { session },
      error
    } = await supabase.auth.getSession()

    // If there's an auth error, redirect to login to clear corrupted session
    if (error) {
      console.log('Auth error in middleware:', error.message)
      if (request.nextUrl.pathname !== '/login') {
        return NextResponse.redirect(new URL('/login', request.url))
      }
      return res
    }

    // If user is not signed in and the current path is not login, redirect to login
    if (!session && request.nextUrl.pathname !== '/login' && request.nextUrl.pathname !== '/') {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // If user is signed in and the current path is / or /login, redirect to dashboard
    if (session && (request.nextUrl.pathname === '/' || request.nextUrl.pathname === '/login')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // For settings page, check if user is an admin
    if (request.nextUrl.pathname.startsWith('/dashboard/settings') && session) {
      const { data: adminUser } = await supabase
        .from('admin_users')
        .select('role')
        .eq('user_id', session.user?.id)
        .single()

      if (!adminUser) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    return res
  } catch (error) {
    // If there's any error in middleware, log it and redirect to login to reset session
    console.error('Middleware error:', error)
    if (request.nextUrl.pathname !== '/login') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return res
  }
}

export const config = {
  matcher: ['/', '/login', '/dashboard/:path*']
} 