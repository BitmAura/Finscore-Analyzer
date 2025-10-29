#!/usr/bin/env node
/**
 * Clean duplicate @ts-expect-error comments in API routes
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const pattern = 'src/app/api/**/route.ts';
const files = glob.sync(pattern);

let cleanedCount = 0;

console.log(`\n🧹 Cleaning duplicate @ts-expect-error comments in ${files.length} API routes...\n`);

files.forEach(filePath => {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Pattern: Remove duplicate @ts-expect-error comments, keeping only the Supabase one
  let fixed = content;
  
  // Remove old comment pattern
  fixed = fixed.replace(/\s*\/\/ @ts-expect-error - cookieStore is already awaited, type mismatch is expected\n/g, '');
  
  // Remove excessive blank lines before the Supabase comment
  fixed = fixed.replace(/(\/\/ @ts-expect-error - Supabase auth-helpers[^\n]*)\n\n+/g, '$1\n');
  
  // Remove blank lines before const supabase
  fixed = fixed.replace(/\n\n+(    const supabase = createRouteHandlerClient)/g, '\n$1');
  
  if (fixed !== content) {
    fs.writeFileSync(filePath, fixed, 'utf8');
    console.log(`✅ Cleaned: ${filePath}`);
    cleanedCount++;
  }
});

console.log(`\n${'='.repeat(60)}`);
console.log(`📊 Summary: Cleaned ${cleanedCount} files`);
console.log(`${'='.repeat(60)}\n`);
