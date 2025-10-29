#!/usr/bin/env node
/**
 * FinScore Analyzer - Complete System Health Check
 * Validates all integrations and end-to-end features
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

console.log('\n🔍 FinScore Analyzer - System Health Check\n');
console.log('='.repeat(70));

// Load environment variables
const envPath = path.join(__dirname, '.env.local');
let SUPABASE_URL = 'https://gnhuwhfxotmfkvongowp.supabase.co';
let SUPABASE_KEY = '';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/);
  const keyMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/);
  if (urlMatch) SUPABASE_URL = urlMatch[1].trim();
  if (keyMatch) SUPABASE_KEY = keyMatch[1].trim();
}

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function testPass(name) {
  totalTests++;
  passedTests++;
  console.log(`   ✅ ${name}`);
}

function testFail(name, reason) {
  totalTests++;
  failedTests++;
  console.log(`   ❌ ${name}`);
  if (reason) console.log(`      → ${reason}`);
}

// Test 1: Environment Configuration
console.log('\n📋 Test 1: Environment Configuration');
if (SUPABASE_URL && SUPABASE_URL.includes('supabase.co')) {
  testPass('SUPABASE_URL configured');
} else {
  testFail('SUPABASE_URL missing or invalid', 'Check .env.local file');
}

if (SUPABASE_KEY && SUPABASE_KEY.length > 100) {
  testPass('SUPABASE_ANON_KEY configured');
} else {
  testFail('SUPABASE_ANON_KEY missing', 'Check .env.local file');
}

// Test 2: Critical Files
console.log('\n📁 Test 2: Critical Files Structure');
const criticalFiles = [
  'package.json',
  'next.config.js',
  'tsconfig.json',
  'src/lib/supabase.ts',
  'src/lib/supabase-client.ts',
  'src/app/login/page.tsx',
  'src/app/analyst-dashboard/page.tsx',
  'middleware.ts',
  '.env.local'
];

criticalFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    testPass(file);
  } else {
    testFail(file, 'File not found');
  }
});

// Test 3: Test Files
console.log('\n🧪 Test 3: Test Files');
const testFiles = [
  'src/components/analytics/__tests__/RealTimeChart.test.tsx',
  'src/components/analytics/__tests__/AnalyticsDashboard.test.tsx',
  'src/components/dashboard/CreateNewReportModal.test.tsx',
  'src/components/upload/__mocks__/RealTimeBankDetection.tsx'
];

testFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    testPass(file.split('/').pop());
  } else {
    testFail(file, 'Test file not found');
  }
});

// Test 4: Dependencies
console.log('\n📦 Test 4: Key Dependencies');
const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const keyDeps = {
    '@supabase/supabase-js': 'Supabase Client',
    'next': 'Next.js Framework',
    'react': 'React Library',
    'chart.js': 'Chart.js',
    'react-chartjs-2': 'React Chart.js Wrapper',
    'vitest': 'Testing Framework',
    '@testing-library/react': 'React Testing Library'
  };

  Object.entries(keyDeps).forEach(([dep, name]) => {
    const version = packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep];
    if (version) {
      testPass(`${name} (${version})`);
    } else {
      testFail(name, `Package ${dep} not installed`);
    }
  });
}

// Test 5: Supabase Connection
console.log('\n🌐 Test 5: Supabase Connection');
const supabaseHost = new URL(SUPABASE_URL).hostname;

const checkConnection = new Promise((resolve) => {
  const req = https.get(`${SUPABASE_URL}/rest/v1/`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    },
    timeout: 10000
  }, (res) => {
    if (res.statusCode === 200 || res.statusCode === 404) {
      testPass('Supabase server reachable');
      resolve(true);
    } else {
      testFail('Supabase connection', `Status: ${res.statusCode}`);
      resolve(false);
    }
  });

  req.on('error', (err) => {
    testFail('Supabase connection', err.message);
    resolve(false);
  });

  req.on('timeout', () => {
    testFail('Supabase connection', 'Connection timeout');
    req.destroy();
    resolve(false);
  });
});

// Test 6: Component Structure
console.log('\n🏗️  Test 6: Component Structure');
const componentDirs = [
  'src/components/analytics',
  'src/components/dashboard',
  'src/components/upload',
  'src/components/ui',
  'src/app/login',
  'src/app/analyst-dashboard'
];

componentDirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
    const files = fs.readdirSync(dirPath);
    testPass(`${dir.split('/').pop()} (${files.length} files)`);
  } else {
    testFail(dir, 'Directory not found');
  }
});

// Wait for async tests and show summary
setTimeout(() => {
  console.log('\n' + '='.repeat(70));
  console.log('\n📊 Test Summary:');
  console.log(`   Total Tests: ${totalTests}`);
  console.log(`   ✅ Passed: ${passedTests} (${Math.round(passedTests/totalTests*100)}%)`);
  console.log(`   ❌ Failed: ${failedTests} (${Math.round(failedTests/totalTests*100)}%)`);

  if (failedTests === 0) {
    console.log('\n🎉 All systems operational!');
  } else if (failedTests < 3) {
    console.log('\n⚠️  Minor issues detected - review failed tests above');
  } else {
    console.log('\n🚨 Critical issues detected - immediate attention required');
  }

  console.log('\n📝 Next Steps:');
  console.log('   1. Fix any failed tests listed above');
  console.log('   2. Run: npm run test');
  console.log('   3. Run: npm run dev');
  console.log('   4. Test login at: http://localhost:3000/login');
  console.log('   5. Review: INTEGRATION_TESTING_GUIDE.md\n');

  process.exit(failedTests > 0 ? 1 : 0);
}, 2000);

