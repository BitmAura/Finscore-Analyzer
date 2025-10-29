/**
 * Complete Supabase Database Setup Script
 * This script will automatically apply all necessary migrations to your Supabase database
 * Run: node setup-database-complete.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// SQL files to execute in order
const migrations = [
  {
    name: 'Add missing documents columns (file_type, mime_type, file_size, detected_bank)',
    file: 'sql/ADD_MISSING_DOCUMENTS_FILE_COLUMNS.sql'
  },
  {
    name: 'Add missing documents status column',
    file: 'sql/ADD_MISSING_DOCUMENTS_STATUS.sql'
  },
  {
    name: 'Make original_name optional (if you prefer)',
    file: 'sql/MAKE_ORIGINAL_NAME_OPTIONAL.sql',
    optional: true
  }
];

async function executeSqlFile(filePath) {
  try {
    const sql = fs.readFileSync(path.join(__dirname, filePath), 'utf8');
    
    // Execute SQL using Supabase's RPC or direct query
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql }).catch(async () => {
      // Fallback: try executing directly (for DO blocks and DDL)
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`
        },
        body: JSON.stringify({ query: sql })
      });
      
      if (!response.ok) {
        // If no RPC exists, we need to run via SQL editor or use psql
        throw new Error('Use Supabase SQL Editor or run migrations manually');
      }
      
      return { data: await response.json(), error: null };
    });

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function checkTableExists(tableName) {
  const { data, error } = await supabase
    .from(tableName)
    .select('id')
    .limit(1);
  
  return !error;
}

async function checkColumnExists(tableName, columnName) {
  const { data, error } = await supabase.rpc('column_exists', {
    p_table: tableName,
    p_column: columnName
  }).catch(() => ({ data: null, error: 'RPC not available' }));
  
  return data === true;
}

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║   Supabase Database Setup - FinScore Analyzer         ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  
  console.log(`📡 Connecting to: ${supabaseUrl}`);
  console.log(`🔑 Using Service Role Key: ${supabaseServiceKey.substring(0, 20)}...\n`);

  // Check connection
  const { data: connectionTest, error: connError } = await supabase
    .from('documents')
    .select('count')
    .limit(0);

  if (connError && connError.code !== 'PGRST116') {
    console.error('❌ Connection failed:', connError.message);
    console.log('\n⚠️  Please run these SQL files manually in Supabase SQL Editor:');
    console.log('   https://supabase.com/dashboard/project/gnhuwhfxotmfkvongowp/editor\n');
    migrations.forEach(m => {
      console.log(`   - ${m.file} (${m.name})`);
    });
    process.exit(1);
  }

  console.log('✅ Connected to Supabase successfully!\n');

  // Check if documents table exists
  const documentsExists = await checkTableExists('documents');
  
  if (!documentsExists) {
    console.log('⚠️  Documents table does not exist yet.');
    console.log('   Please run your main schema file first:');
    console.log('   - STEP_1_COMPLETE_SCHEMA.sql or');
    console.log('   - sql/COMPLETE_PRODUCTION_SCHEMA.sql\n');
    console.log('   Then run this script again.\n');
    process.exit(0);
  }

  console.log('📋 Running migrations...\n');

  for (const migration of migrations) {
    if (migration.optional) {
      console.log(`⏭️  Optional: ${migration.name}`);
      console.log(`   Run manually if needed: ${migration.file}\n`);
      continue;
    }

    console.log(`🔄 ${migration.name}...`);
    
    if (!fs.existsSync(path.join(__dirname, migration.file))) {
      console.log(`   ⚠️  File not found: ${migration.file}\n`);
      continue;
    }

    const result = await executeSqlFile(migration.file);
    
    if (result.success) {
      console.log(`   ✅ Applied successfully\n`);
    } else {
      console.log(`   ⚠️  ${result.error}`);
      console.log(`   📝 Run manually: ${migration.file}\n`);
    }
  }

  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║              Manual Steps Required                     ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  
  console.log('Since direct SQL execution requires special setup, please:');
  console.log('\n1. Open Supabase SQL Editor:');
  console.log('   🔗 https://supabase.com/dashboard/project/gnhuwhfxotmfkvongowp/editor');
  
  console.log('\n2. Run these files in order:\n');
  migrations.forEach((m, i) => {
    const status = m.optional ? '(Optional)' : '(Required)';
    console.log(`   ${i + 1}. ${m.file} ${status}`);
    console.log(`      ${m.name}\n`);
  });

  console.log('3. Then seed your database:');
  console.log('   📄 sql/seed_auto_first_user.sql\n');

  console.log('4. Verify everything:');
  console.log('   Run in SQL Editor:\n');
  console.log('   SELECT COUNT(*) FROM public.documents;');
  console.log('   SELECT COUNT(*) FROM public.analysis_jobs;');
  console.log('   SELECT COUNT(*) FROM public.bank_accounts;\n');

  console.log('✨ Your database will be ready to use!\n');
}

main().catch(console.error);
