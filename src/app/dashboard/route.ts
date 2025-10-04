import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  return NextResponse.redirect(new URL('/analyst-dashboard', url));
}

