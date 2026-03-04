import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { createUser, getUserByEmail } from '@/lib/auth';
import { successResponse, errorResponse, validationErrorResponse, serverErrorResponse } from '@/lib/api-response';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = registerSchema.safeParse(body);
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

    const { email, name, password } = validationResult.data;

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return errorResponse('User with this email already exists', 409, 'USER_EXISTS');
    }

    // Create user
    const user = await createUser({
      email,
      name,
      password,
    });

    // Return user without password hash
    const { passwordHash, ...userWithoutPassword } = user as any;

    return successResponse(
      {
        user: userWithoutPassword,
      },
      'User registered successfully',
      201
    );
  } catch (error) {
    console.error('Registration error:', error);
    return serverErrorResponse('Failed to register user', (error as Error).message);
  }
}
