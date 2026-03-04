import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/api-middleware';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/api-response';
import type { AuthenticatedRequest } from '@/lib/api-middleware';

async function getAdminProjects(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const skip = (page - 1) * limit;
    const status = searchParams.get('status') as any;
    const owner = searchParams.get('owner');
    const search = searchParams.get('search') || '';

    // Build where clause
    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (owner) {
      where.userId = owner;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { apiKey: { contains: search, mode: 'insensitive' } },
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
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
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

    // Format response with last API call dates
    const formattedProjects = await Promise.all(
      projects.map(async (project) => ({
        id: project.id,
        userId: project.userId,
        userName: project.user.name || project.user.email,
        name: project.name,
        apiKey: project.apiKey,
        layoutCount: project._count.layouts,
        apiCallsCount: project._count.apiRequestLogs,
        lastApiCall: await getLastApiCall(project.id),
        status: project.status,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      }))
    );

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
    console.error('Get admin projects error:', error);
    return serverErrorResponse('Failed to get projects', (error as Error).message);
  }
}

async function getLastApiCall(projectId: string) {
  const lastCall = await prisma.apiRequestLog.findFirst({
    where: { projectId },
    orderBy: { createdAt: 'desc' },
    select: { createdAt: true },
  });
  return lastCall?.createdAt || null;
}

export const GET = requireAdmin(getAdminProjects);
