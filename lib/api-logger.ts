import { prisma } from './db';

export interface ApiLogData {
  projectId: string;
  userId: string;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number; // in milliseconds
}

/**
 * Log an API request to the database
 * This should be called after processing an API request
 */
export async function logApiRequest(data: ApiLogData): Promise<void> {
  try {
    await prisma.apiRequestLog.create({
      data: {
        projectId: data.projectId,
        userId: data.userId,
        endpoint: data.endpoint,
        method: data.method,
        statusCode: data.statusCode,
        responseTime: data.responseTime,
      },
    });
  } catch (error) {
    // Don't throw - logging failures shouldn't break the API
    console.error('Failed to log API request:', error);
  }
}

/**
 * Get API usage statistics for a user
 */
export async function getUserApiUsage(userId: string, startDate?: Date, endDate?: Date) {
  const where: any = { userId };
  
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      where.createdAt.gte = startDate;
    }
    if (endDate) {
      where.createdAt.lte = endDate;
    }
  }

  return prisma.apiRequestLog.aggregate({
    where,
    _count: true,
    _avg: {
      responseTime: true,
    },
    _sum: {
      responseTime: true,
    },
  });
}

/**
 * Get API usage statistics for a project
 */
export async function getProjectApiUsage(projectId: string, startDate?: Date, endDate?: Date) {
  const where: any = { projectId };
  
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      where.createdAt.gte = startDate;
    }
    if (endDate) {
      where.createdAt.lte = endDate;
    }
  }

  return prisma.apiRequestLog.aggregate({
    where,
    _count: true,
    _avg: {
      responseTime: true,
    },
    _sum: {
      responseTime: true,
    },
  });
}

/**
 * Check if user has exceeded API limit
 */
export async function checkApiLimit(userId: string): Promise<{ allowed: boolean; limit: number; used: number }> {
  // Get user's active subscription
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: 'ACTIVE',
    },
    orderBy: { createdAt: 'desc' },
  });

  // Get user's plan if no subscription
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });

  let apiLimit = 1000; // Default for FREE plan

  if (subscription) {
    apiLimit = subscription.apiLimit;
  } else if (user) {
    // Get limit from pricing plan
    const pricingPlan = await prisma.pricingPlan.findUnique({
      where: { slug: user.plan },
    });
    if (pricingPlan) {
      apiLimit = pricingPlan.apiLimit;
    }
  }

  // Count API requests this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const used = await prisma.apiRequestLog.count({
    where: {
      userId,
      createdAt: {
        gte: startOfMonth,
      },
    },
  });

  return {
    allowed: used < apiLimit,
    limit: apiLimit,
    used,
  };
}
