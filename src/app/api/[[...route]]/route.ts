import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { routeToParser, ParseResult } from '@/lib/parsing/master-parser';

const app = new Hono().basePath('/api');

const bankStatementSchema = z.object({
    reportName: z.string().min(1),
    referenceId: z.string().min(1),
    reportType: z.string().min(1),
});

app.post('/v1/analysis/bank-statement', async (c) => {
    try {
        const cookieStore = cookies();
        const supabaseAuth = createRouteHandlerClient({ cookies: () => cookieStore });
        const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
        if (authError) {
            console.error('Supabase Auth Error:', authError.message);
        }
        const userId = user?.id;
        if (!userId) {
            // Log cookies for debugging
            console.error('Unauthorized: No user session found. Cookies:', cookieStore);
            return c.json({ error: 'Unauthorized: No user session. Please log in again.' }, 401);
        }

        const formData = await c.req.formData();
        const files = formData.getAll('files') as File[];
        const passwords = formData.getAll('passwords') as string[];
        
        const validation = bankStatementSchema.safeParse({
            reportName: formData.get('reportName'),
            referenceId: formData.get('referenceId'),
            reportType: formData.get('reportType'),
        });

        if (!validation.success) {
            return c.json({ error: 'Invalid input', issues: validation.error.issues }, 400);
        }

        const { reportName, referenceId, reportType } = validation.data;

        if (!files || files.length === 0) {
            return c.json({ error: 'No files were provided' }, 400);
        }

        const fileNames = files.map(file => file.name);

        const { data: job, error: jobError } = await supabase
            .from('analysis_jobs')
            .insert({ 
                user_id: userId, 
                status: 'pending', 
                file_names: fileNames, 
                file_passwords: passwords,
                report_name: reportName,
                reference_id: referenceId,
                report_type: reportType
            })
            .select()
            .single();

        if (jobError) {
            console.error('Error creating analysis job:', { userId, jobError });
            return c.json({ error: 'Could not create analysis job' }, 500);
        }

        const uploadPromises = files.map(async (file) => {
            const filePath = `${userId}/${job.id}/${file.name}`;
            const { error: uploadError } = await supabase.storage
                .from('documents')
                .upload(filePath, file);
            if (uploadError) {
                throw new Error(`Failed to upload file: ${file.name}`);
            }
        });

        // Parse each uploaded file and extract account details
        const accountDetailsList: ParseResult[] = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const password = passwords[i] || '';
            // Read file as text (assume PDF/CSV is already converted to text before parsing)
            const text = await file.text();
            const parseResult = routeToParser(text, job.id, password);
            accountDetailsList.push(parseResult);
            // Store account metadata in bank_accounts table
            const { bankName, accountNumber, accountHolder, accountType } = parseResult.accountDetails;
            if (bankName && accountNumber) {
                const { error: accountError } = await supabase
                    .from('bank_accounts')
                    .insert({
                        user_id: userId,
                        job_id: job.id,
                        bank_name: bankName,
                        account_number: accountNumber,
                        account_holder: accountHolder,
                        account_type: accountType
                    });
                if (accountError) {
                    console.error('Error storing account metadata:', accountError.message);
                }
            }
        }

        await Promise.all(uploadPromises);

        // analyzeJob(job.id);

        return c.json({ analysisId: job.id, accounts: accountDetailsList.map(a => a.accountDetails) });
    } catch (error: any) {
        console.error('Error in /v1/analysis/bank-statement:', { error: error.message, stack: error.stack });
        return c.json({ error: 'An unexpected error occurred' }, 500);
    }
});

app.get('/v1/analysis/status/:analysisId', async (c) => {
    try {
        const cookieStore = cookies();
        const supabaseAuth = createRouteHandlerClient({ cookies: () => cookieStore });
        const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
        if (authError) {
            console.error('Supabase Auth Error:', authError.message);
        }
        const userId = user?.id;
        if (!userId) {
            console.error('Unauthorized: No user session found. Cookies:', cookieStore);
            return c.json({ error: 'Unauthorized: No user session. Please log in again.' }, 401);
        }
        const analysisId = c.req.param('analysisId');

        const { data: job, error } = await supabase
            .from('analysis_jobs')
            .select('*')
            .eq('id', analysisId)
            .eq('user_id', userId)
            .single();

        if (error || !job) {
            return c.json({ error: 'Analysis job not found or access denied' }, 404);
        }

        return c.json({
            status: job.status,
            data: job.status === 'completed' ? {
                summary: job.summary,
                monthly_summary: job.monthly_summary,
                red_alerts: job.red_alerts,
                counterparties: job.counterparties,
                risk_assessment: job.risk_assessment
            } : null
        });
    } catch (error: any) {
        console.error(`Error in /v1/analysis/status/${c.req.param('analysisId')}:`, { error: error.message, stack: error.stack });
        return c.json({ error: 'An unexpected error occurred' }, 500);
    }
});

app.get('/v1/analysis-jobs', async (c) => {
    try {
        const cookieStore = cookies();
        const supabaseAuth = createRouteHandlerClient({ cookies: () => cookieStore });
        const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
        if (authError) {
            console.error('Supabase Auth Error:', authError.message);
        }
        const userId = user?.id;
        if (!userId) {
            console.error('Unauthorized: No user session found. Cookies:', cookieStore);
            return c.json({ error: 'Unauthorized: No user session. Please log in again.' }, 401);
        }

        const { data: jobs, error } = await supabase
            .from('analysis_jobs')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching analysis jobs:', { userId, error });
            return c.json({ error: 'Could not fetch analysis jobs' }, 500);
        }

        return c.json(jobs);
    } catch (error: any) {
        console.error('Error in /v1/analysis-jobs:', { error: error.message, stack: error.stack });
        return c.json({ error: 'An unexpected error occurred' }, 500);
    }
});

import * as exceljs from 'exceljs';

app.get('/v1/reports/:analysisId/export', async (c) => {
    try {
        const cookieStore = cookies();
        const supabaseAuth = createRouteHandlerClient({ cookies: () => cookieStore });
        const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
        if (authError) {
            console.error('Supabase Auth Error:', authError.message);
        }
        const userId = user?.id;
        if (!userId) {
            console.error('Unauthorized: No user session found. Cookies:', cookieStore);
            return c.json({ error: 'Unauthorized: No user session. Please log in again.' }, 401);
        }

        const analysisId = c.req.param('analysisId');

        const { data: job, error } = await supabase
            .from('analysis_jobs')
            .select('*, transactions(*)') // Select all job data and related transactions
            .eq('id', analysisId)
            .eq('user_id', userId)
            .single();

        if (error || !job) {
            return c.json({ error: 'Analysis job not found or access denied' }, 404);
        }

        const workbook = new exceljs.Workbook();

        // 1. Executive Summary Sheet
        const executiveSummarySheet = workbook.addWorksheet('Executive Summary');
        executiveSummarySheet.columns = [{ header: 'AI Executive Summary', key: 'summary', width: 100 }];
        executiveSummarySheet.addRow({ summary: job.ai_executive_summary || 'N/A' });
        executiveSummarySheet.getRow(1).font = { bold: true };

        // 2. Overall Summary Sheet
        const overallSummarySheet = workbook.addWorksheet('Overall Summary');
        overallSummarySheet.columns = [
            { header: 'Metric', key: 'metric', width: 30 },
            { header: 'Value', key: 'value', width: 20 }
        ];
        if (job.summary) {
            overallSummarySheet.addRow({ metric: 'Total Income', value: job.summary.total_income });
            overallSummarySheet.addRow({ metric: 'Total Expenses', value: job.summary.total_expenses });
            overallSummarySheet.addRow({ metric: 'Net Cash Flow', value: job.summary.net_cash_flow });
        }
        overallSummarySheet.getRow(1).font = { bold: true };

        // 3. Monthly Summary Sheet
        const monthlySummarySheet = workbook.addWorksheet('Monthly Summary');
        monthlySummarySheet.columns = [
            { header: 'Month', key: 'month', width: 15 },
            { header: 'Income', key: 'income', width: 15 },
            { header: 'Expenses', key: 'expenses', width: 15 },
            { header: 'Net Cash Flow', key: 'net_cash_flow', width: 15 },
        ];
        if (job.monthly_summary && Array.isArray(job.monthly_summary)) {
            monthlySummarySheet.addRows(job.monthly_summary);
        }
        monthlySummarySheet.getRow(1).font = { bold: true };

        // 4. Red Alerts Sheet
        const redAlertsSheet = workbook.addWorksheet('Red Alerts');
        redAlertsSheet.columns = [
            { header: 'Type', key: 'type', width: 25 },
            { header: 'Description', key: 'description', width: 70 },
        ];
        if (job.red_alerts && Array.isArray(job.red_alerts)) {
            redAlertsSheet.addRows(job.red_alerts);
        }
        redAlertsSheet.getRow(1).font = { bold: true };

        // 5. Counterparties Sheet
        const counterpartiesSheet = workbook.addWorksheet('Counterparties');
        counterpartiesSheet.columns = [
            { header: 'Name', key: 'name', width: 40 },
            { header: 'Total Transactions', key: 'total_transactions', width: 25 },
            { header: 'Total Amount', key: 'total_amount', width: 20 },
        ];
        if (job.counterparties && Array.isArray(job.counterparties)) {
            counterpartiesSheet.addRows(job.counterparties);
        }
        counterpartiesSheet.getRow(1).font = { bold: true };

        // 6. Risk Assessment Sheet
        const riskAssessmentSheet = workbook.addWorksheet('Risk Assessment');
        riskAssessmentSheet.columns = [
            { header: 'Metric', key: 'metric', width: 30 },
            { header: 'Value', key: 'value', width: 20 }
        ];
        if (job.risk_assessment) {
            riskAssessmentSheet.addRow({ metric: 'Score', value: job.risk_assessment.score });
            riskAssessmentSheet.addRow({ metric: 'Details', value: job.risk_assessment.details });
        }
        riskAssessmentSheet.getRow(1).font = { bold: true };

        // 7. All Transactions Sheet (existing logic, but using job.transactions)
        const allTransactionsSheet = workbook.addWorksheet('All Transactions');
        allTransactionsSheet.columns = [
            { header: 'Date', key: 'date', width: 15 },
            { header: 'Description', key: 'description', width: 50 },
            { header: 'Debit', key: 'debit', width: 15 },
            { header: 'Credit', key: 'credit', width: 15 },
            { header: 'Balance', key: 'balance', width: 15 },
            { header: 'Category', key: 'category', width: 20 },
        ];

        if (job.transactions && Array.isArray(job.transactions)) {
            allTransactionsSheet.addRows(job.transactions);
        }
        allTransactionsSheet.getRow(1).font = { bold: true };

        const buffer = await workbook.xlsx.writeBuffer();

        return new Response(buffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="report-${analysisId}.xlsx"`,
            },
        });

    } catch (error: any) {
        console.error(`Error in /v1/reports/${c.req.param('analysisId')}/export:`, { error: error.message, stack: error.stack });
        return c.json({ error: 'An unexpected error occurred' }, 500);
    }
});

app.get('/v1/analysis-jobs/:jobId', async (c) => {
    try {
        const cookieStore = cookies();
        const supabaseAuth = createRouteHandlerClient({ cookies: () => cookieStore });
        const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
        if (authError) {
            console.error('Supabase Auth Error:', authError.message);
        }
        const userId = user?.id;
        if (!userId) {
            console.error('Unauthorized: No user session found. Cookies:', cookieStore);
            return c.json({ error: 'Unauthorized: No user session. Please log in again.' }, 401);
        }
        const jobId = c.req.param('jobId');

        const { data: job, error } = await supabase
            .from('analysis_jobs')
            .select('*')
            .eq('id', jobId)
            .eq('user_id', userId)
            .single();

        if (error || !job) {
            return c.json({ error: 'Analysis job not found or access denied' }, 404);
        }

        return c.json(job);
    } catch (error: any) {
        console.error(`Error in /v1/analysis-jobs/${c.req.param('jobId')}:`, { error: error.message, stack: error.stack });
        return c.json({ error: 'An unexpected error occurred' }, 500);
    }
});

app.get('/v1/analytics/kpis', async (c) => {
    try {
        const cookieStore = cookies();
        const supabaseAuth = createRouteHandlerClient({ cookies: () => cookieStore });
        const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
        if (authError) {
            console.error('Supabase Auth Error:', authError.message);
        }
        const userId = user?.id;
        if (!userId) {
            console.error('Unauthorized: No user session found. Cookies:', cookieStore);
            return c.json({ error: 'Unauthorized: No user session. Please log in again.' }, 401);
        }

        const { data: jobs, error } = await supabase
            .from('analysis_jobs')
            .select('status, file_names, red_alerts, created_at, updated_at')
            .eq('user_id', userId);

        if (error) {
            console.error('Error fetching KPI data:', { userId, error });
            return c.json({ error: 'Could not fetch KPI data' }, 500);
        }

        const totalReports = jobs.length;
        const documentsProcessed = jobs.reduce((acc, job) => acc + job.file_names.length, 0);

        const completedJobs = jobs.filter(job => job.status === 'completed');
        const avgTurnaroundTime = completedJobs.length > 0 ? completedJobs.reduce((acc, job) => {
            const created = new Date(job.created_at);
            const updated = new Date(job.updated_at);
            return acc + (updated.getTime() - created.getTime());
        }, 0) / completedJobs.length : 0;

        const redAlerts = jobs.flatMap(job => job.red_alerts || []);
        const redAlertCounts = redAlerts.reduce((acc: Record<string, number>, alert) => {
            acc[alert.type] = (acc[alert.type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const mostCommonRedFlag = Object.keys(redAlertCounts).length > 0 ? Object.entries(redAlertCounts).sort((a, b) => b[1] - a[1])[0][0] : 'None';

        return c.json({
            totalReports,
            documentsProcessed,
            avgTurnaroundTime,
            mostCommonRedFlag
        });

    } catch (error: any) {
        console.error('Error in /v1/analytics/kpis:', { error: error.message, stack: error.stack });
        return c.json({ error: 'An unexpected error occurred' }, 500);
    }
});

app.get('/v1/analytics/summary', async (c) => {
    try {
        const cookieStore = cookies();
        const supabaseAuth = createRouteHandlerClient({ cookies: () => cookieStore });
        const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
        if (authError) {
            console.error('Supabase Auth Error:', authError.message);
        }
        const userId = user?.id;
        if (!userId) {
            console.error('Unauthorized: No user session found. Cookies:', cookieStore);
            return c.json({ error: 'Unauthorized: No user session. Please log in again.' }, 401);
        }

        const { data: jobs, error } = await supabase
            .from('analysis_jobs')
            .select('summary')
            .eq('user_id', userId)
            .eq('status', 'completed');

        if (error) {
            console.error('Error fetching analytics summary:', { userId, error });
            return c.json({ error: 'Could not fetch analytics summary' }, 500);
        }

        if (!jobs) {
            return c.json({ total_income: 0, total_expenses: 0, net_cash_flow: 0 });
        }

        const aggregatedSummary = jobs.reduce((acc, job) => {
            if (job.summary) {
                acc.total_income += (job.summary as any).total_income || 0;
                acc.total_expenses += (job.summary as any).total_expenses || 0;
                acc.net_cash_flow += (job.summary as any).net_cash_flow || 0;
            }
            return acc;
        }, { total_income: 0, total_expenses: 0, net_cash_flow: 0 });

        return c.json(aggregatedSummary);
    } catch (error: any) {
        console.error('Error in /v1/analytics/summary:', { error: error.message, stack: error.stack });
        return c.json({ error: 'An unexpected error occurred' }, 500);
    }
});

export const GET = handle(app);
export const POST = handle(app);
