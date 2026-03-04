import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/api-middleware';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/api-response';
import type { AuthenticatedRequest } from '@/lib/api-middleware';

async function getUsers(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const skip = (page - 1) * limit;
    const status = searchParams.get('status') as any;
    const plan = searchParams.get('plan') as any;
    const search = searchParams.get('search') || '';

    // Build where clause
    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (plan) {
      where.plan = plan;
    }
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get users and total count
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          plan: true,
          status: true,
          apiKey: true,
          createdAt: true,
          updatedAt: true,
          lastLogin: true,
          _count: {
            select: {
              projects: true,
              apiRequestLogs: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    // Format response
    const formattedUsers = users.map((user) => ({
      ...user,
      projectCount: user._count.projects,
      apiUsageCount: user._count.apiRequestLogs,
    }));

    return successResponse(
      {
        users: formattedUsers,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      'Users retrieved successfully'
    );
  } catch (error) {
    console.error('Get users error:', error);
    return serverErrorResponse('Failed to get users', (error as Error).message);
  }
}

export const GET = requireAdmin(getUsers);
