import { NextRequest } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getClerkUser } from '@/lib/clerk-auth';
import { successResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated with Clerk
    // Try both auth() and currentUser() for better reliability
    const { userId } = await auth();
    
    if (!userId) {
      console.log('GET /api/auth/me: No userId from Clerk auth()');
      // Try currentUser as fallback
      const clerkUser = await currentUser();
      if (!clerkUser) {
        console.log('GET /api/auth/me: No user from Clerk currentUser()');
        return unauthorizedResponse('User not authenticated');
      }
      console.log('GET /api/auth/me: Found user via currentUser(), id:', clerkUser.id);
    } else {
      console.log('GET /api/auth/me: User authenticated, userId:', userId);
    }

    // Get user from database (this will create if doesn't exist)
    const user = await getClerkUser();

    if (!user) {
      console.log('GET /api/auth/me: User not found in database after sync attempt');
      return unauthorizedResponse('User not found in database');
    }

    console.log('GET /api/auth/me: User found in database:', user.id, user.email);

    // Return user without sensitive data
    const { passwordHash, ...userWithoutPassword } = user;

    return successResponse(
      {
        user: userWithoutPassword,
      },
      'User retrieved successfully'
    );
  } catch (error) {
    console.error('GET /api/auth/me error:', error);
    return serverErrorResponse('Failed to get user', (error as Error).message);
  }
}
