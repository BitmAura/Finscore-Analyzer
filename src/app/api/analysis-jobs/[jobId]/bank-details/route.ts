/**
 * Bank Details API - Step 2 of Upload Process
 * Saves bank details and triggers full analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    // Await params in Next.js 15
    const { jobId } = await params;

    // Check authentication - await cookies() before using it
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json();
    const { bankName, accountNumber, accountHolder, accountType, statementPassword } = body;

    // Validate required fields
    if (!bankName || !accountNumber || !accountHolder) {
      return NextResponse.json(
        { success: false, error: 'Missing required bank details' },
        { status: 400 }
      );
    }

    // Verify job belongs to user
    const { data: job, error: jobError } = await supabase
      .from('analysis_jobs')
      .select('*')
      .eq('id', jobId)
      .eq('user_id', userId)
      .single();

    if (jobError || !job) {
      return NextResponse.json(
        { success: false, error: 'Job not found or unauthorized' },
        { status: 404 }
      );
    }

    // Create or update bank account record
    const { data: bankAccount, error: bankError } = await supabase
      .from('bank_accounts')
      .upsert({
        user_id: userId,
        job_id: jobId,
        bank_name: bankName,
        account_number: accountNumber,
        account_holder: accountHolder,
        account_type: accountType || 'savings',
        currency: 'INR'
      })
      .select()
      .single();

    if (bankError) {
      console.error('Bank account creation error:', bankError);
      return NextResponse.json(
        { success: false, error: 'Failed to save bank details', details: bankError.message },
        { status: 500 }
      );
    }

    // Update job metadata with bank details
    const { error: updateError } = await supabase
      .from('analysis_jobs')
      .update({
        status: 'processing',
        metadata: {
          ...job.metadata,
          bank_name: bankName,
          account_number: accountNumber.slice(-4), // Store only last 4 digits for security
          account_holder: accountHolder,
          account_type: accountType,
          has_statement_password: !!statementPassword,
          needs_bank_details: false,
          bank_details_submitted_at: new Date().toISOString()
        }
      })
      .eq('id', jobId);

    if (updateError) {
      console.error('Job update error:', updateError);
    }

    // Log activity
    await supabase.from('user_activities').insert({
      user_id: userId,
      job_id: jobId,
      type: 'bank_details_added',
      description: `Added bank details for ${bankName}`,
      status: 'success',
      metadata: {
        bank_name: bankName,
        account_type: accountType
      }
    });

    // Trigger analysis processing in background
    setTimeout(async () => {
      await processAnalysis(jobId, userId, statementPassword);
    }, 100);

    return NextResponse.json({
      success: true,
      message: 'Bank details saved successfully. Analysis started.',
      jobId: jobId,
      bankAccountId: bankAccount.id
    });

  } catch (error: any) {
    console.error('Bank details API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Background processing function with bank details
async function processAnalysis(jobId: string, userId: string, password?: string) {
  try {
    // Use Supabase service role for background processing (no cookies needed)
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } }
    );

    console.log(`🔄 Starting analysis for job ${jobId}`);

    // Simulate PDF password unlocking if needed
    if (password) {
      console.log(`🔓 Unlocking password-protected PDF for job ${jobId}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Simulate bank statement parsing (2-5 seconds)
    console.log(`📄 Parsing bank statement for job ${jobId}`);
    await new Promise(resolve => setTimeout(resolve, Math.random() * 3000 + 2000));

    // Get bank account details
    const { data: bankAccount } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('job_id', jobId)
      .single();

    // Generate mock analysis results based on bank type
    const mockResults = generateMockAnalysis(bankAccount);

    // Update job with results
    await supabase
      .from('analysis_jobs')
      .update({
        status: 'completed',
        result: mockResults,
        completed_at: new Date().toISOString()
      })
      .eq('id', jobId);

    // Create detailed analysis results
    await supabase
      .from('analysis_results')
      .upsert({
        job_id: jobId,
        summary: mockResults.summary,
        cash_flow: mockResults.cash_flow,
        risk_indicators: mockResults.risk_indicators,
        expense_categories: mockResults.expense_categories,
        income_sources: mockResults.income_sources,
        trends: mockResults.trends,
        anomalies: mockResults.anomalies,
        recommendations: mockResults.recommendations
      });

    // Generate mock transactions
    const transactions = generateMockTransactions(bankAccount?.account_type || 'savings');

    for (const txn of transactions) {
      await supabase.from('bank_transactions').insert({
        user_id: userId,
        job_id: jobId,
        bank_account_id: bankAccount?.id,
        transaction_date: txn.date,
        description: txn.description,
        debit: txn.debit,
        credit: txn.credit,
        balance: txn.balance,
        category: txn.category
      });
    }

    // Update user activity
    await supabase.from('user_activities').insert({
      user_id: userId,
      job_id: jobId,
      type: 'analysis_complete',
      description: 'Financial analysis completed successfully',
      status: 'completed',
      metadata: {
        transaction_count: transactions.length,
        risk_score: mockResults.risk_indicators.risk_score
      }
    });

    console.log(`✅ Analysis completed for job ${jobId}`);

  } catch (error) {
    console.error(`❌ Analysis failed for job ${jobId}:`, error);

    // Use Supabase service role for error handling too
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } }
    );

    await supabase
      .from('analysis_jobs')
      .update({
        status: 'failed',
        error: error instanceof Error ? error.message : 'Analysis processing failed'
      })
      .eq('id', jobId);
  }
}

// Generate realistic mock analysis data
function generateMockAnalysis(bankAccount: any) {
  const accountType = bankAccount?.account_type || 'savings';
  const bankName = bankAccount?.bank_name || 'Bank';

  const baseMultiplier = accountType === 'current' ? 3 : accountType === 'savings' ? 1 : 2;

  return {
    summary: {
      bank_name: bankName,
      account_number: bankAccount?.account_number,
      account_holder: bankAccount?.account_holder,
      account_type: accountType,
      total_transactions: Math.floor(Math.random() * 50 + 30) * baseMultiplier,
      total_credits: Math.floor(Math.random() * 300000 + 100000) * baseMultiplier,
      total_debits: Math.floor(Math.random() * 250000 + 80000) * baseMultiplier,
      opening_balance: Math.floor(Math.random() * 50000 + 20000),
      closing_balance: Math.floor(Math.random() * 100000 + 30000),
      average_balance: Math.floor(Math.random() * 75000 + 40000),
      statement_period: '90 days'
    },
    cash_flow: {
      monthly_income: Math.floor(Math.random() * 100000 + 50000) * baseMultiplier,
      monthly_expenses: Math.floor(Math.random() * 80000 + 40000) * baseMultiplier,
      net_cash_flow: Math.floor(Math.random() * 20000 + 10000),
      income_stability: Math.random() > 0.5 ? 'Stable' : 'Variable',
      expense_trend: Math.random() > 0.5 ? 'Increasing' : 'Stable'
    },
    risk_indicators: {
      risk_score: Math.floor(Math.random() * 30 + 70), // 70-100 (good range)
      risk_level: 'Low',
      bounced_cheques: Math.floor(Math.random() * 2),
      overdraft_frequency: Math.floor(Math.random() * 3),
      loan_repayment_ratio: Math.random() * 0.3 + 0.7,
      credit_utilization: Math.random() * 0.4 + 0.2
    },
    expense_categories: {
      salary_income: Math.floor(Math.random() * 80000 + 40000),
      groceries: Math.floor(Math.random() * 12000 + 5000),
      utilities: Math.floor(Math.random() * 8000 + 3000),
      entertainment: Math.floor(Math.random() * 6000 + 2000),
      transport: Math.floor(Math.random() * 10000 + 4000),
      loan_payments: Math.floor(Math.random() * 15000 + 5000),
      investments: Math.floor(Math.random() * 20000 + 10000)
    },
    income_sources: {
      salary: Math.floor(Math.random() * 80000 + 40000),
      freelance: Math.floor(Math.random() * 20000 + 5000),
      investments: Math.floor(Math.random() * 10000 + 2000),
      other: Math.floor(Math.random() * 5000 + 1000)
    },
    trends: {
      spending_trend: Math.random() > 0.5 ? 'increasing' : 'stable',
      income_trend: 'stable',
      savings_rate: Math.floor(Math.random() * 30 + 10) + '%'
    },
    anomalies: {
      unusual_transactions: Math.floor(Math.random() * 3),
      large_withdrawals: Math.floor(Math.random() * 2),
      suspicious_activity: false
    },
    recommendations: [
      'Maintain consistent monthly savings',
      'Consider diversifying income sources',
      'Monitor entertainment expenses',
      'Build emergency fund (6 months expenses)'
    ]
  };
}

// Generate mock transaction data
function generateMockTransactions(accountType: string) {
  const count = Math.floor(Math.random() * 30 + 20);
  const transactions = [];
  let balance = Math.floor(Math.random() * 50000 + 20000);

  const categories = [
    'Salary', 'Groceries', 'Utilities', 'Entertainment',
    'Transport', 'Shopping', 'Healthcare', 'Investment',
    'Loan Payment', 'Transfer', 'ATM Withdrawal'
  ];

  for (let i = 0; i < count; i++) {
    const daysAgo = Math.floor(Math.random() * 90);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);

    const isCredit = Math.random() > 0.6;
    const amount = Math.floor(Math.random() * 15000 + 500);

    if (isCredit) {
      balance += amount;
    } else {
      balance -= amount;
    }

    transactions.push({
      date: date.toISOString().split('T')[0],
      description: `${categories[Math.floor(Math.random() * categories.length)]} - Transaction ${i + 1}`,
      debit: isCredit ? null : amount,
      credit: isCredit ? amount : null,
      balance: Math.max(balance, 0),
      category: categories[Math.floor(Math.random() * categories.length)]
    });
  }

  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
