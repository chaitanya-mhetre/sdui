import { NextRequest } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getClerkUser } from '@/lib/clerk-auth';
import { prisma } from '@/lib/db';
import { successResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api-response';

/**
 * Test endpoint to verify user creation
 * This will help debug why users aren't being stored
 */
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return new Response('Not found', { status: 404 });
  }

  try {
    console.log('=== TEST USER CREATION ENDPOINT ===');
    
    // Check Clerk auth
    const { userId } = await auth();
    console.log('1. Clerk userId:', userId);
    
    if (!userId) {
      return unauthorizedResponse('Not authenticated with Clerk');
    }
    
    // Get Clerk user
    const clerkUser = await currentUser();
    console.log('2. Clerk user:', clerkUser ? {
      id: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
    } : 'null');
    
    if (!clerkUser) {
      return unauthorizedResponse('Could not get Clerk user');
    }
    
    // Check if user exists in DB
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });
    console.log('3. Existing user in DB:', existingUser ? {
      id: existingUser.id,
      email: existingUser.email,
      clerkId: existingUser.clerkId,
    } : 'null');
    
    // Try to get/create user
    console.log('4. Calling getClerkUser()...');
    const user = await getClerkUser();
    console.log('5. Result from getClerkUser():', user ? {
      id: user.id,
      email: user.email,
      clerkId: user.clerkId,
    } : 'null');
    
    // Verify user exists now
    const verifyUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });
    console.log('6. User in DB after getClerkUser():', verifyUser ? {
      id: verifyUser.id,
      email: verifyUser.email,
      clerkId: verifyUser.clerkId,
    } : 'null');
    
    return successResponse({
      clerkUserId: userId,
      clerkUserEmail: clerkUser.emailAddresses[0]?.emailAddress,
      userInDb: verifyUser ? {
        id: verifyUser.id,
        email: verifyUser.email,
        clerkId: verifyUser.clerkId,
      } : null,
      message: verifyUser ? 'User exists in database' : 'User NOT found in database',
    }, 'Test completed - check server logs for details');
  } catch (error: any) {
    console.error('❌ Test endpoint error:', error);
    return serverErrorResponse('Test failed', error?.message || 'Unknown error');
  }
}
