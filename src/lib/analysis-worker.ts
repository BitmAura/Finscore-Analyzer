import supabase from '@/lib/supabase';
import pdf from 'pdf-parse';
import qpdf from 'node-qpdf';
import { routeToParser } from '@/lib/parsing/master-parser';
import { Transaction } from '@/lib/parsing/transaction-parser';
import { analyzeSummary } from '@/lib/analysis/summary-service';
import { detectRedAlerts } from '@/lib/analysis/red-alert-service';
import { generateMonthlySummaries } from '@/lib/analysis/monthly-summary-service';
import { categorizeAllTransactions } from '@/lib/analysis/categorization-service';
import { analyzeCounterparties } from '@/lib/analysis/counterparty-service';
import { analyzeTransactionPatterns } from '@/lib/analysis/risk-service';
import { detectSpendingTrends, detectAnomalies } from '@/lib/analysis/trend-service';
import { saveTransactions } from '@/lib/supabase-helpers';
import { generateExecutiveSummary } from '@/lib/ai-analysis';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';

import { decrypt } from './crypto';

async function downloadFile(filePath: string) {
    const { data, error } = await supabase.storage.from('documents').download(filePath);
    if (error) {
        throw new Error(`Error downloading file: ${error.message}`);
    }
    return data.arrayBuffer();
}

export default async function analyzeJob(jobId: string) {
    console.log(`Starting analysis for job ${jobId}`);

    try {
    const { data: job, error: jobError } = await supabase
        .from('analysis_jobs')
        .select('*')
        .eq('id', jobId)
        .single();

    if (jobError || !job) {
        console.error(`Job not found for id: ${jobId}`, { jobError });
        await supabase.from('analysis_jobs').update({ status: 'failed', summary: { error: 'Job not found' } }).eq('id', jobId);
        return;
    }

        await supabase.from('analysis_jobs').update({ status: 'processing' }).eq('id', jobId);

        const fileProcessingPromises = job.file_names.map(async (fileName: string, index: number) => {
            const tempPaths: string[] = [];
            try {
                const filePath = `${job.user_id}/${job.id}/${fileName}`;
                const arrayBuffer = await downloadFile(filePath);
                let buffer = Buffer.from(arrayBuffer as ArrayBuffer);

                const encryptedPassword = job.file_passwords ? job.file_passwords[index] : null;

                if (encryptedPassword) {
                    const password = await decrypt(encryptedPassword);
                    const tempInputPath = path.join(os.tmpdir(), `unencrypted_${fileName}`);
                    const tempOutputPath = path.join(os.tmpdir(), `decrypted_${fileName}`);
                    tempPaths.push(tempInputPath, tempOutputPath);

                    await fs.writeFile(tempInputPath, buffer);

                    await qpdf.decrypt(tempInputPath, password, tempOutputPath);
                    
                    buffer = Buffer.from(await fs.readFile(tempOutputPath));
                }

                const data = await pdf(buffer);
                return routeToParser(data.text, jobId);
            } catch (error: any) {
                console.error(`Failed to process file: ${fileName} for job: ${jobId}`, { error: error.message, stack: error.stack });
                return []; // Return empty array for failed files
            } finally {
                for (const tempPath of tempPaths) {
                    try {
                        await fs.unlink(tempPath);
                    } catch (e) {
                        console.error(`Failed to delete temporary file: ${tempPath}`, e);
                    }
                }
            }
        });

        const transactionArrays = await Promise.all(fileProcessingPromises);
        let allTransactions = transactionArrays.flat();

        if (allTransactions.length === 0) {
            console.warn(`No transactions could be parsed for job: ${jobId}`);
            await supabase.from('analysis_jobs').update({ status: 'failed', summary: { error: 'No transactions found' } }).eq('id', jobId);
            return;
        }

        allTransactions.sort((a: Transaction, b: Transaction) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const categorizedTransactions = await categorizeAllTransactions(allTransactions);
        const summary = analyzeSummary(categorizedTransactions);
        const redAlerts = detectRedAlerts(allTransactions);
        const monthlySummariesResult = generateMonthlySummaries(allTransactions);
        const monthlySummaries = monthlySummariesResult.monthlySummaries;
        const counterparties = analyzeCounterparties(categorizedTransactions);
        const riskAssessment = analyzeTransactionPatterns(allTransactions);
        const trends = detectSpendingTrends(categorizedTransactions as any);
        const anomalies = detectAnomalies(allTransactions);

        const aiExecutiveSummary = await generateExecutiveSummary(
            summary,
            redAlerts,
            monthlySummaries,
            categorizedTransactions,
            counterparties,
            riskAssessment
        );

        await saveTransactions(jobId, categorizedTransactions);

        await supabase.from('analysis_jobs').update({
            status: 'completed',
            summary: summary,
            monthly_summary: monthlySummaries,
            red_alerts: redAlerts,
            counterparties: counterparties,
            risk_assessment: riskAssessment,
            trends: trends,
            anomalies: anomalies,
            ai_executive_summary: aiExecutiveSummary,
        }).eq('id', jobId);

        console.log(`Analysis complete for job ${jobId}`);

    } catch (error: any) {
        console.error(`Error analyzing job ${jobId}:`, { error: error.message, stack: error.stack });
        await supabase.from('analysis_jobs').update({ status: 'failed', summary: { error: error.message } }).eq('id', jobId);
    }
}

