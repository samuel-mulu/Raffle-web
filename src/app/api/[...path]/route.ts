import { NextRequest } from 'next/server';

const BACKEND_URL = (
  process.env.RAFFLE_API_URL ||
  process.env.API_URL ||
  'http://localhost:3001'
).replace(/\/$/, '');

export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{
    path: string[];
  }>;
};

async function forwardRequest(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  const targetUrl = new URL(`${BACKEND_URL}/${path.join('/')}`);
  targetUrl.search = request.nextUrl.search;

  const headers = new Headers();
  const authorization = request.headers.get('authorization');
  const contentType = request.headers.get('content-type');
  const accept = request.headers.get('accept');

  if (authorization) {
    headers.set('authorization', authorization);
  }

  if (contentType) {
    headers.set('content-type', contentType);
  }

  if (accept) {
    headers.set('accept', accept);
  }

  const response = await fetch(targetUrl, {
    method: request.method,
    headers,
    body:
      request.method === 'GET' || request.method === 'HEAD'
        ? undefined
        : await request.text(),
    cache: 'no-store',
    redirect: 'manual',
  });

  const responseHeaders = new Headers();
  const responseContentType = response.headers.get('content-type');

  if (responseContentType) {
    responseHeaders.set('content-type', responseContentType);
  }

  return new Response(await response.arrayBuffer(), {
    status: response.status,
    headers: responseHeaders,
  });
}

export function GET(request: NextRequest, context: RouteContext) {
  return forwardRequest(request, context);
}

export function POST(request: NextRequest, context: RouteContext) {
  return forwardRequest(request, context);
}

export function PATCH(request: NextRequest, context: RouteContext) {
  return forwardRequest(request, context);
}

export function DELETE(request: NextRequest, context: RouteContext) {
  return forwardRequest(request, context);
}
