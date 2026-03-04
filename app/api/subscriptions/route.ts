import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api-middleware';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse, validationErrorResponse, serverErrorResponse } from '@/lib/api-response';
import { z } from 'zod';
import type { AuthenticatedRequest } from '@/lib/api-middleware';

const createSubscriptionSchema = z.object({
  plan: z.enum(['FREE', 'STARTER', 'PRO', 'ENTERPRISE']),
  userId: z.string().optional(), // Optional for admin creating subscriptions for other users
});

async function getSubscriptions(request: AuthenticatedRequest) {
  try {
    if (!request.user) {
      throw new Error('User not found');
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status') as any;

    // Build where clause
    const where: any = {};
    
    // If not admin, only show own subscriptions
    if (request.user.role !== 'ADMIN' && request.user.role !== 'SUPER_ADMIN') {
      where.userId = request.user.id;
    } else if (userId) {
      where.userId = userId;
    }
    
    if (status) {
      where.status = status;
    }

    const subscriptions = await prisma.subscription.findMany({
      where,
      orderBy: { createdAt: 'desc' },
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

    return successResponse(
      {
        subscriptions,
      },
      'Subscriptions retrieved successfully'
    );
  } catch (error) {
    console.error('Get subscriptions error:', error);
    return serverErrorResponse('Failed to get subscriptions', (error as Error).message);
  }
}

async function createSubscription(request: AuthenticatedRequest) {
  try {
    if (!request.user) {
      throw new Error('User not found');
    }

    const body = await request.json();

    // Validate input
    const validationResult = createSubscriptionSchema.safeParse(body);
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

    const { plan, userId: targetUserId } = validationResult.data;

    // Determine target user
    const targetUserIdFinal = targetUserId && (request.user.role === 'ADMIN' || request.user.role === 'SUPER_ADMIN')
      ? targetUserId
      : request.user.id;

    // Get pricing plan details
    const pricingPlan = await prisma.pricingPlan.findUnique({
      where: { slug: plan },
    });

    if (!pricingPlan) {
      return errorResponse('Pricing plan not found', 404);
    }

    if (!pricingPlan.isActive) {
      return errorResponse('Pricing plan is not active', 400);
    }

    // Check if user already has an active subscription
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        userId: targetUserIdFinal,
        status: 'ACTIVE',
      },
    });

    if (existingSubscription) {
      return errorResponse('User already has an active subscription', 400, 'SUBSCRIPTION_EXISTS');
    }

    // Calculate renewal date (30 days from now)
    const renewalDate = new Date();
    renewalDate.setDate(renewalDate.getDate() + 30);

    // Create subscription
    const subscription = await prisma.subscription.create({
      data: {
        userId: targetUserIdFinal,
        plan: pricingPlan.slug,
        monthlyPrice: pricingPlan.monthlyPrice,
        yearlyPrice: pricingPlan.yearlyPrice,
        apiLimit: pricingPlan.apiLimit,
        layoutLimit: pricingPlan.layoutLimit,
        teamLimit: pricingPlan.teamLimit,
        renewalDate,
      },
    });

    // Update user's plan
    await prisma.user.update({
      where: { id: targetUserIdFinal },
      data: { plan: pricingPlan.slug },
    });

    return successResponse(
      {
        subscription,
      },
      'Subscription created successfully',
      201
    );
  } catch (error) {
    console.error('Create subscription error:', error);
    return serverErrorResponse('Failed to create subscription', (error as Error).message);
  }
}

export const GET = requireAuth(getSubscriptions);
export const POST = requireAuth(createSubscription);
