import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Define the routes you want to protect
const isProtectedRoute = createRouteMatcher(['/dashboard(.*)', '/api(.*)'])

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth()

  // 1. If user is trying to access a protected route
  if (isProtectedRoute(req)) {
    // 2. Enforce login first
    await auth.protect()

    // 3. Custom Logic: Check Email Domain
    // We cast sessionClaims to any because we added custom claims in Step 1
    const userEmail = (sessionClaims as any)?.email as string | undefined
    
    // Change this to your specific college domain
    const COLLEGE_DOMAIN = '@nitdelhi.ac.in' 

    if (userEmail && !userEmail.endsWith(COLLEGE_DOMAIN)) {
      // If email doesn't match, return a 403 or redirect to an error page
      return NextResponse.json({error: "Signup/ Login allowed with only college mail"}, { status: 403 })
      // OR: Redirect to a custom page
      // return NextResponse.redirect(new URL('/unauthorized', req.url))
    }
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}