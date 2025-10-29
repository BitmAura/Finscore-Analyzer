import { NextResponse } from 'next/server';
import supabaseAdmin from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const checks = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    version: process.env.npm_package_version || '0.1.0',
    environment: process.env.NODE_ENV || 'development',
    checks: {
      database: 'unknown',
      auth: 'unknown',
      storage: 'unknown',
    },
    details: {} as Record<string, any>,
  };

  try {
    // Check database connection
    try {
      const { data, error: dbError } = await supabaseAdmin
        .from('analysis_jobs')
        .select('count')
        .limit(1);
      
      if (dbError) throw dbError;
      
      checks.checks.database = 'healthy';
      checks.details.database = { connected: true, tables: 'accessible' };
    } catch (error) {
      checks.checks.database = 'unhealthy';
      checks.details.database = { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }

    // Check auth service
    try {
      const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1
      });
      
      if (authError) throw authError;
      
      checks.checks.auth = 'healthy';
      checks.details.auth = { 
        service: 'active',
        totalUsers: users?.length || 0 
      };
    } catch (error) {
      checks.checks.auth = 'unhealthy';
      checks.details.auth = { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }

    // Check storage service
    try {
      const { data: buckets, error: storageError } = await supabaseAdmin.storage.listBuckets();
      
      if (storageError) throw storageError;
      
      checks.checks.storage = 'healthy';
      checks.details.storage = { 
        service: 'active',
        buckets: buckets?.map(b => b.name) || [] 
      };
    } catch (error) {
      checks.checks.storage = 'unhealthy';
      checks.details.storage = { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }

    // Determine overall status
    const allHealthy = Object.values(checks.checks).every(status => status === 'healthy');
    const someUnhealthy = Object.values(checks.checks).some(status => status === 'unhealthy');
    
    checks.status = allHealthy ? 'healthy' : someUnhealthy ? 'unhealthy' : 'degraded';

    const httpStatus = allHealthy ? 200 : 503;

    return NextResponse.json(checks, { 
      status: httpStatus,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Health check error:', error);
    
    return NextResponse.json({
      ...checks,
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  }
}
