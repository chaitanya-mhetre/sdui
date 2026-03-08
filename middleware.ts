import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/login(.*)',
  '/signup(.*)',
  '/pricing',
  '/features',
  '/docs',
  '/api/auth/webhook(.*)', // Clerk webhook
  '/api/auth/register(.*)', // Public registration
  '/api/auth/login(.*)', // Public login
  '/api/v1/screens(.*)', // Public Flutter SDK endpoint
  '/sitemap.xml',
  '/robots.txt',
]);

// API routes that handle their own authentication
const isApiRoute = createRouteMatcher(['/api(.*)']);

// Check if Clerk is properly configured
const isClerkConfigured = () => {
  try {
    return !!(
      process.env.CLERK_SECRET_KEY &&
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
    );
  } catch {
    return false;
  }
};

// Create the Clerk middleware with error handling
let clerkAuthMiddleware: ((request: NextRequest) => Promise<NextResponse>) | null = null;

try {
  if (isClerkConfigured()) {
    clerkAuthMiddleware = clerkMiddleware(async (auth, request) => {
      try {
        // Don't protect API routes - they handle their own authentication
        if (isApiRoute(request)) {
          return;
        }

        // Protect all other routes except public ones
        if (!isPublicRoute(request)) {
          await auth.protect();
        }
      } catch (error) {
        // Log error but don't fail the request for public routes
        console.error('Middleware error:', error);
        
        // If it's a public route, allow it through
        if (isPublicRoute(request) || isApiRoute(request)) {
          return;
        }
        
        // For protected routes, re-throw the error
        throw error;
      }
    });
  }
} catch (error) {
  console.error('[Middleware] Failed to initialize Clerk middleware:', error);
  clerkAuthMiddleware = null;
}

// Export middleware - use Clerk if configured, otherwise passthrough
export default async function middleware(request: NextRequest) {
  // If Clerk middleware is not available, allow all requests through
  if (!clerkAuthMiddleware) {
    // Allow API and public routes
    if (isApiRoute(request) || isPublicRoute(request)) {
      return NextResponse.next();
    }
    // For protected routes, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Use Clerk middleware
  try {
    return await clerkAuthMiddleware(request);
  } catch (error) {
    console.error('[Middleware] Clerk middleware failed:', error);
    // On error, allow API and public routes through
    if (isApiRoute(request) || isPublicRoute(request)) {
      return NextResponse.next();
    }
    // For protected routes, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
