#!/usr/bin/env node
/**
 * Normalize cookies() usage and add a single @ts-expect-error comment
 * - Replace: const cookieStore = await cookies(); -> const cookieStore = cookies();
 * - Ensure exactly one @ts-expect-error above createRouteHandlerClient({ cookies: () => cookieStore })
 */
const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/app/api/**/route.ts');
let changed = 0;

for (const file of files) {
  let src = fs.readFileSync(file, 'utf8');
  let before = src;

  // 1) Remove await from cookies()
  src = src.replace(/const\s+cookieStore\s*=\s*await\s*cookies\(\);/g, 'const cookieStore = cookies();');

  // 2) Ensure exactly one ts-expect-error above the supabase client line
  //    We insert if there is a supabase client creation and the previous non-empty line is not already the comment
  src = src.replace(/(\n\s*const supabase\s*=\s*createRouteHandlerClient\(\{\s*cookies:\s*\(\)\s*=>\s*cookieStore\s*\}\)\s*;)/g,
    (m, g1, offset) => {
      // find the portion before this match to get previous lines
      const start = offset;
      let i = start - 1;
      // find previous newline
      while (i > 0 && src[i] !== '\n') i--;
      const prevLineStart = src.lastIndexOf('\n', i - 1) + 1;
      const prevLine = src.slice(prevLineStart, i + 1);
      if (/@ts-expect-error\s*-\s*Supabase auth-helpers/.test(prevLine)) {
        return g1; // comment already present
      }
      return `\n    // @ts-expect-error - Supabase auth-helpers v0.10.0 expects async cookies() but Next.js 15 requires sync callback${g1}`;
    }
  );

  // 3) Remove duplicate adjacent ts-expect-error lines
  src = src.replace(/(\n\s*\/\/ @ts-expect-error[^\n]*\n)+/g, (block) => {
    const lines = block.trim().split(/\n/);
    return '\n' + lines[0] + '\n';
  });

  if (src !== before) {
    fs.writeFileSync(file, src, 'utf8');
    console.log('Updated', file);
    changed++;
  }
}

console.log(`\nDone. Files changed: ${changed}`);
