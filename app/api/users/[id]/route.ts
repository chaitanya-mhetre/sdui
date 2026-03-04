import { NextRequest } from 'next/server';
import { requireAdmin, requireAuth } from '@/lib/api-middleware';
import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { successResponse, notFoundResponse, errorResponse, validationErrorResponse, serverErrorResponse } from '@/lib/api-response';
import { z } from 'zod';
import type { AuthenticatedRequest } from '@/lib/api-middleware';

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.enum(['USER', 'ADMIN', 'SUPER_ADMIN']).optional(),
  plan: z.enum(['FREE', 'STARTER', 'PRO', 'ENTERPRISE']).optional(),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'DELETED']).optional(),
  password: z.string().min(8).optional(),
});

async function getUser(request: AuthenticatedRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.pathname.split('/').pop();

    if (!userId) {
      return errorResponse('User ID is required', 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
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
    });

    if (!user) {
      return notFoundResponse('User not found');
    }

    return successResponse(
      {
        user: {
          ...user,
          projectCount: user._count.projects,
          apiUsageCount: user._count.apiRequestLogs,
        },
      },
      'User retrieved successfully'
    );
  } catch (error) {
    console.error('Get user error:', error);
    return serverErrorResponse('Failed to get user', (error as Error).message);
  }
}

async function updateUser(request: AuthenticatedRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.pathname.split('/').pop();

    if (!userId) {
      return errorResponse('User ID is required', 400);
    }

    const body = await request.json();

    // Validate input
    const validationResult = updateUserSchema.safeParse(body);
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

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return notFoundResponse('User not found');
    }

    // Prevent non-super-admins from modifying roles
    if (request.user?.role !== 'SUPER_ADMIN' && data.role) {
      return errorResponse('Only super admins can modify user roles', 403);
    }

    // Check email uniqueness if updating email
    if (data.email && data.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: data.email },
      });
      if (emailExists) {
        return errorResponse('Email already in use', 409);
      }
    }

    // Hash password if provided
    const updateData: any = { ...data };
    if (data.password) {
      updateData.passwordHash = await hashPassword(data.password);
      delete updateData.password;
    }

    // Update user
    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
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
      },
    });

    return successResponse(
      {
        user,
      },
      'User updated successfully'
    );
  } catch (error) {
    console.error('Update user error:', error);
    return serverErrorResponse('Failed to update user', (error as Error).message);
  }
}

async function deleteUser(request: AuthenticatedRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.pathname.split('/').pop();

    if (!userId) {
      return errorResponse('User ID is required', 400);
    }

    // Prevent self-deletion
    if (request.user?.id === userId) {
      return errorResponse('You cannot delete your own account', 400);
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return notFoundResponse('User not found');
    }

    // Soft delete by setting status to DELETED
    await prisma.user.update({
      where: { id: userId },
      data: { status: 'DELETED' },
    });

    return successResponse(null, 'User deleted successfully');
  } catch (error) {
    console.error('Delete user error:', error);
    return serverErrorResponse('Failed to delete user', (error as Error).message);
  }
}

export const GET = requireAuth(getUser);
export const PATCH = requireAdmin(updateUser);
export const DELETE = requireAdmin(deleteUser);
