import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Lightweight readiness probe. Avoids heavy downstream checks.
  // Extend here with quick pings to essential services if needed.
  const startedAt = Number(process.env.BOOT_TIME || Date.now());
  const uptimeSeconds = Math.round(process.uptime());

  return NextResponse.json(
    {
      status: 'ready',
      env: process.env.NODE_ENV || 'development',
      node: process.version,
      uptimeSeconds,
      timestamp: new Date().toISOString(),
      startedAt,
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    }
  );
}
