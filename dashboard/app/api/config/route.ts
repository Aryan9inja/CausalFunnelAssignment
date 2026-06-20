import { NextResponse } from 'next/server';

export async function GET() {
  const response = NextResponse.json({
    apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
  });

  // Expose configuration via CORS to enable scripts served on other domains to read it
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');

  return response;
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');

  return response;
}
