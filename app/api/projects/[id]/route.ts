import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api-middleware';
import { prisma } from '@/lib/db';
import { successResponse, notFoundResponse, forbiddenResponse, errorResponse, validationErrorResponse, serverErrorResponse } from '@/lib/api-response';
import { z } from 'zod';
import type { AuthenticatedRequest } from '@/lib/api-middleware';

const updateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'ARCHIVED']).optional(),
  settings: z.record(z.unknown()).optional(),
});

async function getProject(request: AuthenticatedRequest) {
  try {
    const url = new URL(request.url);
    const projectId = url.pathname.split('/').pop();

    if (!projectId) {
      return errorResponse('Project ID is required', 400);
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        _count: {
          select: {
            layouts: true,
            apiEndpoints: true,
            apiRequestLogs: true,
          },
        },
      },
    });

    if (!project) {
      return notFoundResponse('Project not found');
    }

    // Check ownership or admin
    if (project.userId !== request.user?.id && request.user?.role !== 'ADMIN' && request.user?.role !== 'SUPER_ADMIN') {
      return forbiddenResponse('You do not have permission to access this project');
    }

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
          layoutCount: project._count.layouts,
          apiEndpointCount: project._count.apiEndpoints,
          apiCallsCount: project._count.apiRequestLogs,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
        },
      },
      'Project retrieved successfully'
    );
  } catch (error) {
    console.error('Get project error:', error);
    return serverErrorResponse('Failed to get project', (error as Error).message);
  }
}

async function updateProject(request: AuthenticatedRequest) {
  try {
    const url = new URL(request.url);
    const projectId = url.pathname.split('/').pop();

    if (!projectId) {
      return errorResponse('Project ID is required', 400);
    }

    const body = await request.json();

    // Validate input
    const validationResult = updateProjectSchema.safeParse(body);
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

    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!existingProject) {
      return notFoundResponse('Project not found');
    }

    // Check ownership or admin
    if (existingProject.userId !== request.user?.id && request.user?.role !== 'ADMIN' && request.user?.role !== 'SUPER_ADMIN') {
      return forbiddenResponse('You do not have permission to update this project');
    }

    // Update project
    const project = await prisma.project.update({
      where: { id: projectId },
      data: validationResult.data,
      include: {
        _count: {
          select: {
            layouts: true,
            apiEndpoints: true,
            apiRequestLogs: true,
          },
        },
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
          layoutCount: project._count.layouts,
          apiEndpointCount: project._count.apiEndpoints,
          apiCallsCount: project._count.apiRequestLogs,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
        },
      },
      'Project updated successfully'
    );
  } catch (error) {
    console.error('Update project error:', error);
    return serverErrorResponse('Failed to update project', (error as Error).message);
  }
}

async function deleteProject(request: AuthenticatedRequest) {
  try {
    const url = new URL(request.url);
    const projectId = url.pathname.split('/').pop();

    if (!projectId) {
      return errorResponse('Project ID is required', 400);
    }

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return notFoundResponse('Project not found');
    }

    // Check ownership or admin
    if (project.userId !== request.user?.id && request.user?.role !== 'ADMIN' && request.user?.role !== 'SUPER_ADMIN') {
      return forbiddenResponse('You do not have permission to delete this project');
    }

    // Delete project (cascade will delete layouts, endpoints, etc.)
    await prisma.project.delete({
      where: { id: projectId },
    });

    return successResponse(null, 'Project deleted successfully');
  } catch (error) {
    console.error('Delete project error:', error);
    return serverErrorResponse('Failed to delete project', (error as Error).message);
  }
}

export const GET = requireAuth(getProject);
export const PATCH = requireAuth(updateProject);
export const DELETE = requireAuth(deleteProject);
