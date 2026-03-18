import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 1. Get the user from Supabase
  const { data: { user } } = await supabase.auth.getUser()

  // 2. Define Protected Routes
  // Add any path here that requires login
  if (request.nextUrl.pathname.startsWith('/api') || request.nextUrl.pathname.startsWith('/protected')) {
    
    // If no user, redirect to login
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  // 3. Define Auth Routes (Login/Signup)
  // If user is ALREADY logged in, they shouldn't see the login page
  if (request.nextUrl.pathname.startsWith('/login')) {
    if (user) {
      const url = request.nextUrl.clone()
      url.pathname = '/api/dashboard' // Redirect to home/dashboard
      return NextResponse.redirect(url)
    }
  }

  return response
}