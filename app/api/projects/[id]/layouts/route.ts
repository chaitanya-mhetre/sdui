import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api-middleware';
import { prisma } from '@/lib/db';
import { successResponse, notFoundResponse, forbiddenResponse, errorResponse, validationErrorResponse, serverErrorResponse } from '@/lib/api-response';
import { z } from 'zod';
import type { AuthenticatedRequest } from '@/lib/api-middleware';
import { validateSduiJson } from '@/lib/sdui/validation';

const createLayoutSchema = z.object({
  name: z.string().min(1, 'Layout name is required').max(100),
  screenName: z
    .string()
    .max(100)
    .regex(/^[a-z0-9_-]*$/, 'Screen name must be lowercase alphanumeric with _ or -')
    .optional(),
  rootNode: z.record(z.unknown(), z.unknown()), // LayoutNode as JSON
  sduiJson: z.record(z.unknown(), z.unknown()).optional(), // SDUI Flutter JSON
});

async function getLayouts(request: AuthenticatedRequest) {
  try {
    const url = new URL(request.url);
    const projectId = url.pathname.split('/')[3]; // /api/projects/[id]/layouts

    if (!projectId) {
      return errorResponse('Project ID is required', 400);
    }

    // Check if project exists and user has access
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return notFoundResponse('Project not found');
    }

    if (project.userId !== request.user?.id && request.user?.role !== 'ADMIN' && request.user?.role !== 'SUPER_ADMIN') {
      return forbiddenResponse('You do not have permission to access this project');
    }

    const layouts = await prisma.layout.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(
      {
        layouts,
      },
      'Layouts retrieved successfully'
    );
  } catch (error) {
    console.error('Get layouts error:', error);
    return serverErrorResponse('Failed to get layouts', (error as Error).message);
  }
}

async function createLayout(request: AuthenticatedRequest) {
  try {
    const url = new URL(request.url);
    const projectId = url.pathname.split('/')[3];

    if (!projectId) {
      return errorResponse('Project ID is required', 400);
    }

    const body = await request.json();

    // Validate input
    const validationResult = createLayoutSchema.safeParse(body);
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

    // Check if project exists and user has access
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return notFoundResponse('Project not found');
    }

    if (project.userId !== request.user?.id && request.user?.role !== 'ADMIN' && request.user?.role !== 'SUPER_ADMIN') {
      return forbiddenResponse('You do not have permission to create layouts in this project');
    }

    // Check for duplicate name in this project
    const existingLayout = await prisma.layout.findFirst({
      where: {
        projectId,
        name: validationResult.data.name,
      },
    });

    if (existingLayout) {
      return errorResponse(
        `A layout with the name "${validationResult.data.name}" already exists in this project. Please use a different name.`,
        409,
        'DUPLICATE_LAYOUT_NAME'
      );
    }

    // Check for duplicate screenName if provided
    if (validationResult.data.screenName) {
      const existingScreen = await prisma.layout.findFirst({
        where: {
          projectId,
          screenName: validationResult.data.screenName,
        },
      });

      if (existingScreen) {
        return errorResponse(
          `A layout with screen name "${validationResult.data.screenName}" already exists. Please use a different screen name.`,
          409,
          'DUPLICATE_SCREEN_NAME'
        );
      }
    }

    // Note: rootNode is in builder format (componentType), not SDUI format (type)
    // Validation happens when publishing (converting to SDUI format)
    // So we skip SDUI validation here for rootNode

    // Check layout limit
    const layoutCount = await prisma.layout.count({
      where: { projectId },
    });

    // Get user's layout limit from subscription or plan
    const user = await prisma.user.findUnique({
      where: { id: request.user.id },
      include: {
        subscriptions: {
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    let layoutLimit = 5; // Default
    if (user?.subscriptions.length > 0) {
      layoutLimit = user.subscriptions[0].layoutLimit;
    } else {
      const planLimits: Record<string, number> = {
        FREE: 5,
        STARTER: 50,
        PRO: 500,
        ENTERPRISE: 9999,
      };
      layoutLimit = planLimits[user?.plan || 'FREE'] || 5;
    }

    if (layoutCount >= layoutLimit) {
      return errorResponse(
        `You have reached your layout limit (${layoutLimit}) for this project. Please upgrade your plan.`,
        403,
        'LAYOUT_LIMIT_REACHED'
      );
    }

    // Create layout
    const layout = await prisma.layout.create({
      data: {
        projectId,
        name: validationResult.data.name,
        screenName: validationResult.data.screenName ?? null,
        rootNode: validationResult.data.rootNode,
        sduiJson: validationResult.data.sduiJson ?? null,
        version: 1,
      },
    });

    return successResponse(
      {
        layout,
      },
      'Layout created successfully',
      201
    );
  } catch (error) {
    console.error('Create layout error:', error);
    return serverErrorResponse('Failed to create layout', (error as Error).message);
  }
}

export const GET = requireAuth(getLayouts);
export const POST = requireAuth(createLayout);
