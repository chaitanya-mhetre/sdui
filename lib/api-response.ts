import { NextResponse } from 'next/server';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

/**
 * Success response
 */
export function successResponse<T>(
  data: T,
  message: string = 'Success',
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status }
  );
}

/**
 * Error response
 */
export function errorResponse(
  message: string,
  status: number = 400,
  error?: string,
  errors?: Record<string, string[]>
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      message,
      error,
      errors,
    },
    { status }
  );
}

/**
 * Unauthorized response
 */
export function unauthorizedResponse(message: string = 'Unauthorized'): NextResponse<ApiResponse> {
  return errorResponse(message, 401, 'UNAUTHORIZED');
}

/**
 * Forbidden response
 */
export function forbiddenResponse(message: string = 'Forbidden'): NextResponse<ApiResponse> {
  return errorResponse(message, 403, 'FORBIDDEN');
}

/**
 * Not found response
 */
export function notFoundResponse(message: string = 'Resource not found'): NextResponse<ApiResponse> {
  return errorResponse(message, 404, 'NOT_FOUND');
}

/**
 * Validation error response
 */
export function validationErrorResponse(
  errors: Record<string, string[]>,
  message: string = 'Validation failed'
): NextResponse<ApiResponse> {
  return errorResponse(message, 422, 'VALIDATION_ERROR', errors);
}

/**
 * Internal server error response
 */
export function serverErrorResponse(
  message: string = 'Internal server error',
  error?: string
): NextResponse<ApiResponse> {
  return errorResponse(message, 500, error || 'INTERNAL_SERVER_ERROR');
}
