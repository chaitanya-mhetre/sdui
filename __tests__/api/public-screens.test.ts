import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const mockPrisma = vi.hoisted(() => ({
  project: { findUnique: vi.fn() },
  layoutVersion: { findFirst: vi.fn() },
  layout: { findFirst: vi.fn() },
}));

vi.mock('@/lib/env', () => ({ env: {} }));
vi.mock('@/lib/db', () => ({ prisma: mockPrisma, Prisma: {} }));

import { GET } from '@/app/api/v1/screens/[screenName]/route';

const mockProject = { id: 'proj-1', status: 'ACTIVE', name: 'Test Project' };
const mockLayoutVersion = {
  id: 'lv-1',
  version: 3,
  screenName: 'home',
  sduiJson: { type: 'scaffold', children: [] },
  publishedAt: new Date('2024-01-01'),
};

describe('GET /api/v1/screens/[screenName]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when apiKey is missing', async () => {
    const req = new NextRequest('http://localhost/api/v1/screens/home');
    const response = await GET(req, { params: Promise.resolve({ screenName: 'home' }) });
    expect(response.status).toBe(401);
  });

  it('returns 401 for invalid apiKey', async () => {
    mockPrisma.project.findUnique.mockResolvedValue(null);

    const req = new NextRequest('http://localhost/api/v1/screens/home?apiKey=bad-key');
    const response = await GET(req, { params: Promise.resolve({ screenName: 'home' }) });
    expect(response.status).toBe(401);
  });

  it('returns 403 for suspended project', async () => {
    mockPrisma.project.findUnique.mockResolvedValue({ ...mockProject, status: 'SUSPENDED' });

    const req = new NextRequest('http://localhost/api/v1/screens/home?apiKey=valid-key');
    const response = await GET(req, { params: Promise.resolve({ screenName: 'home' }) });
    expect(response.status).toBe(403);
  });

  it('returns 404 when no published layout exists', async () => {
    mockPrisma.project.findUnique.mockResolvedValue(mockProject);
    mockPrisma.layoutVersion.findFirst.mockResolvedValue(null);
    mockPrisma.layout.findFirst.mockResolvedValue(null);

    const req = new NextRequest('http://localhost/api/v1/screens/home?apiKey=valid-key');
    const response = await GET(req, { params: Promise.resolve({ screenName: 'home' }) });
    expect(response.status).toBe(404);
  });

  it('returns 200 with layout data for valid request', async () => {
    mockPrisma.project.findUnique.mockResolvedValue(mockProject);
    mockPrisma.layoutVersion.findFirst.mockResolvedValue(mockLayoutVersion);

    const req = new NextRequest('http://localhost/api/v1/screens/home?apiKey=valid-key');
    const response = await GET(req, { params: Promise.resolve({ screenName: 'home' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.version).toBe(3);
    expect(response.headers.get('ETag')).toBeTruthy();
    expect(response.headers.get('Cache-Control')).toContain('s-maxage=60');
  });

  it('returns 304 when ETag matches (conditional GET)', async () => {
    mockPrisma.project.findUnique.mockResolvedValue(mockProject);
    mockPrisma.layoutVersion.findFirst.mockResolvedValue(mockLayoutVersion);

    // First request to get the ETag
    const first = await GET(
      new NextRequest('http://localhost/api/v1/screens/home?apiKey=valid-key'),
      { params: Promise.resolve({ screenName: 'home' }) }
    );
    const etag = first.headers.get('ETag')!;

    // Second request with matching ETag
    const second = await GET(
      new NextRequest('http://localhost/api/v1/screens/home?apiKey=valid-key', {
        headers: { 'if-none-match': etag },
      }),
      { params: Promise.resolve({ screenName: 'home' }) }
    );

    expect(second.status).toBe(304);
  });
});
