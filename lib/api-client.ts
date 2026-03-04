/**
 * API Client utility for making authenticated API calls
 */

export interface ApiError {
  success: false;
  message: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

/**
 * Get auth token from localStorage (for API key authentication)
 * Note: With Clerk, we use session-based auth, but API keys are still stored here
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
}

/**
 * Set auth token in localStorage
 */
export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('authToken', token);
}

/**
 * Remove auth token from localStorage
 */
export function removeAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('authToken');
}

/**
 * Make authenticated API request
 * With Clerk, authentication is handled via cookies/session
 * API key is optional for programmatic access
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add API key if available (for programmatic access)
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`/api${endpoint}`, {
      ...options,
      headers,
      credentials: 'include', // Include cookies for Clerk session
    });

    // Check if response is JSON before parsing
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Non-JSON response received:', text.substring(0, 200));
      return {
        success: false,
        message: `Server returned ${response.status} ${response.statusText}. Expected JSON response.`,
        error: 'INVALID_RESPONSE',
      };
    }

    const data = await response.json();

    if (!response.ok || !data.success) {
      return {
        success: false,
        message: data.message || 'Request failed',
        error: data.error,
        errors: data.errors,
      };
    }

    return data as ApiSuccess<T>;
  } catch (error) {
    console.error('API request error:', error);
    return {
      success: false,
      message: 'Network error. Please check your connection.',
      error: 'NETWORK_ERROR',
    };
  }
}

/**
 * Make unauthenticated API request (for login/register)
 */
export async function publicApiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`/api${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    // Check if response is JSON before parsing
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Non-JSON response received:', text.substring(0, 200));
      return {
        success: false,
        message: `Server returned ${response.status} ${response.statusText}. Expected JSON response.`,
        error: 'INVALID_RESPONSE',
      };
    }

    const data = await response.json();

    if (!response.ok || !data.success) {
      return {
        success: false,
        message: data.message || 'Request failed',
        error: data.error,
        errors: data.errors,
      };
    }

    return data as ApiSuccess<T>;
  } catch (error) {
    console.error('API request error:', error);
    return {
      success: false,
      message: 'Network error. Please check your connection.',
      error: 'NETWORK_ERROR',
    };
  }
}
