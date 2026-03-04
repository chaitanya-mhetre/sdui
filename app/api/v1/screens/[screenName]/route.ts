import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { prisma } from '@/lib/db';

/**
 * CORS headers for Flutter SDK requests
 */
function getCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, If-None-Match',
    'Access-Control-Max-Age': '86400',
  };
}

/**
 * Handle OPTIONS preflight requests
 */
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(),
  });
}

/**
 * Public Flutter SDK endpoint — returns the latest active LayoutVersion.
 *
 * GET /api/v1/screens/[screenName]?apiKey=xxx
 *
 * Supports ETag / If-None-Match → 304 Not Modified.
 * Cache-Control: public, max-age=0, s-maxage=60, stale-while-revalidate=300
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ screenName: string }> }
) {
  const start = Date.now();

  try {
    const { screenName } = await params;
    const apiKey = request.nextUrl.searchParams.get('apiKey');

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'API key is required. Pass ?apiKey=your-project-api-key' },
        { 
          status: 401,
          headers: getCorsHeaders(),
        }
      );
    }

    // Validate API key → resolve project
    const project = await prisma.project.findUnique({
      where: { apiKey },
      select: { id: true, status: true, name: true },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Invalid API key' },
        { 
          status: 401,
          headers: getCorsHeaders(),
        }
      );
    }

    if (project.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: 'Project is suspended' },
        { 
          status: 403,
          headers: getCorsHeaders(),
        }
      );
    }

    // Fetch the latest active LayoutVersion for this screen
    const lv = await prisma.layoutVersion.findFirst({
      where: {
        projectId: project.id,
        screenName,
        isActive: true,
      },
      orderBy: { version: 'desc' },
      select: {
        id: true,
        version: true,
        screenName: true,
        rexaJson: true,
        publishedAt: true,
      },
    });

    if (!lv) {
      // Fallback: check if there's a published layout with matching screenName
      // (handles edge case where layout is published but no LayoutVersion was created)
      const publishedLayout = await prisma.layout.findFirst({
        where: { 
          projectId: project.id, 
          screenName,
          isPublished: true,
        },
        select: { 
          id: true,
          version: true,
          screenName: true,
          rexaJson: true,
          publishedAt: true,
        },
      });

      if (publishedLayout && publishedLayout.rexaJson) {
        // Use the layout's rexaJson as fallback (backward compatibility)
        const responseTime = Date.now() - start;
        const payload = publishedLayout.rexaJson as Record<string, unknown>;

        // ETag for fallback layout
        const etag = `"${createHash('sha256')
          .update(publishedLayout.id + JSON.stringify(payload))
          .digest('hex')
          .slice(0, 32)}"`;

        // ETag-based conditional response
        const ifNoneMatch = request.headers.get('if-none-match');
        if (ifNoneMatch === etag) {
          return new Response(null, {
            status: 304,
            headers: {
              ...getCorsHeaders(),
              ETag: etag,
              'Cache-Control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=300',
            },
          });
        }

        return NextResponse.json(
          {
            success: true,
            screen: publishedLayout.screenName ?? screenName,
            version: publishedLayout.version,
            publishedAt: publishedLayout.publishedAt,
            layout: payload,
          },
          {
            headers: {
              ...getCorsHeaders(),
              ETag: etag,
              'Cache-Control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=300',
              'X-Response-Time': `${responseTime}ms`,
              'X-REXA-Version': String(publishedLayout.version),
              'X-Fallback': 'true', // Indicate this is a fallback response
            },
          }
        );
      }

      // No published layout found - check if draft exists
      const draft = await prisma.layout.findFirst({
        where: { projectId: project.id, screenName },
        select: { isPublished: true },
      });

      const hint = draft
        ? ' A draft exists but has not been published yet.'
        : '';

      return NextResponse.json(
        {
          success: false,
          error: `No published layout found for screen: "${screenName}".${hint}`,
        },
        { 
          status: 404,
          headers: getCorsHeaders(),
        }
      );
    }

    const responseTime = Date.now() - start;
    const payload = lv.rexaJson;

    // ETag = SHA-256 of the JSON payload, scoped to version id
    const etag = `"${createHash('sha256')
      .update(lv.id + JSON.stringify(payload))
      .digest('hex')
      .slice(0, 32)}"`;

    // ETag-based conditional response
    const ifNoneMatch = request.headers.get('if-none-match');
    if (ifNoneMatch === etag) {
      return new Response(null, {
        status: 304,
        headers: {
          ...getCorsHeaders(),
          ETag: etag,
          'Cache-Control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=300',
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        screen: lv.screenName ?? screenName,
        version: lv.version,
        publishedAt: lv.publishedAt,
        layout: payload,
      },
      {
        headers: {
          ...getCorsHeaders(),
          ETag: etag,
          'Cache-Control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=300',
          'X-Response-Time': `${responseTime}ms`,
          'X-REXA-Version': String(lv.version),
        },
      }
    );
  } catch (error) {
    console.error('Public layout API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { 
        status: 500,
        headers: getCorsHeaders(),
      }
    );
  }
}
