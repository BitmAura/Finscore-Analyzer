#!/usr/bin/env node
/**
 * Fix Supabase cookies() API pattern
 * Changes: cookies: async () => cookieStore  →  cookies: () => cookieStore
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const pattern = 'src/app/api/**/route.ts';
const files = glob.sync(pattern);

let fixedCount = 0;
let skippedCount = 0;

console.log(`\n🔧 Fixing Supabase cookies pattern in ${files.length} API routes...\n`);

files.forEach(filePath => {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Pattern to fix: cookies: async () => cookieStore
  const fixed = content.replace(
    /cookies:\s*async\s*\(\)\s*=>\s*cookieStore/g,
    'cookies: () => cookieStore'
  );
  
  if (fixed !== content) {
    fs.writeFileSync(filePath, fixed, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
    fixedCount++;
  } else {
    console.log(`⏭️  Skipped: ${filePath} (no changes needed)`);
    skippedCount++;
  }
});

console.log(`\n${'='.repeat(60)}`);
console.log(`📊 Summary:`);
console.log(`  ✅ Fixed: ${fixedCount} files`);
console.log(`  ⏭️  Skipped: ${skippedCount} files`);
console.log(`${'='.repeat(60)}\n`);
