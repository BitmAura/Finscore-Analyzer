"use server";

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { parseCsvToTransactions } from '@/lib/parsing/csv-parser';

export async function POST(request: NextRequest) {
  // Initialize Supabase route handler client using the `cookies` helper
  const cookieStore = cookies();

  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Step 1: Get or create a financial account for the user
    let { data: financialAccount, error: accountError } = await supabase
      .from('financial_accounts')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (accountError && accountError.code !== 'PGRST116') { // PGRST116 is "exact one row not found"
      throw new Error('Failed to retrieve financial account.');
    }

    if (!financialAccount) {
      const { data: newAccount, error: newAccountError } = await supabase
        .from('financial_accounts')
        .insert({ user_id: user.id, name: 'Primary Account', account_type: 'personal' })
        .select('id')
        .single();

      if (newAccountError) throw new Error('Failed to create financial account.');
      financialAccount = newAccount;
    }

    // Step 2: Process the uploaded file
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // For now, we only support CSV. This can be expanded later.
    if (file.type !== 'text/csv') {
        return NextResponse.json({ error: 'Only CSV files are supported at this time.' }, { status: 400 });
    }

    // Step 3: Parse the file to get structured transactions
    // read file text and pass string content to the CSV parser
    const fileContent = await file.text();
    const parsedTransactions = await parseCsvToTransactions(fileContent);

    if (parsedTransactions.length === 0) {
        return NextResponse.json({ error: 'No transactions found in the file.' }, { status: 400 });
    }

    // Step 4: Prepare the data for insertion
    const transactionsToInsert = parsedTransactions.map(tx => ({
      ...tx,
      user_id: user.id,
      account_id: financialAccount!.id,
    }));

    // Step 5: Upsert the transactions into the database
    // This will insert new transactions and ignore duplicates based on the unique constraint
    const { error: upsertError } = await supabase
        .from('transactions')
        .upsert(transactionsToInsert, {
            onConflict: 'account_id,transaction_date,description,amount'
        });

    if (upsertError) {
        console.error('Error upserting transactions:', upsertError);
        throw new Error('Failed to save transaction data.');
    }

    // Step 6: Log activity and return success
    await supabase.from('user_activities').insert({
        user_id: user.id,
        type: 'data_imported',
        description: `Imported ${parsedTransactions.length} transactions from ${file.name}`,
        metadata: { accountId: financialAccount!.id }
    });

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${parsedTransactions.length} transactions.`,
      accountId: financialAccount!.id
    });

  } catch (error: any) {
    console.error('Server error in bank statement processing:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
