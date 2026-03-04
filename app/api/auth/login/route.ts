import { NextRequest } from 'next/server';
import { verifyPassword, getUserByEmail, updateLastLogin } from '@/lib/auth';
import { successResponse, errorResponse, validationErrorResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api-response';
import { isUserActive } from '@/lib/auth';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = loginSchema.safeParse(body);
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

    const { email, password } = validationResult.data;

    // Get user
    const user = await getUserByEmail(email);
    if (!user || !user.passwordHash) {
      return unauthorizedResponse('Invalid email or password');
    }

    // Check if user is active
    if (!isUserActive(user.status)) {
      return errorResponse('Account is suspended or deleted', 403, 'ACCOUNT_SUSPENDED');
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      return unauthorizedResponse('Invalid email or password');
    }

    // Update last login
    await updateLastLogin(user.id);

    // Return user without password hash
    const { passwordHash, ...userWithoutPassword } = user;

    // In a real app, you would create a session token here
    // For now, we'll return the user with API key
    return successResponse(
      {
        user: userWithoutPassword,
        // In production, return a session token instead
        token: user.apiKey, // Temporary: using API key as token
      },
      'Login successful'
    );
  } catch (error) {
    console.error('Login error:', error);
    return serverErrorResponse('Failed to login', (error as Error).message);
  }
}
