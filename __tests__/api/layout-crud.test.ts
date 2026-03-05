import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const mockPrisma = vi.hoisted(() => ({
  layout: {
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('@/lib/env', () => ({ env: {} }));
vi.mock('@clerk/nextjs/server', () => ({ auth: vi.fn().mockResolvedValue({ userId: null }) }));
vi.mock('@/lib/clerk-auth', () => ({ getClerkUser: vi.fn() }));
vi.mock('@/lib/db', () => ({ prisma: mockPrisma, Prisma: {} }));
vi.mock('@/lib/sdui/validation', () => ({
  validateSduiJson: vi.fn(() => ({ valid: true })),
}));

const mockGetUserByApiKey = vi.hoisted(() => vi.fn());
const mockIsUserActive = vi.hoisted(() => vi.fn(() => true));

vi.mock('@/lib/auth', () => ({
  getUserByApiKey: mockGetUserByApiKey,
  isAdmin: vi.fn(() => false),
  isUserActive: mockIsUserActive,
}));

import { PATCH, DELETE } from '@/app/api/layouts/[id]/route';

const ownerUser = { id: 'owner-user', email: 'owner@example.com', name: null, role: 'USER', plan: 'FREE', status: 'ACTIVE' };
const attackerUser = { id: 'attacker-user', email: 'attacker@example.com', name: null, role: 'USER', plan: 'FREE', status: 'ACTIVE' };

const mockLayout = {
  id: 'layout-1',
  name: 'Test Layout',
  projectId: 'proj-1',
  version: 1,
  project: { userId: 'owner-user' },
};

describe('Layout ownership checks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsUserActive.mockReturnValue(true);
  });

  it('returns 403 when non-owner tries to update layout', async () => {
    mockPrisma.layout.findUnique.mockResolvedValue(mockLayout);
    mockGetUserByApiKey.mockResolvedValue(attackerUser);

    const req = new NextRequest('http://localhost/api/layouts/layout-1', {
      method: 'PATCH',
      headers: { authorization: 'Bearer attacker-key', 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'Hacked' }),
    });

    const response = await PATCH(req);
    expect(response.status).toBe(403);
  });

  it('allows owner to update their own layout', async () => {
    mockPrisma.layout.findUnique.mockResolvedValue(mockLayout);
    mockPrisma.layout.update.mockResolvedValue({ ...mockLayout, name: 'Updated' });
    mockGetUserByApiKey.mockResolvedValue(ownerUser);

    const req = new NextRequest('http://localhost/api/layouts/layout-1', {
      method: 'PATCH',
      headers: { authorization: 'Bearer owner-key', 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'Updated' }),
    });

    const response = await PATCH(req);
    expect(response.status).toBe(200);
  });

  it('returns 403 when non-owner tries to delete layout', async () => {
    mockPrisma.layout.findUnique.mockResolvedValue(mockLayout);
    mockGetUserByApiKey.mockResolvedValue(attackerUser);

    const req = new NextRequest('http://localhost/api/layouts/layout-1', {
      method: 'DELETE',
      headers: { authorization: 'Bearer attacker-key' },
    });

    const response = await DELETE(req);
    expect(response.status).toBe(403);
  });

  it('returns 422 when rootNode fails validation', async () => {
    mockPrisma.layout.findUnique.mockResolvedValue(mockLayout);
    mockGetUserByApiKey.mockResolvedValue(ownerUser);

    const { validateSduiJson } = await import('@/lib/sdui/validation');
    vi.mocked(validateSduiJson).mockReturnValue({ valid: false, error: 'Exceeded max depth of 20' } as any);

    const req = new NextRequest('http://localhost/api/layouts/layout-1', {
      method: 'PATCH',
      headers: { authorization: 'Bearer owner-key', 'content-type': 'application/json' },
      body: JSON.stringify({ rootNode: { type: 'scaffold', children: [] } }),
    });

    const response = await PATCH(req);
    expect(response.status).toBe(422);
  });
});
