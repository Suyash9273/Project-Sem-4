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

  // 1. Get the user from Supabase securely
  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  // 2. Define Protected Routes for CampusConnect
  // Add all the routes that require a user to be logged in
  const isProtectedRoute = path.startsWith('/protected/feed') || 
                           path.startsWith('/protected/chat') || 
                           path.startsWith('/protected/inbox') || 
                           path.startsWith('/protected/report') ||
                           path.startsWith('/protected/protected')

  if (isProtectedRoute) {
    // If no user is found, redirect them to the root login page
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/' 
      return NextResponse.redirect(url)
    }
  }

  // 3. Define Auth Routes (Login/Signup)
  // If user is ALREADY logged in and tries to go to the login page (root '/' or '/login')
  if (path === '/' || path.startsWith('/login')) {
    if (user) {
      const url = request.nextUrl.clone()
      url.pathname = '/protected/feed' // Kick them straight to the main feed
      return NextResponse.redirect(url)
    }
  }

  return response
}