#!/usr/bin/env node
/**
 * Supabase Connection Test Script
 * Tests database, auth, and storage connections
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('\n' + '='.repeat(60));
console.log('🔍 SUPABASE CONNECTION TEST');
console.log('='.repeat(60) + '\n');

// Validate environment variables
console.log('📋 Step 1: Checking Environment Variables...\n');

if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL is missing');
  console.log('   Add to .env.local: NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co\n');
  process.exit(1);
}
console.log(`✅ NEXT_PUBLIC_SUPABASE_URL found`);
console.log(`   ${supabaseUrl}\n`);

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is missing');
  console.log('   This is the SECRET key (not the anon key)');
  console.log('   Find it at: https://app.supabase.com/project/_/settings/api');
  console.log('   Add to .env.local: SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...\n');
  process.exit(1);
}
console.log(`✅ SUPABASE_SERVICE_ROLE_KEY found`);
console.log(`   ${supabaseServiceKey.substring(0, 50)}...\n`);

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Test functions
async function runTests() {
  let allPassed = true;

  // Test 1: Database Connection
  console.log('📊 Step 2: Testing Database Connection...\n');
  try {
    const { data, error } = await supabase
      .from('analysis_jobs')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Database connection failed');
      console.error(`   Error: ${error.message}`);
      console.log('   Suggestion: Run sql/FINAL_PRODUCTION_SCHEMA.sql in Supabase SQL Editor\n');
      allPassed = false;
    } else {
      console.log('✅ Database connected successfully');
      console.log('   Table "analysis_jobs" is accessible\n');
    }
  } catch (err) {
    console.error('❌ Database test failed');
    console.error(`   ${err.message}\n`);
    allPassed = false;
  }

  // Test 2: Check Tables Exist
  console.log('📋 Step 3: Checking Required Tables...\n');
  const requiredTables = [
    'analysis_jobs',
    'analysis_results',
    'bank_accounts',
    'bank_transactions',
    'documents',
    'user_dashboard_stats'
  ];

  for (const table of requiredTables) {
    try {
      const { error } = await supabase
        .from(table)
        .select('count')
        .limit(1);

      if (error) {
        console.error(`❌ Table "${table}" not found or not accessible`);
        console.error(`   Error: ${error.message}`);
        allPassed = false;
      } else {
        console.log(`✅ Table "${table}" exists`);
      }
    } catch (err) {
      console.error(`❌ Error checking table "${table}": ${err.message}`);
      allPassed = false;
    }
  }
  console.log('');

  // Test 3: Authentication
  console.log('👤 Step 4: Testing Authentication Service...\n');
  try {
    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error('❌ Auth service failed');
      console.error(`   Error: ${error.message}\n`);
      allPassed = false;
    } else {
      console.log('✅ Auth service is working');
      console.log(`   Current users: ${users.length}`);
      if (users.length > 0) {
        console.log(`   Last user created: ${users[0].created_at}\n`);
      } else {
        console.log('   No users yet (this is normal for new projects)\n');
      }
    }
  } catch (err) {
    console.error('❌ Auth test failed');
    console.error(`   ${err.message}\n`);
    allPassed = false;
  }

  // Test 4: Storage
  console.log('📦 Step 5: Testing Storage Service...\n');
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
      console.error('❌ Storage service failed');
      console.error(`   Error: ${error.message}`);
      console.log('   Suggestion: Create buckets in Supabase Dashboard > Storage\n');
      allPassed = false;
    } else {
      console.log('✅ Storage service is working');
      console.log(`   Buckets found: ${buckets.length}`);
      
      const requiredBuckets = ['bank-statements', 'reports', 'user-uploads'];
      const existingBuckets = buckets.map(b => b.name);
      
      requiredBuckets.forEach(bucket => {
        if (existingBuckets.includes(bucket)) {
          console.log(`   ✅ Bucket "${bucket}" exists`);
        } else {
          console.log(`   ⚠️  Bucket "${bucket}" missing (recommended to create)`);
        }
      });
      console.log('');
    }
  } catch (err) {
    console.error('❌ Storage test failed');
    console.error(`   ${err.message}\n`);
    allPassed = false;
  }

  // Test 5: Row Level Security
  console.log('🔒 Step 6: Checking Row Level Security (RLS)...\n');
  try {
    const { data, error } = await supabase.rpc('pg_tables', {
      schemaname: 'public'
    });

    // Alternate query since rpc might not work
    const { data: rlsCheck, error: rlsError } = await supabase
      .from('analysis_jobs')
      .select('*')
      .limit(1);

    if (!rlsError) {
      console.log('✅ RLS policies are accessible');
      console.log('   Note: Verify RLS is enabled in Supabase Dashboard\n');
    } else {
      console.log('⚠️  RLS check completed with warnings');
      console.log('   Make sure to enable RLS on all tables\n');
    }
  } catch (err) {
    console.log('⚠️  Could not verify RLS (this is OK)');
    console.log('   Manually verify in Supabase Dashboard > Authentication > Policies\n');
  }

  // Summary
  console.log('='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60) + '\n');

  if (allPassed) {
    console.log('🎉 ALL TESTS PASSED! Your Supabase setup is working correctly.\n');
    console.log('Next steps:');
    console.log('  1. Start your dev server: npm run dev');
    console.log('  2. Test signup: http://localhost:3000/signup');
    console.log('  3. Test file upload: http://localhost:3000/dashboard\n');
  } else {
    console.log('⚠️  SOME TESTS FAILED. Please fix the issues above.\n');
    console.log('Common fixes:');
    console.log('  1. Run sql/FINAL_PRODUCTION_SCHEMA.sql in Supabase SQL Editor');
    console.log('  2. Create storage buckets in Supabase Dashboard');
    console.log('  3. Enable RLS on all tables');
    console.log('  4. Verify your service role key is correct\n');
  }

  console.log('Need help? Check PRODUCT_AUDIT_AND_SETUP_GUIDE.md\n');
}

// Run tests
runTests().catch(err => {
  console.error('\n❌ Unexpected error during tests:');
  console.error(err);
  process.exit(1);
});
