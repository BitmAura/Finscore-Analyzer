/**
 * System Verification Script
 * Checks all integrations and end-to-end features
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 FinScore Analyzer - System Verification\n');
console.log('=' .repeat(60));

// Test 1: Environment Variables
console.log('\n✅ Test 1: Environment Variables');
console.log(`   SUPABASE_URL: ${SUPABASE_URL ? '✓ Set' : '✗ Missing'}`);
console.log(`   SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing'}`);

// Test 2: Supabase Connection
console.log('\n✅ Test 2: Supabase Connection');
if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  supabase.auth.getSession()
    .then(({ data, error }) => {
      if (error) {
        console.log(`   ✗ Connection Error: ${error.message}`);
      } else {
        console.log('   ✓ Connection Successful');
      }
    })
    .catch(err => {
      console.log(`   ✗ Network Error: ${err.message}`);
      console.log('   💡 Possible causes:');
      console.log('      - No internet connection');
      console.log('      - Supabase project is paused');
      console.log('      - Invalid credentials');
      console.log('      - CORS configuration issue');
    });
} else {
  console.log('   ✗ Cannot test - Environment variables missing');
}

// Test 3: File Structure
console.log('\n✅ Test 3: Critical Files');
const criticalFiles = [
  'src/lib/supabase.ts',
  'src/lib/supabase-client.ts',
  'src/app/login/page.tsx',
  'src/app/analyst-dashboard/page.tsx',
  'middleware.ts',
  '.env.local'
];

criticalFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`   ${exists ? '✓' : '✗'} ${file}`);
});

// Test 4: Dependencies
console.log('\n✅ Test 4: Key Dependencies');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const keyDeps = [
  '@supabase/supabase-js',
  '@supabase/auth-helpers-nextjs',
  '@supabase/auth-helpers-react',
  'next',
  'react',
  'chart.js',
  'react-chartjs-2'
];

keyDeps.forEach(dep => {
  const installed = packageJson.dependencies[dep] || packageJson.devDependencies[dep];
  console.log(`   ${installed ? '✓' : '✗'} ${dep} ${installed ? `(${installed})` : ''}`);
});

// Test 5: Test Files
console.log('\n✅ Test 5: Test Files Structure');
const testDirs = [
  'src/components/analytics/__tests__',
  'src/components/dashboard/__tests__',
  'src/components/ui/__tests__',
  'src/contexts/__tests__'
];

testDirs.forEach(dir => {
  const exists = fs.existsSync(path.join(__dirname, dir));
  if (exists) {
    const files = fs.readdirSync(path.join(__dirname, dir));
    console.log(`   ✓ ${dir} (${files.length} test files)`);
  } else {
    console.log(`   ✗ ${dir}`);
  }
});

console.log('\n' + '='.repeat(60));
console.log('\n📋 Summary:');
console.log('   Run "npm run test" to see detailed test results');
console.log('   Run "npm run dev" to start development server');
console.log('   Check browser console for runtime errors');
console.log('\n');

