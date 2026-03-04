import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/api-middleware';
import { prisma } from '@/lib/db';
import { successResponse, notFoundResponse, errorResponse, validationErrorResponse, serverErrorResponse } from '@/lib/api-response';
import { z } from 'zod';
import type { AuthenticatedRequest } from '@/lib/api-middleware';

const updateTemplateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  category: z.string().min(1).optional(),
  description: z.string().max(500).optional(),
  layoutJson: z.record(z.unknown(), z.unknown()).optional(),
  previewUrl: z.string().url().optional(),
  published: z.boolean().optional(),
});

async function getTemplate(request: AuthenticatedRequest) {
  try {
    const url = new URL(request.url);
    const templateId = url.pathname.split('/').pop();

    if (!templateId) {
      return errorResponse('Template ID is required', 400);
    }

    const template = await prisma.template.findUnique({
      where: { id: templateId },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!template) {
      return notFoundResponse('Template not found');
    }

    return successResponse(
      {
        template,
      },
      'Template retrieved successfully'
    );
  } catch (error) {
    console.error('Get template error:', error);
    return serverErrorResponse('Failed to get template', (error as Error).message);
  }
}

async function updateTemplate(request: AuthenticatedRequest) {
  try {
    const url = new URL(request.url);
    const templateId = url.pathname.split('/').pop();

    if (!templateId) {
      return errorResponse('Template ID is required', 400);
    }

    const body = await request.json();

    // Validate input
    const validationResult = updateTemplateSchema.safeParse(body);
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

    // Check if template exists
    const existingTemplate = await prisma.template.findUnique({
      where: { id: templateId },
    });

    if (!existingTemplate) {
      return notFoundResponse('Template not found');
    }

    // Update template
    const template = await prisma.template.update({
      where: { id: templateId },
      data: validationResult.data,
    });

    return successResponse(
      {
        template,
      },
      'Template updated successfully'
    );
  } catch (error) {
    console.error('Update template error:', error);
    return serverErrorResponse('Failed to update template', (error as Error).message);
  }
}

async function deleteTemplate(request: AuthenticatedRequest) {
  try {
    const url = new URL(request.url);
    const templateId = url.pathname.split('/').pop();

    if (!templateId) {
      return errorResponse('Template ID is required', 400);
    }

    // Check if template exists
    const template = await prisma.template.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return notFoundResponse('Template not found');
    }

    // Delete template
    await prisma.template.delete({
      where: { id: templateId },
    });

    return successResponse(null, 'Template deleted successfully');
  } catch (error) {
    console.error('Delete template error:', error);
    return serverErrorResponse('Failed to delete template', (error as Error).message);
  }
}

export const GET = requireAdmin(getTemplate);
export const PATCH = requireAdmin(updateTemplate);
export const DELETE = requireAdmin(deleteTemplate);
