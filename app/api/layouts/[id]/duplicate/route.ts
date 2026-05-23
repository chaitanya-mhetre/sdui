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

async function duplicateLayout(request: AuthenticatedRequest) {
  try {
    const url = new URL(request.url);
    // path: /api/layouts/[id]/duplicate  → id is at index -2
    const parts = url.pathname.split('/');
    const layoutId = parts[parts.length - 2];

    if (!layoutId) {
      return errorResponse('Layout ID is required', 400);
    }

    // Fetch source layout with project
    const source = await prisma.layout.findUnique({
      where: { id: layoutId },
      include: { project: true },
    });

    if (!source) {
      return notFoundResponse('Layout not found');
    }

    // Ownership check
    if (
      source.project.userId !== request.user?.id &&
      request.user?.role !== 'ADMIN' &&
      request.user?.role !== 'SUPER_ADMIN'
    ) {
      return forbiddenResponse('You do not have permission to duplicate this layout');
    }

    // Build a unique copy name — keep trying with incremented suffixes
    const baseName = `${source.name} (copy)`;
    let candidateName = baseName;
    let attempt = 1;
    while (true) {
      const conflict = await prisma.layout.findFirst({
        where: { projectId: source.projectId, name: candidateName },
      });
      if (!conflict) break;
      attempt += 1;
      candidateName = `${baseName} ${attempt}`;
    }

    // Build a unique screenName
    const baseSlug = (source.screenName ?? source.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''));
    const timestamp = Date.now();
    let candidateSlug = `${baseSlug}_copy_${timestamp}`;
    // Ensure slug matches validation: lowercase alphanumeric with _ or -
    candidateSlug = candidateSlug.replace(/[^a-z0-9_-]/g, '_').substring(0, 100);

    // Check layout limit for the project owner
    const layoutCount = await prisma.layout.count({
      where: { projectId: source.projectId },
    });

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

    let layoutLimit = 5;
    if (user?.subscriptions && user.subscriptions.length > 0) {
      layoutLimit = user.subscriptions[0].layoutLimit;
    } else {
      const planLimits: Record<string, number> = {
        FREE: 5,
        STARTER: 50,
        PRO: 500,
        ENTERPRISE: 9999,
      };
      layoutLimit = planLimits[user?.plan ?? 'FREE'] ?? 5;
    }

    if (layoutCount >= layoutLimit) {
      return errorResponse(
        `You have reached your layout limit (${layoutLimit}). Please upgrade your plan.`,
        403,
        'LAYOUT_LIMIT_REACHED'
      );
    }

    // Create the duplicate
    const duplicate = await prisma.layout.create({
      data: {
        projectId: source.projectId,
        name: candidateName,
        screenName: candidateSlug,
        rootNode: source.rootNode ?? {},
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sduiJson: (source.sduiJson ?? null) as any,
        version: 1,
      },
    });

    return successResponse({ layout: duplicate }, 'Layout duplicated successfully', 201);
  } catch (error) {
    console.error('Duplicate layout error:', error);
    return serverErrorResponse('Failed to duplicate layout', (error as Error).message);
  }
}

export const POST = requireAuth(duplicateLayout);
