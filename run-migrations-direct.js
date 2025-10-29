/**
 * Direct Supabase SQL Executor
 * This script runs SQL migrations directly against your cloud Supabase database
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const PROJECT_REF = 'gnhuwhfxotmfkvongowp';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in .env.local');
  process.exit(1);
}

// Execute SQL using Supabase's PostgREST admin API
async function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query: sql });
    
    const options = {
      hostname: `${PROJECT_REF}.supabase.co`,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, data: body });
        } else {
          resolve({ success: false, error: body, statusCode: res.statusCode });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

// Alternative: Use postgres wire protocol via pg library
async function executeSQLDirect(sql) {
  try {
    // Since we can't use pg library without installing it, let's use a simple query
    const response = await fetch(`https://${PROJECT_REF}.supabase.co/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ query: sql })
    });

    return {
      success: response.ok,
      data: await response.text(),
      statusCode: response.status
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║     Direct SQL Migration Runner - FinScore Analyzer      ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  console.log('📡 Project: gnhuwhfxotmfkvongowp');
  console.log('🔑 Using Service Role Key\n');

  const migrations = [
    {
      name: 'Add file columns to documents table',
      file: 'sql/ADD_MISSING_DOCUMENTS_FILE_COLUMNS.sql',
      description: 'Adds file_type, mime_type, file_size, detected_bank'
    },
    {
      name: 'Add status column to documents table',
      file: 'sql/ADD_MISSING_DOCUMENTS_STATUS.sql',
      description: 'Adds status column with default "uploaded"'
    },
    {
      name: 'Seed database with sample data',
      file: 'sql/seed_auto_first_user.sql',
      description: 'Creates 120 documents, 30 jobs, 60 bank accounts'
    }
  ];

  console.log('⚠️  Note: Direct SQL execution via REST API is limited.');
  console.log('    For DO blocks and complex DDL, use Supabase SQL Editor.\n');

  console.log('📋 Files to run:\n');
  migrations.forEach((m, i) => {
    console.log(`${i + 1}. ${m.name}`);
    console.log(`   File: ${m.file}`);
    console.log(`   ${m.description}\n`);
  });

  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║              🚀 RECOMMENDED APPROACH                      ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  console.log('Since VS Code Supabase extension requires local setup,');
  console.log('the FASTEST way is to use Supabase SQL Editor:\n');

  console.log('1️⃣  Open SQL Editor:');
  console.log('   🔗 https://supabase.com/dashboard/project/gnhuwhfxotmfkvongowp/editor\n');

  console.log('2️⃣  Run these files in order (copy-paste):\n');
  
  migrations.forEach((m, i) => {
    const fullPath = path.join(__dirname, m.file);
    if (fs.existsSync(fullPath)) {
      console.log(`   ${i + 1}. ${m.file}`);
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n').length;
      console.log(`      (${lines} lines - ${m.description})\n`);
    }
  });

  console.log('3️⃣  Verify:');
  console.log('   Run this query to check results:\n');
  console.log('   SELECT');
  console.log('     (SELECT COUNT(*) FROM public.documents) as docs,');
  console.log('     (SELECT COUNT(*) FROM public.analysis_jobs) as jobs,');
  console.log('     (SELECT COUNT(*) FROM public.bank_accounts) as accounts;\n');

  console.log('Expected: docs=120, jobs=30, accounts=60\n');

  console.log('═══════════════════════════════════════════════════════════');
  console.log('💡 TIP: I can read each file and show you the SQL here!');
  console.log('═══════════════════════════════════════════════════════════\n');
}

main().catch(console.error);
