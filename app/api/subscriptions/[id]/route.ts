import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api-middleware';
import { prisma } from '@/lib/db';
import { successResponse, notFoundResponse, forbiddenResponse, errorResponse, validationErrorResponse, serverErrorResponse } from '@/lib/api-response';
import { z } from 'zod';
import type { AuthenticatedRequest } from '@/lib/api-middleware';

const updateSubscriptionSchema = z.object({
  status: z.enum(['ACTIVE', 'CANCELLED', 'PAUSED']).optional(),
});

async function getSubscription(request: AuthenticatedRequest) {
  try {
    const url = new URL(request.url);
    const subscriptionId = url.pathname.split('/').pop();

    if (!subscriptionId) {
      return errorResponse('Subscription ID is required', 400);
    }

    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!subscription) {
      return notFoundResponse('Subscription not found');
    }

    // Check ownership or admin
    if (subscription.userId !== request.user?.id && request.user?.role !== 'ADMIN' && request.user?.role !== 'SUPER_ADMIN') {
      return forbiddenResponse('You do not have permission to access this subscription');
    }

    return successResponse(
      {
        subscription,
      },
      'Subscription retrieved successfully'
    );
  } catch (error) {
    console.error('Get subscription error:', error);
    return serverErrorResponse('Failed to get subscription', (error as Error).message);
  }
}

async function updateSubscription(request: AuthenticatedRequest) {
  try {
    const url = new URL(request.url);
    const subscriptionId = url.pathname.split('/').pop();

    if (!subscriptionId) {
      return errorResponse('Subscription ID is required', 400);
    }

    const body = await request.json();

    // Validate input
    const validationResult = updateSubscriptionSchema.safeParse(body);
    if (!validationResult.success) {
      const errors: Record<string, string[]> = {};
      validationResult.error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(err.message);
      });
      return validationErrorResponse(errors);
    }

    // Check if subscription exists
    const existingSubscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!existingSubscription) {
      return notFoundResponse('Subscription not found');
    }

    // Check ownership or admin
    if (existingSubscription.userId !== request.user?.id && request.user?.role !== 'ADMIN' && request.user?.role !== 'SUPER_ADMIN') {
      return forbiddenResponse('You do not have permission to update this subscription');
    }

    // Update subscription
    const subscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: validationResult.data,
    });

    // If cancelled, update user plan to FREE
    if (validationResult.data.status === 'CANCELLED') {
      await prisma.user.update({
        where: { id: existingSubscription.userId },
        data: { plan: 'FREE' },
      });
    }

    return successResponse(
      {
        subscription,
      },
      'Subscription updated successfully'
    );
  } catch (error) {
    console.error('Update subscription error:', error);
    return serverErrorResponse('Failed to update subscription', (error as Error).message);
  }
}

export const GET = requireAuth(getSubscription);
export const PATCH = requireAuth(updateSubscription);
