import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/api-middleware';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse, validationErrorResponse, serverErrorResponse } from '@/lib/api-response';
import { z } from 'zod';
import type { AuthenticatedRequest } from '@/lib/api-middleware';

const createTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required').max(100),
  category: z.string().min(1, 'Category is required'),
  description: z.string().max(500).optional(),
  layoutJson: z.record(z.unknown(), z.unknown()), // LayoutNode as JSON
  previewUrl: z.string().url().optional(),
  published: z.boolean().optional(),
});

async function getTemplates(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const published = searchParams.get('published');
    const search = searchParams.get('search') || '';

    // Build where clause
    const where: any = {};
    if (category) {
      where.category = category;
    }
    if (published !== null) {
      where.published = published === 'true';
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const templates = await prisma.template.findMany({
      where,
      orderBy: { createdAt: 'desc' },
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

    return successResponse(
      {
        templates,
      },
      'Templates retrieved successfully'
    );
  } catch (error) {
    console.error('Get templates error:', error);
    return serverErrorResponse('Failed to get templates', (error as Error).message);
  }
}

async function createTemplate(request: AuthenticatedRequest) {
  try {
    if (!request.user) {
      throw new Error('User not found');
    }

    const body = await request.json();

    // Validate input
    const validationResult = createTemplateSchema.safeParse(body);
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

    const data = validationResult.data;

    // Create template
    const template = await prisma.template.create({
      data: {
        name: data.name,
        category: data.category,
        description: data.description,
        layoutJson: data.layoutJson,
        previewUrl: data.previewUrl,
        published: data.published || false,
        createdBy: request.user.id,
      },
    });

    return successResponse(
      {
        template,
      },
      'Template created successfully',
      201
    );
  } catch (error) {
    console.error('Create template error:', error);
    return serverErrorResponse('Failed to create template', (error as Error).message);
  }
}

export const GET = requireAdmin(getTemplates);
export const POST = requireAdmin(createTemplate);
