import { requireAuth } from '@/lib/api-middleware';
import { prisma } from '@/lib/db';
import {
  successResponse,
  notFoundResponse,
  forbiddenResponse,
  errorResponse,
  serverErrorResponse,
} from '@/lib/api-response';
import type { AuthenticatedRequest } from '@/lib/api-middleware';

async function getVersions(request: AuthenticatedRequest) {
  try {
    const url = new URL(request.url);
    const layoutId = url.pathname.split('/')[3]; // /api/layouts/[id]/versions

    if (!layoutId) {
      return errorResponse('Layout ID is required', 400);
    }

    const layout = await prisma.layout.findUnique({
      where: { id: layoutId },
      include: { project: { select: { userId: true } } },
    });

    if (!layout) {
      return notFoundResponse('Layout not found');
    }

    if (
      layout.project.userId !== request.user?.id &&
      request.user?.role !== 'ADMIN' &&
      request.user?.role !== 'SUPER_ADMIN'
    ) {
      return forbiddenResponse('Access denied');
    }

    const versions = await prisma.layoutVersion.findMany({
      where: { layoutId },
      orderBy: { version: 'desc' },
      select: {
        id: true,
        version: true,
        screenName: true,
        publishedAt: true,
        publishedBy: true,
        isActive: true,
      },
    });

    return successResponse({ versions }, 'Versions retrieved successfully');
  } catch (error) {
    console.error('Get versions error:', error);
    return serverErrorResponse('Failed to get versions', (error as Error).message);
  }
}

export const GET = requireAuth(getVersions);
