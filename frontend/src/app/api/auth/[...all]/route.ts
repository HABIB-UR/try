/**
 * Better Auth API Route Handler
 *
 * This catch-all route handles authentication API requests.
 * In our implementation, auth is handled directly by the FastAPI backend,
 * so this route primarily serves as a proxy or placeholder for Better Auth integration.
 *
 * The frontend auth.ts module handles direct communication with the backend API.
 */

import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Handle all auth-related requests
 * Proxies requests to the FastAPI backend
 */
async function handler(request: NextRequest) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/auth', '');

  // Build the backend URL
  const backendUrl = `${API_URL}/api/auth${path}`;

  try {
    // Forward the request to the backend
    const response = await fetch(backendUrl, {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
        // Forward authorization header if present
        ...(request.headers.get('authorization')
          ? { Authorization: request.headers.get('authorization')! }
          : {}),
      },
      body: request.method !== 'GET' ? await request.text() : undefined,
    });

    const data = await response.json().catch(() => ({}));

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Auth proxy error:', error);
    return NextResponse.json(
      { detail: 'Authentication service unavailable' },
      { status: 503 }
    );
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
