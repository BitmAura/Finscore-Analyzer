import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';
// import { parsePDFWithPassword } from '@/lib/parsing/enhanced-pdf-parser';
import { parseCSV } from '@/lib/parsing/csv-parser';
import { parseMasterFormat, routeToParser, ParseResult } from '@/lib/parsing/master-parser';
import { categorizeTransactions } from '@/lib/analysis/categorization-service';
import { analyzeSummary } from '@/lib/analysis/summary-service';
import { generateMonthlySummaries } from '@/lib/analysis/monthly-summary-service';
import { detectRedAlerts } from '@/lib/analysis/red-alert-service';
import { analyzeCounterparties } from '@/lib/analysis/counterparty-service';
import { assessRisk } from '@/lib/analysis/risk-service';
import { generateExecutiveSummary, detectFraud, predictCashFlow } from '@/lib/ai-analysis';

/**
 * GET /api/analysis-jobs
 * Fetch all analysis jobs for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get limit from query params
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 50;

    // Fetch analysis jobs for the user
    const { data: jobs, error } = await supabase
      .from('analysis_jobs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching analysis jobs:', error);
      return NextResponse.json({ error: 'Failed to fetch jobs', details: error.message }, { status: 500 });
    }

    return NextResponse.json({ jobs: jobs || [] }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/analysis-jobs:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const body = await request.json();
    const { fileType, fileContent } = body;

    // Generate a unique ID for the analysis job
    const jobId = uuidv4();

    // Parse the file content based on the file type
    let parseResult: ParseResult | any[] | null = null;

    if (fileType === 'pdf') {
      // Temporarily disabled PDF parsing due to file access error
      return NextResponse.json({ error: 'PDF parsing is temporarily unavailable' }, { status: 500 });
    } else if (fileType === 'csv') {
      parseResult = await parseCSV(fileContent);
    } else if (fileType === 'master') {
      parseResult = routeToParser(fileContent, jobId);
    } else {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    // Normalize to transactions array
    let transactionsArray: any[] = [];
    if (Array.isArray(parseResult)) {
      transactionsArray = parseResult as any[];
    } else if (parseResult && (parseResult as any).transactions && Array.isArray((parseResult as any).transactions)) {
      transactionsArray = (parseResult as any).transactions;
    }

    // Categorize transactions
    const categorizedData = categorizeTransactions(transactionsArray);

    // Analyze summary
    const summaryAnalysis = analyzeSummary(categorizedData);

    // Generate monthly summaries
    const monthlySummariesResult = generateMonthlySummaries(categorizedData);

    // Detect red alerts
    const redAlerts = detectRedAlerts(categorizedData);

    // Analyze counterparties
    const counterpartyAnalysis = analyzeCounterparties(categorizedData);

    // Assess risk (assessRisk expects categorized transactions and summary)
    const riskAssessment = assessRisk(categorizedData, summaryAnalysis);

    // Generate executive summary
    const executiveSummary = await generateExecutiveSummary(
      summaryAnalysis,
      redAlerts,
      monthlySummariesResult.monthlySummaries,
      categorizedData,
      counterpartyAnalysis,
      riskAssessment
    );

    // Detect fraud
    const fraudDetection = await detectFraud(transactionsArray);

    // Predict cash flow
    const cashFlowPrediction = await predictCashFlow(monthlySummariesResult.monthlySummaries);

    // Save the analysis job to the database
    const { data, error } = await supabase
      .from('analysis_jobs')
      .insert([
        {
          id: jobId,
          status: 'completed',
          result: {
            summaryAnalysis,
            monthlySummaries: monthlySummariesResult,
            redAlerts,
            counterpartyAnalysis,
            riskAssessment,
            executiveSummary,
            fraudDetection,
            cashFlowPrediction,
          },
        },
      ]);

    if (error) {
      throw error;
    }

    return NextResponse.json({ jobId, status: 'completed', result: data }, { status: 200 });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
