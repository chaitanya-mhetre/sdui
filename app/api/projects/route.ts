import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api-middleware';
import { prisma } from '@/lib/db';
import { generateApiKey } from '@/lib/auth';
import { successResponse, errorResponse, validationErrorResponse, serverErrorResponse } from '@/lib/api-response';
import { z } from 'zod';
import type { AuthenticatedRequest } from '@/lib/api-middleware';

const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100, 'Project name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  settings: z.record(z.unknown()).optional(),
});

async function getProjects(request: AuthenticatedRequest) {
  try {
    if (!request.user) {
      throw new Error('User not found');
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const skip = (page - 1) * limit;
    const status = searchParams.get('status') as any;
    const search = searchParams.get('search') || '';

    // Build where clause
    const where: any = {
      userId: request.user.id,
    };
    if (status) {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get projects and total count
    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              layouts: true,
              apiEndpoints: true,
              apiRequestLogs: true,
            },
          },
        },
      }),
      prisma.project.count({ where }),
    ]);

    // Format response
    const formattedProjects = projects.map((project) => ({
      id: project.id,
      userId: project.userId,
      name: project.name,
      description: project.description,
      apiKey: project.apiKey,
      status: project.status,
      settings: project.settings,
      layoutCount: project._count.layouts,
      apiEndpointCount: project._count.apiEndpoints,
      apiCallsCount: project._count.apiRequestLogs,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    }));

    return successResponse(
      {
        projects: formattedProjects,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      'Projects retrieved successfully'
    );
  } catch (error) {
    console.error('Get projects error:', error);
    return serverErrorResponse('Failed to get projects', (error as Error).message);
  }
}

async function createProject(request: AuthenticatedRequest) {
  try {
    if (!request.user) {
      throw new Error('User not found');
    }

    const body = await request.json();

    // Validate input
    const validationResult = createProjectSchema.safeParse(body);
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

    const { name, description, settings } = validationResult.data;

    // Check project limit based on user plan
    const user = await prisma.user.findUnique({
      where: { id: request.user.id },
      include: {
        subscriptions: {
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: { projects: true },
        },
      },
    });

    if (!user) {
      return errorResponse('User not found', 404);
    }

    // Get layout limit from active subscription or default plan limits
    let layoutLimit = 5; // Default for FREE plan
    if (user.subscriptions.length > 0) {
      layoutLimit = user.subscriptions[0].layoutLimit;
    } else {
      // Use plan-based defaults
      const planLimits: Record<string, number> = {
        FREE: 5,
        STARTER: 50,
        PRO: 500,
        ENTERPRISE: 9999,
      };
      layoutLimit = planLimits[user.plan] || 5;
    }

    // Check if user has reached project limit
    if (user._count.projects >= layoutLimit) {
      return errorResponse(
        `You have reached your project limit (${layoutLimit}). Please upgrade your plan.`,
        403,
        'PROJECT_LIMIT_REACHED'
      );
    }

    // Generate unique API key
    let apiKey = generateApiKey();
    let keyExists = await prisma.project.findUnique({ where: { apiKey } });
    while (keyExists) {
      apiKey = generateApiKey();
      keyExists = await prisma.project.findUnique({ where: { apiKey } });
    }

    // Create project
    const project = await prisma.project.create({
      data: {
        userId: request.user.id,
        name,
        description,
        apiKey,
        settings: settings || {},
      },
    });

    return successResponse(
      {
        project: {
          id: project.id,
          userId: project.userId,
          name: project.name,
          description: project.description,
          apiKey: project.apiKey,
          status: project.status,
          settings: project.settings,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
        },
      },
      'Project created successfully',
      201
    );
  } catch (error) {
    console.error('Create project error:', error);
    return serverErrorResponse('Failed to create project', (error as Error).message);
  }
}

export const GET = requireAuth(getProjects);
export const POST = requireAuth(createProject);
