'use client';

import dynamic from 'next/dynamic';

const DebugSessionContent = dynamic(() => import('./DebugSessionContent'), { ssr: false });

export default function DebugSession() {
  return <DebugSessionContent />;
}