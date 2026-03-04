import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/api-middleware';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse, validationErrorResponse, serverErrorResponse } from '@/lib/api-response';
import { z } from 'zod';
import type { AuthenticatedRequest } from '@/lib/api-middleware';

const createPricingPlanSchema = z.object({
  name: z.string().min(1, 'Plan name is required').max(100),
  slug: z.enum(['FREE', 'STARTER', 'PRO', 'ENTERPRISE']),
  monthlyPrice: z.number().min(0, 'Monthly price must be non-negative'),
  yearlyPrice: z.number().min(0).optional(),
  apiLimit: z.number().int().min(0, 'API limit must be non-negative'),
  layoutLimit: z.number().int().min(0, 'Layout limit must be non-negative'),
  teamLimit: z.number().int().min(0, 'Team limit must be non-negative'),
  features: z.array(z.string()),
  isActive: z.boolean().optional(),
  order: z.number().int().min(0),
});

async function getPricingPlans(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');

    // Build where clause
    const where: any = {};
    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    const plans = await prisma.pricingPlan.findMany({
      where,
      orderBy: { order: 'asc' },
    });

    return successResponse(
      {
        plans,
      },
      'Pricing plans retrieved successfully'
    );
  } catch (error) {
    console.error('Get pricing plans error:', error);
    return serverErrorResponse('Failed to get pricing plans', (error as Error).message);
  }
}

async function createPricingPlan(request: AuthenticatedRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = createPricingPlanSchema.safeParse(body);
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

    const data = validationResult.data;

    // Check if plan with this slug already exists
    const existingPlan = await prisma.pricingPlan.findUnique({
      where: { slug: data.slug },
    });

    if (existingPlan) {
      return errorResponse('Pricing plan with this slug already exists', 409, 'PLAN_EXISTS');
    }

    // Create pricing plan
    const plan = await prisma.pricingPlan.create({
      data: {
        name: data.name,
        slug: data.slug,
        monthlyPrice: data.monthlyPrice,
        yearlyPrice: data.yearlyPrice,
        apiLimit: data.apiLimit,
        layoutLimit: data.layoutLimit,
        teamLimit: data.teamLimit,
        features: data.features,
        isActive: data.isActive !== undefined ? data.isActive : true,
        order: data.order,
      },
    });

    return successResponse(
      {
        plan,
      },
      'Pricing plan created successfully',
      201
    );
  } catch (error) {
    console.error('Create pricing plan error:', error);
    return serverErrorResponse('Failed to create pricing plan', (error as Error).message);
  }
}

export const GET = requireAdmin(getPricingPlans);
export const POST = requireAdmin(createPricingPlan);
