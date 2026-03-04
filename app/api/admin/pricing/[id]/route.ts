import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/api-middleware';
import { prisma } from '@/lib/db';
import { successResponse, notFoundResponse, errorResponse, validationErrorResponse, serverErrorResponse } from '@/lib/api-response';
import { z } from 'zod';
import type { AuthenticatedRequest } from '@/lib/api-middleware';

const updatePricingPlanSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  monthlyPrice: z.number().min(0).optional(),
  yearlyPrice: z.number().min(0).optional(),
  apiLimit: z.number().int().min(0).optional(),
  layoutLimit: z.number().int().min(0).optional(),
  teamLimit: z.number().int().min(0).optional(),
  features: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
});

async function getPricingPlan(request: AuthenticatedRequest) {
  try {
    const url = new URL(request.url);
    const planId = url.pathname.split('/').pop();

    if (!planId) {
      return errorResponse('Pricing plan ID is required', 400);
    }

    const plan = await prisma.pricingPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return notFoundResponse('Pricing plan not found');
    }

    return successResponse(
      {
        plan,
      },
      'Pricing plan retrieved successfully'
    );
  } catch (error) {
    console.error('Get pricing plan error:', error);
    return serverErrorResponse('Failed to get pricing plan', (error as Error).message);
  }
}

async function updatePricingPlan(request: AuthenticatedRequest) {
  try {
    const url = new URL(request.url);
    const planId = url.pathname.split('/').pop();

    if (!planId) {
      return errorResponse('Pricing plan ID is required', 400);
    }

    const body = await request.json();

    // Validate input
    const validationResult = updatePricingPlanSchema.safeParse(body);
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

    // Check if plan exists
    const existingPlan = await prisma.pricingPlan.findUnique({
      where: { id: planId },
    });

    if (!existingPlan) {
      return notFoundResponse('Pricing plan not found');
    }

    // Update plan
    const plan = await prisma.pricingPlan.update({
      where: { id: planId },
      data: validationResult.data,
    });

    return successResponse(
      {
        plan,
      },
      'Pricing plan updated successfully'
    );
  } catch (error) {
    console.error('Update pricing plan error:', error);
    return serverErrorResponse('Failed to update pricing plan', (error as Error).message);
  }
}

async function deletePricingPlan(request: AuthenticatedRequest) {
  try {
    const url = new URL(request.url);
    const planId = url.pathname.split('/').pop();

    if (!planId) {
      return errorResponse('Pricing plan ID is required', 400);
    }

    // Check if plan exists
    const plan = await prisma.pricingPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return notFoundResponse('Pricing plan not found');
    }

    // Check if plan is in use
    const activeSubscriptions = await prisma.subscription.count({
      where: {
        plan: plan.slug,
        status: 'ACTIVE',
      },
    });

    if (activeSubscriptions > 0) {
      return errorResponse(
        `Cannot delete pricing plan. There are ${activeSubscriptions} active subscriptions using this plan.`,
        400,
        'PLAN_IN_USE'
      );
    }

    // Delete plan
    await prisma.pricingPlan.delete({
      where: { id: planId },
    });

    return successResponse(null, 'Pricing plan deleted successfully');
  } catch (error) {
    console.error('Delete pricing plan error:', error);
    return serverErrorResponse('Failed to delete pricing plan', (error as Error).message);
  }
}

export const GET = requireAdmin(getPricingPlan);
export const PATCH = requireAdmin(updatePricingPlan);
export const DELETE = requireAdmin(deletePricingPlan);
