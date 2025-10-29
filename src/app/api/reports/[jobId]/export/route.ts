/**
 * Report Export API - PDF and Excel Generation
 * Route: /api/reports/[jobId]/export
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { reportExportService } from '@/lib/services/report-export-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'pdf';

    // Fetch complete report data
    const { data: job } = await supabase
      .from('analysis_jobs')
      .select('*')
      .eq('id', jobId)
      .eq('user_id', user.id)
      .single();

    if (!job) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    const { data: results } = await supabase
      .from('analysis_results')
      .select('*')
      .eq('analysis_job_id', jobId)
      .single();

    const { data: transactions } = await supabase
      .from('bank_transactions')
      .select('*')
      .eq('analysis_job_id', jobId)
      .order('transaction_date', { ascending: false });

    if (!results || !transactions) {
      return NextResponse.json({ error: 'Report data incomplete' }, { status: 404 });
    }

    const reportData = {
      reportName: job.report_name,
      referenceId: job.reference_id,
      generatedDate: new Date().toLocaleDateString('en-IN'),
      summary: results.summary,
      transactions: transactions.map(t => ({
        date: (t as any).transaction_date ?? (t as any).date,
        description: t.description,
        debit: (t as any).transaction_type === 'debit' || (typeof (t as any).amount === 'number' && (t as any).amount < 0)
          ? Math.abs((t as any).amount ?? 0)
          : 0,
        credit: (t as any).transaction_type === 'credit' || (typeof (t as any).amount === 'number' && (t as any).amount > 0)
          ? Math.abs((t as any).amount ?? 0)
          : 0,
        balance: (t as any).running_balance ?? (t as any).balance ?? 0,
        category: t.category,
        job_id: jobId,
      })),
      monthlySummaries: results.cash_flow?.monthlySummaries || [],
      redAlerts: results.risk_indicators?.alerts || [],
      counterparties: results.counterparties || [],
      riskAssessment: results.risk_indicators?.assessment || {},
      executiveSummary: results.ai_insights?.executive_summary,
      fraudAnalysis: results.risk_indicators?.fraud,
      cashFlowPrediction: results.cash_flow?.prediction
    };

    let blob: Blob;
    let filename: string;
    let mimeType: string;

    if (format === 'excel' || format === 'xlsx') {
      blob = await reportExportService.generateExcel(reportData);
      filename = `${job.reference_id}_Report.xlsx`;
      mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    } else {
      blob = await reportExportService.generatePDF(reportData);
      filename = `${job.reference_id}_Report.pdf`;
      mimeType = 'application/pdf';
    }

    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString()
      }
    });

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate export',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
