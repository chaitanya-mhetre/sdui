import { requireAuth } from '@/lib/api-middleware';
import { prisma } from '@/lib/db';
import { successResponse, serverErrorResponse } from '@/lib/api-response';
import type { AuthenticatedRequest } from '@/lib/api-middleware';

/**
 * GET /api/components
 * List platform components visible to authenticated users (PUBLIC and BETA only).
 * Used by the user dashboard to show available components from the DB.
 */
async function getComponents(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);

    const components = await prisma.platformComponent.findMany({
      where: {
        visibility: { in: ['PUBLIC', 'BETA'] },
        ...(category ? { category: category as any } : {}),
      },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
      take: limit,
      select: {
        id: true,
        name: true,
        category: true,
        propsSchema: true,
        defaultProps: true,
        version: true,
        visibility: true,
        usageCount: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return successResponse(
      { components },
      'Components retrieved successfully'
    );
  } catch (error) {
    console.error('Get components error:', error);
    return serverErrorResponse(
      'Failed to get components',
      (error as Error).message
    );
  }
}

export const GET = requireAuth(getComponents);
