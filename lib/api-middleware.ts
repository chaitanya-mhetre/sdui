import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserById, getUserByApiKey, isAdmin, isUserActive } from './auth';
import { getClerkUser } from './clerk-auth';
import { unauthorizedResponse, forbiddenResponse, serverErrorResponse } from './api-response';
import type { UserRole } from '@prisma/client';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    name: string | null;
    role: UserRole;
    plan: string;
    status: string;
  };
}

/**
 * Middleware to authenticate user via Clerk session or API key
 */
export async function authenticateRequest(
  request: NextRequest
): Promise<AuthenticatedRequest | NextResponse> {
  try {
    // Try to get user from Authorization header (API key) - for programmatic access
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const apiKey = authHeader.substring(7);
      const user = await getUserByApiKey(apiKey);
      
      if (!user) {
        return unauthorizedResponse('Invalid API key');
      }

      if (!isUserActive(user.status)) {
        return forbiddenResponse('Account is suspended or deleted');
      }

      (request as AuthenticatedRequest).user = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        plan: user.plan,
        status: user.status,
      };

      return request as AuthenticatedRequest;
    }

    // Try to get user from Clerk session (for web requests)
    const { userId } = await auth();
    if (userId) {
      const user = await getClerkUser();
      
      if (!user) {
        return unauthorizedResponse('User not found in database');
      }

      if (!isUserActive(user.status)) {
        return forbiddenResponse('Account is suspended or deleted');
      }

      (request as AuthenticatedRequest).user = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        plan: user.plan,
        status: user.status,
      };

      return request as AuthenticatedRequest;
    }

    return unauthorizedResponse('Authentication required');
  } catch (error) {
    console.error('Authentication error:', error);
    return serverErrorResponse('Authentication failed', (error as Error).message);
  }
}

/**
 * Middleware to require authentication
 */
export function requireAuth(
  handler: (request: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const authResult = await authenticateRequest(request);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    return handler(authResult);
  };
}

/**
 * Middleware to require admin role
 */
export function requireAdmin(
  handler: (request: AuthenticatedRequest) => Promise<NextResponse>
) {
  return requireAuth(async (request: AuthenticatedRequest) => {
    if (!request.user) {
      return unauthorizedResponse('Authentication required');
    }

    if (!isAdmin(request.user.role)) {
      return forbiddenResponse('Admin access required');
    }

    return handler(request);
  });
}

/**
 * Middleware to require super admin role
 */
export function requireSuperAdmin(
  handler: (request: AuthenticatedRequest) => Promise<NextResponse>
) {
  return requireAuth(async (request: AuthenticatedRequest) => {
    if (!request.user) {
      return unauthorizedResponse('Authentication required');
    }

    if (request.user.role !== 'SUPER_ADMIN') {
      return forbiddenResponse('Super admin access required');
    }

    return handler(request);
  });
}

/**
 * Middleware to require ownership or admin
 */
export function requireOwnershipOrAdmin(
  handler: (request: AuthenticatedRequest, resourceUserId: string) => Promise<NextResponse>
) {
  return requireAuth(async (request: AuthenticatedRequest) => {
    if (!request.user) {
      return unauthorizedResponse('Authentication required');
    }

    // Extract resource user ID from URL or body
    const url = new URL(request.url);
    const resourceId = url.pathname.split('/').pop();

    // This is a simplified check - in real implementation, fetch the resource
    // and check ownership
    const isOwner = request.user.id === resourceUserId;
    const isAdminUser = isAdmin(request.user.role);

    if (!isOwner && !isAdminUser) {
      return forbiddenResponse('You do not have permission to access this resource');
    }

    return handler(request, resourceUserId);
  });
}
