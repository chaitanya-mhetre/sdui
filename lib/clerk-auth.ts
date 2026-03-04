import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from './db';
import { generateApiKey } from './auth';
import { logger } from './logger';

/**
 * Get current user from Clerk and sync with database
 * This ensures users are ALWAYS stored in our database
 */
export async function getClerkUser() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      logger.log('No Clerk userId found');
      return null;
    }

    // Get user from Clerk
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      logger.log('No Clerk user found for userId:', userId);
      return null;
    }

    // Get primary email
    const primaryEmail = clerkUser.emailAddresses.find(
      (email) => email.id === clerkUser.primaryEmailAddressId
    ) || clerkUser.emailAddresses[0];

    if (!primaryEmail) {
      logger.error('No email found for Clerk user:', userId);
      return null;
    }

    const email = primaryEmail.emailAddress;

    // Try to find user by Clerk ID first
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    // If not found, try by email
    if (!user) {
      user = await prisma.user.findUnique({
        where: { email },
      });

      // If found by email, update with Clerk ID
      if (user) {
        logger.log('User found by email, updating with Clerk ID:', email);
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            clerkId: userId,
            imageUrl: clerkUser.imageUrl,
            emailVerified: primaryEmail.verification?.status === 'verified',
            name: clerkUser.firstName && clerkUser.lastName
              ? `${clerkUser.firstName} ${clerkUser.lastName}`
              : clerkUser.firstName || clerkUser.lastName || user.name,
          },
        });
      }
    }

    // If still not found, CREATE new user in database
    if (!user) {
      logger.log('Creating new user in database:', email, 'clerkId:', userId);
      const apiKey = generateApiKey();
      
      try {
        const userData = {
          clerkId: userId,
          email,
          name: clerkUser.firstName && clerkUser.lastName
            ? `${clerkUser.firstName} ${clerkUser.lastName}`
            : clerkUser.firstName || clerkUser.lastName || null,
          imageUrl: clerkUser.imageUrl,
          emailVerified: primaryEmail.verification?.status === 'verified',
          apiKey,
          role: 'USER' as const,
          plan: 'FREE' as const,
          status: 'ACTIVE' as const,
        };
        
        logger.log('Attempting to create user with data:', JSON.stringify(userData, null, 2));
        
        user = await prisma.user.create({
          data: userData,
        });
        logger.log('✅ User created successfully in database:', user.id, user.email);
      } catch (createError: any) {
        logger.error('❌ Error creating user:', createError);
        logger.error('Error details:', {
          code: createError.code,
          message: createError.message,
          meta: createError.meta,
        });
        
        // If email already exists (race condition), try to find and update
        if (createError.code === 'P2002') {
          logger.log('User already exists (P2002), trying to find and update...');
          user = await prisma.user.findUnique({
            where: { email },
          });
          if (user) {
            logger.log('Found existing user by email, updating with Clerk ID...');
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                clerkId: userId,
                imageUrl: clerkUser.imageUrl,
                emailVerified: primaryEmail.verification?.status === 'verified',
              },
            });
            logger.log('✅ User updated with Clerk ID:', user.id);
          }
        } else {
          // Re-throw to be caught by outer try-catch
          throw createError;
        }
      }
    } else {
      // Update user info and last login
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          lastLogin: new Date(),
          imageUrl: clerkUser.imageUrl || user.imageUrl,
          name: clerkUser.firstName && clerkUser.lastName
            ? `${clerkUser.firstName} ${clerkUser.lastName}`
            : clerkUser.firstName || clerkUser.lastName || user.name,
          emailVerified: primaryEmail.verification?.status === 'verified',
        },
      });
    }

    return user;
  } catch (error: any) {
    logger.error('❌ Error getting Clerk user:', error);
    logger.error('Error stack:', error?.stack);
    logger.error('Error details:', {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
    });
    return null;
  }
}

/**
 * Get user ID from Clerk session
 */
export async function getClerkUserId(): Promise<string | null> {
  try {
    const { userId } = await auth();
    return userId;
  } catch (error) {
    return null;
  }
}
