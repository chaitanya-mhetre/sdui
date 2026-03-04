import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

// Mock env validation so it doesn't throw during tests
vi.mock('@/lib/env', () => ({ env: {} }));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock db
vi.mock('@/lib/db', () => ({
  prisma: { user: { findUnique: vi.fn() } },
  Prisma: {},
}));

// Mock clerk-auth
vi.mock('@/lib/clerk-auth', () => ({
  getClerkUser: vi.fn(),
}));

// Mock auth utilities
vi.mock('@/lib/auth', () => ({
  getUserByApiKey: vi.fn(),
  isAdmin: vi.fn(() => false),
  isUserActive: vi.fn(() => true),
}));

import { authenticateRequest } from '@/lib/api-middleware';
import { auth } from '@clerk/nextjs/server';
import { getClerkUser } from '@/lib/clerk-auth';
import { getUserByApiKey, isUserActive } from '@/lib/auth';

function makeRequest(url = 'http://localhost/api/test', headers: Record<string, string> = {}) {
  return new NextRequest(url, { headers });
}

describe('requireAuth middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when no auth credentials provided', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as any);

    const result = await authenticateRequest(makeRequest());

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(401);
  });

  it('returns 401 for invalid API key', async () => {
    vi.mocked(getUserByApiKey).mockResolvedValue(null);

    const result = await authenticateRequest(
      makeRequest('http://localhost/api/test', { authorization: 'Bearer invalid-key' })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(401);
  });

  it('attaches user to request when valid API key is provided', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com', name: 'Test', role: 'USER', plan: 'FREE', status: 'ACTIVE' };
    vi.mocked(getUserByApiKey).mockResolvedValue(mockUser as any);
    vi.mocked(isUserActive).mockReturnValue(true);

    const result = await authenticateRequest(
      makeRequest('http://localhost/api/test', { authorization: 'Bearer valid-key' })
    );

    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as any).user).toMatchObject({ id: 'user-1', email: 'test@example.com' });
  });

  it('attaches user to request when valid Clerk session is present', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'clerk-123' } as any);
    const mockUser = { id: 'user-2', email: 'clerk@example.com', name: 'Clerk', role: 'USER', plan: 'FREE', status: 'ACTIVE' };
    vi.mocked(getClerkUser).mockResolvedValue(mockUser as any);
    vi.mocked(isUserActive).mockReturnValue(true);

    const result = await authenticateRequest(makeRequest());

    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as any).user).toMatchObject({ id: 'user-2' });
  });

  it('returns 403 when user account is suspended', async () => {
    const mockUser = { id: 'user-3', email: 'x@example.com', name: null, role: 'USER', plan: 'FREE', status: 'SUSPENDED' };
    vi.mocked(getUserByApiKey).mockResolvedValue(mockUser as any);
    vi.mocked(isUserActive).mockReturnValue(false);

    const result = await authenticateRequest(
      makeRequest('http://localhost/api/test', { authorization: 'Bearer some-key' })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(403);
  });
});
