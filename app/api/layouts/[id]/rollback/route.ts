import { requireAuth } from '@/lib/api-middleware';
import { prisma, Prisma } from '@/lib/db';
import {
  successResponse,
  notFoundResponse,
  forbiddenResponse,
  errorResponse,
  serverErrorResponse,
} from '@/lib/api-response';
import type { AuthenticatedRequest } from '@/lib/api-middleware';

/**
 * POST /api/layouts/[id]/rollback?version=N
 * Rolls back the active live version to a previous snapshot.
 * The target LayoutVersion becomes isActive=true; all others become false.
 * The Layout draft is also updated to reflect the rolled-back JSON.
 */
async function rollbackLayout(request: AuthenticatedRequest) {
  try {
    const url = new URL(request.url);
    const layoutId = url.pathname.split('/')[3]; // /api/layouts/[id]/rollback
    const versionParam = url.searchParams.get('version');

    if (!layoutId) {
      return errorResponse('Layout ID is required', 400);
    }
    if (!versionParam) {
      return errorResponse('Query param ?version=N is required', 400);
    }

    const targetVersion = parseInt(versionParam, 10);
    if (isNaN(targetVersion) || targetVersion < 1) {
      return errorResponse('version must be a positive integer', 400);
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
      return forbiddenResponse('You do not have permission to rollback this layout');
    }

    // Find the target version snapshot
    const targetSnapshot = await prisma.layoutVersion.findFirst({
      where: { layoutId, version: targetVersion },
    });

    if (!targetSnapshot) {
      return notFoundResponse(`Version ${targetVersion} not found for this layout`);
    }

    // Atomically: deactivate all versions → activate target
    await prisma.$transaction([
      prisma.layoutVersion.updateMany({
        where: { layoutId, isActive: true },
        data: { isActive: false },
      }),
      prisma.layoutVersion.update({
        where: { id: targetSnapshot.id },
        data: { isActive: true },
      }),
      // Restore the Layout draft to the rolled-back snapshot
      prisma.layout.update({
        where: { id: layoutId },
        data: {
          rexaJson: targetSnapshot.rexaJson as Prisma.InputJsonValue,
          version: targetSnapshot.version,
          isPublished: true,
          publishedAt: new Date(),
          screenName: targetSnapshot.screenName ?? layout.screenName,
        },
      }),
    ]);

    return successResponse(
      {
        rolledBackTo: targetVersion,
        layoutId,
        screenName: targetSnapshot.screenName,
        publicUrl: `/api/v1/screens/${targetSnapshot.screenName ?? layoutId}`,
      },
      `Layout rolled back to v${targetVersion} successfully`
    );
  } catch (error) {
    console.error('Rollback error:', error);
    return serverErrorResponse('Failed to rollback layout', (error as Error).message);
  }
}

export const POST = requireAuth(rollbackLayout);
