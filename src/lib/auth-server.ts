import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import type { NextRequest } from 'next/server';
import type { ServerAuth } from './auth-server.d';
import { cookies } from 'next/headers';

export async function getServerAuth(request: NextRequest): Promise<ServerAuth> {
  // Use the cookies helper directly for the route handler client
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient({ cookies: async () => cookieStore });
  const { data: { session } } = await supabase.auth.getSession();
  return session as unknown as ServerAuth;
}

export function getUserId(session: ServerAuth): string | null {
  return session?.user?.id || null;
}
