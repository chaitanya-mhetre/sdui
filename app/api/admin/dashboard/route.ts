import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/api-middleware';
import { prisma } from '@/lib/db';
import { successResponse, serverErrorResponse } from '@/lib/api-response';
import type { AuthenticatedRequest } from '@/lib/api-middleware';

async function getDashboardStats(request: AuthenticatedRequest) {
  try {
    // Get all stats in parallel
    const [
      totalUsers,
      totalProjects,
      activeApps,
      totalApiRequests,
      monthlyRevenue,
      userGrowth,
      projectGrowth,
      apiUsageTrend,
    ] = await Promise.all([
      // Total users
      prisma.user.count({
        where: { status: 'ACTIVE' },
      }),
      // Total projects
      prisma.project.count({
        where: { status: 'ACTIVE' },
      }),
      // Active apps (projects with recent API calls)
      prisma.project.count({
        where: {
          status: 'ACTIVE',
          apiRequestLogs: {
            some: {
              createdAt: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
              },
            },
          },
        },
      }),
      // Total API requests
      prisma.apiRequestLog.count(),
      // Monthly revenue (sum of active subscriptions)
      prisma.subscription.aggregate({
        where: { status: 'ACTIVE' },
        _sum: {
          monthlyPrice: true,
        },
      }),
      // User growth (last 6 months)
      getUserGrowth(),
      // Project growth (last 6 months)
      getProjectGrowth(),
      // API usage trend (last 6 months)
      getApiUsageTrend(),
    ]);

    const stats = {
      totalUsers,
      totalProjects,
      activeApps,
      totalApiRequests,
      monthlyRevenue: monthlyRevenue._sum.monthlyPrice || 0,
      userGrowth,
      projectGrowth,
      apiUsageTrend,
    };

    return successResponse(
      {
        stats,
      },
      'Dashboard stats retrieved successfully'
    );
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return serverErrorResponse('Failed to get dashboard stats', (error as Error).message);
  }
}

async function getUserGrowth() {
  const months = [];
  const now = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    
    const count = await prisma.user.count({
      where: {
        createdAt: {
          gte: date,
          lt: nextDate,
        },
        status: 'ACTIVE',
      },
    });
    
    months.push({
      date: date.toLocaleDateString('en-US', { month: 'short' }),
      value: count,
    });
  }
  
  return months;
}

async function getProjectGrowth() {
  const months = [];
  const now = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    
    const count = await prisma.project.count({
      where: {
        createdAt: {
          gte: date,
          lt: nextDate,
        },
        status: 'ACTIVE',
      },
    });
    
    months.push({
      date: date.toLocaleDateString('en-US', { month: 'short' }),
      value: count,
    });
  }
  
  return months;
}

async function getApiUsageTrend() {
  const months = [];
  const now = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    
    const count = await prisma.apiRequestLog.count({
      where: {
        createdAt: {
          gte: date,
          lt: nextDate,
        },
      },
    });
    
    months.push({
      date: date.toLocaleDateString('en-US', { month: 'short' }),
      value: count,
    });
  }
  
  return months;
}

export const GET = requireAdmin(getDashboardStats);
