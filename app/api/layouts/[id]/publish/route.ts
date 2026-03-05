import { requireAuth } from '@/lib/api-middleware';
import { prisma, Prisma } from '@/lib/db';
import {
  successResponse,
  notFoundResponse,
  forbiddenResponse,
  errorResponse,
  serverErrorResponse,
} from '@/lib/api-response';
import { z } from 'zod';
import type { AuthenticatedRequest } from '@/lib/api-middleware';
import { validateSduiJson } from '@/lib/sdui/validation';
import { builderRootToSduiJson } from '@/lib/builderToSdui';
import type { LayoutNode } from '@/types';

const publishSchema = z.object({
  screenName: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9_-]+$/, 'Screen name must be lowercase alphanumeric with _ or -')
    .optional(),
  sduiJson: z.record(z.unknown()).optional(),
  rootNode: z.record(z.unknown()).optional(), // Builder tree; converted to SDUI on server
});

async function publishLayout(request: AuthenticatedRequest) {
  try {
    const url = new URL(request.url);
    const layoutId = url.pathname.split('/')[3]; // /api/layouts/[id]/publish

    if (!layoutId) {
      return errorResponse('Layout ID is required', 400);
    }

    const body = await request.json().catch(() => ({}));
    const parsed = publishSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse('Invalid request body: ' + parsed.error.message, 400);
    }

    // Fetch layout with project ownership check
    const layout = await prisma.layout.findUnique({
      where: { id: layoutId },
      include: { project: true },
    });

    if (!layout) {
      return notFoundResponse('Layout not found');
    }

    if (
      layout.project.userId !== request.user?.id &&
      request.user?.role !== 'ADMIN' &&
      request.user?.role !== 'SUPER_ADMIN'
    ) {
      return forbiddenResponse('You do not have permission to publish this layout');
    }

    // Resolve the SDUI JSON: prefer sduiJson, else convert rootNode (builder) to SDUI, else stored
    let sduiJsonRaw: Record<string, unknown> | null = null;

    // First, try to get sduiJson from request body
    if (parsed.data.sduiJson) {
      const sduiJsonValue = parsed.data.sduiJson;
      // Handle both string and object formats
      if (typeof sduiJsonValue === 'string') {
        try {
          sduiJsonRaw = JSON.parse(sduiJsonValue) as Record<string, unknown>;
        } catch (e) {
          return errorResponse('Invalid sduiJson format: ' + (e as Error).message, 400);
        }
      } else if (typeof sduiJsonValue === 'object' && sduiJsonValue !== null && !Array.isArray(sduiJsonValue)) {
        sduiJsonRaw = sduiJsonValue as Record<string, unknown>;
      }
    }

    // If no sduiJson in request, try converting rootNode
    if (!sduiJsonRaw && parsed.data.rootNode) {
      try {
        sduiJsonRaw = builderRootToSduiJson(parsed.data.rootNode as LayoutNode);
      } catch (e) {
        return errorResponse(
          'Failed to convert layout to SDUI format: ' + (e as Error).message,
          422
        );
      }
    }

    // Fallback to stored sduiJson
    if (!sduiJsonRaw && layout.sduiJson) {
      const storedSduiJson = layout.sduiJson;
      if (typeof storedSduiJson === 'string') {
        try {
          sduiJsonRaw = JSON.parse(storedSduiJson) as Record<string, unknown>;
        } catch (e) {
          return errorResponse('Invalid stored sduiJson format: ' + (e as Error).message, 500);
        }
      } else if (typeof storedSduiJson === 'object' && storedSduiJson !== null && !Array.isArray(storedSduiJson)) {
        sduiJsonRaw = storedSduiJson as Record<string, unknown>;
      }
    }

    if (!sduiJsonRaw) {
      return errorResponse(
        'No layout to publish. Save the layout or provide sduiJson or rootNode in the request body.',
        400
      );
    }

    // Ensure sduiJsonRaw is a valid object before validation
    if (!sduiJsonRaw || typeof sduiJsonRaw !== 'object' || Array.isArray(sduiJsonRaw)) {
      return errorResponse(
        `Invalid sduiJson format: expected an object, got ${sduiJsonRaw === null ? 'null' : Array.isArray(sduiJsonRaw) ? 'array' : typeof sduiJsonRaw}`,
        400
      );
    }

    // Server-side validation (depth, node count, required type field)
    // Log for debugging
    console.log('[Publish] Validating sduiJson:', {
      type: typeof sduiJsonRaw,
      isArray: Array.isArray(sduiJsonRaw),
      hasType: 'type' in sduiJsonRaw,
      typeValue: (sduiJsonRaw as Record<string, unknown>).type,
      keys: Object.keys(sduiJsonRaw).slice(0, 10),
      sample: JSON.stringify(sduiJsonRaw).substring(0, 500),
    });
    
    const validation = validateSduiJson(sduiJsonRaw);
    if (!validation.valid) {
      console.error('[Publish] Validation failed:', validation.error, {
        nodeCount: validation.nodeCount,
        unknownTypes: validation.unknownTypes,
        warnings: validation.warnings,
      });
      return errorResponse(`SDUI JSON validation failed: ${validation.error}`, 422);
    }

    const screenName = parsed.data.screenName ?? layout.screenName ?? layout.name
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_-]/g, '');

    const newVersion = layout.version + 1;
    const publishedAt = new Date();

    // Deactivate previous active version for this screen (if any)
    await prisma.layoutVersion.updateMany({
      where: { layoutId, isActive: true },
      data: { isActive: false },
    });

    // Create immutable version snapshot
    const layoutVersion = await prisma.layoutVersion.create({
      data: {
        layoutId,
        projectId: layout.projectId,
        screenName,
        version: newVersion,
        sduiJson: sduiJsonRaw as Prisma.InputJsonValue,
        publishedAt,
        publishedBy: request.user?.id,
        isActive: true,
      },
    });

    // Update the draft layout
    const published = await prisma.layout.update({
      where: { id: layoutId },
      data: {
        screenName,
        isPublished: true,
        publishedAt,
        version: newVersion,
        sduiJson: sduiJsonRaw as Prisma.InputJsonValue,
      },
    });

    return successResponse(
      {
        layout: {
          id: published.id,
          name: published.name,
          screenName: published.screenName,
          version: published.version,
          isPublished: published.isPublished,
          publishedAt: published.publishedAt,
        },
        version: {
          id: layoutVersion.id,
          version: layoutVersion.version,
          isActive: layoutVersion.isActive,
        },
        publicUrl: `/api/v1/screens/${screenName}`,
        warnings: validation.warnings,
      },
      `Layout "${published.name}" published as v${newVersion}` +
        (validation.warnings.length > 0 ? ` (${validation.warnings.length} warning(s))` : '')
    );
  } catch (error) {
    console.error('Publish layout error:', error);
    return serverErrorResponse('Failed to publish layout', (error as Error).message);
  }
}

async function unpublishLayout(request: AuthenticatedRequest) {
  try {
    const url = new URL(request.url);
    const layoutId = url.pathname.split('/')[3];

    if (!layoutId) {
      return errorResponse('Layout ID is required', 400);
    }

    const layout = await prisma.layout.findUnique({
      where: { id: layoutId },
      include: { project: true },
    });

    if (!layout) {
      return notFoundResponse('Layout not found');
    }

    if (
      layout.project.userId !== request.user?.id &&
      request.user?.role !== 'ADMIN' &&
      request.user?.role !== 'SUPER_ADMIN'
    ) {
      return forbiddenResponse('You do not have permission to unpublish this layout');
    }

    await prisma.$transaction([
      prisma.layout.update({
        where: { id: layoutId },
        data: { isPublished: false },
      }),
      prisma.layoutVersion.updateMany({
        where: { layoutId, isActive: true },
        data: { isActive: false },
      }),
    ]);

    return successResponse(null, 'Layout unpublished successfully');
  } catch (error) {
    console.error('Unpublish layout error:', error);
    return serverErrorResponse('Failed to unpublish layout', (error as Error).message);
  }
}

export const POST = requireAuth(publishLayout);
export const DELETE = requireAuth(unpublishLayout);
