/**
 * File Upload API - Production Ready with Real Processing
 * NOW INCLUDES: FOIR, Income Verification, Advanced Fraud, Banking Behavior Score
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';
import { parseCSV } from '@/lib/parsing/csv-parser';
import { parsePDFStatement } from '@/lib/parsing/enhanced-pdf-parser';
import { parseExcel } from '@/lib/parsing/excel-parser';
import { detectBankDetails } from '@/lib/services/bank-detection-service';
import { categorizeTransactions } from '@/lib/analysis/categorization-service';
import { analyzeSummary } from '@/lib/analysis/summary-service';
import { assessRisk, detectFraudPatterns } from '@/lib/analysis/risk-service';
import { calculateFOIR } from '@/lib/analysis/foir-service';
import { verifyIncome } from '@/lib/analysis/income-verification-service';
import { detectAdvancedFraud } from '@/lib/analysis/advanced-fraud-service';
import { calculateBankingBehaviorScore } from '@/lib/analysis/banking-behavior-service';
import { generateMonthlySummaries } from '@/lib/analysis/monthly-summary-service';

export async function POST(request: NextRequest) {
  try {
    // Check authentication - await cookies() before using it
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Please login' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const reportName = formData.get('reportName') as string;
    const referenceId = formData.get('referenceId') as string;
    const password = formData.get('password') as string | null;

    // Validate file
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Enhanced file validation
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size is 10MB. Please compress or split your file.' },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        { success: false, error: 'File appears to be empty. Please select a valid file.' },
        { status: 400 }
      );
    }

    // Validate file type with more specific checks
    const allowedTypes = [
      'application/pdf',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!allowedTypes.includes(file.type)) {
      // Additional check for files that might have wrong MIME types
      const fileName = file.name.toLowerCase();
      const hasValidExtension = fileName.endsWith('.pdf') ||
                               fileName.endsWith('.csv') ||
                               fileName.endsWith('.xls') ||
                               fileName.endsWith('.xlsx');

      if (!hasValidExtension) {
        return NextResponse.json(
          { success: false, error: 'Invalid file type. Only PDF, CSV, and Excel files (.pdf, .csv, .xls, .xlsx) are allowed' },
          { status: 400 }
        );
      }
    }

    // Validate report name
    if (!reportName || reportName.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Report name is required' },
        { status: 400 }
      );
    }

    if (reportName.length > 100) {
      return NextResponse.json(
        { success: false, error: 'Report name is too long. Maximum 100 characters allowed.' },
        { status: 400 }
      );
    }

    // Validate reference ID if provided
    if (referenceId && referenceId.length > 50) {
      return NextResponse.json(
        { success: false, error: 'Reference ID is too long. Maximum 50 characters allowed.' },
        { status: 400 }
      );
    }

    // Generate job ID
    const jobId = uuidv4();
    const finalReferenceId = referenceId || `REF-${Date.now()}`;

    console.log(`[Upload] Processing file: ${file.name} for user: ${userId}`);

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload file to Supabase Storage
    const fileName = `${userId}/${jobId}/${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json(
        { success: false, error: 'Failed to upload file to storage', details: uploadError.message },
        { status: 500 }
      );
    }

    console.log(`[Upload] File uploaded to storage: ${fileName}`);

    // Create analysis job in database with 'processing' status
    const { data: job, error: jobError } = await supabase
      .from('analysis_jobs')
      .insert({
        id: jobId,
        user_id: userId,
        report_name: reportName,
        reference_id: finalReferenceId,
        status: 'processing',
        document_name: file.name,
        file_path: fileName,
        file_type: file.type,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (jobError) {
      console.error('Database insert error:', jobError);
      return NextResponse.json(
        { success: false, error: 'Failed to create analysis job', details: jobError.message },
        { status: 500 }
      );
    }

    console.log(`[Upload] Job created: ${jobId}`);

    // PROCESS FILE IMMEDIATELY (for CSV files)
    // For production, this should be moved to a background job queue
    if (file.type === 'text/csv') {
      try {
        console.log(`[Processing] Starting CSV analysis for job: ${jobId}`);

        // Parse CSV
        const fileContent = new TextDecoder().decode(bytes);
        const transactions = await parseCSV(fileContent);

        // Detect bank details from file content
        const bankDetails = detectBankDetails(fileContent);

        // Set job_id for all transactions
        transactions.forEach(tx => tx.job_id = jobId);

        console.log(`[Processing] Parsed ${transactions.length} transactions`);

        // Categorize transactions
        const categorizedTransactions = categorizeTransactions(transactions);
        console.log(`[Processing] Categorized transactions`);

        // Analyze summary
        const summary = analyzeSummary(categorizedTransactions);
        console.log(`[Processing] Generated summary analysis`);

        // Risk assessment
        const riskAssessment = assessRisk(categorizedTransactions, summary);
        console.log(`[Processing] Completed risk assessment`);

        // Fraud detection (basic)
        const fraudAlerts = detectFraudPatterns(categorizedTransactions);
        console.log(`[Processing] Basic fraud detection complete`);

        // ⭐ NEW: FOIR Calculation
        const foirAnalysis = calculateFOIR(transactions);
        console.log(`[Processing] FOIR analysis complete - FOIR: ${foirAnalysis.foir}%`);

        // ⭐ NEW: Income Verification
        const incomeVerification = verifyIncome(transactions);
        console.log(`[Processing] Income verification complete - Status: ${incomeVerification.verificationStatus}`);

        // ⭐ NEW: Advanced Fraud Detection
        const advancedFraud = detectAdvancedFraud(transactions);
        console.log(`[Processing] Advanced fraud detection complete - Score: ${advancedFraud.fraudScore}`);

        // ⭐ NEW: Banking Behavior Score
        const bankingBehavior = calculateBankingBehaviorScore(transactions);
        console.log(`[Processing] Banking behavior analysis complete - Score: ${bankingBehavior.behaviorScore}`);

        // ⭐ NEW: Monthly Summaries
        const monthlySummaries = generateMonthlySummaries(transactions);
        console.log(`[Processing] Monthly summaries generated for ${monthlySummaries.monthlySummaries.length} months`);

        // Save transactions to database
        const { error: txError } = await supabase
          .from('bank_transactions')
          .insert(
            transactions.map(tx => ({
              job_id: jobId,
              user_id: userId,
              date: tx.date,
              description: tx.description,
              debit: tx.debit,
              credit: tx.credit,
              balance: tx.balance,
              category: (tx as any).category || null
            }))
          );

        if (txError) {
          console.error('Transaction insert error:', txError);
        }

        // Update job with ALL results
        const { error: updateError } = await supabase
          .from('analysis_jobs')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            metadata: {
              summary,
              riskAssessment,
              fraudAlerts,
              foirAnalysis, // ⭐ NEW
              incomeVerification, // ⭐ NEW
              advancedFraud, // ⭐ NEW
              bankingBehavior, // ⭐ NEW
              transactionCount: transactions.length,
              processingTime: Date.now()
            }
          })
          .eq('id', jobId);

        if (updateError) {
          console.error('Job update error:', updateError);
        }

        console.log(`[Processing] Job completed successfully: ${jobId}`);

        return NextResponse.json({
          success: true,
          jobId,
          referenceId: finalReferenceId,
          message: 'Analysis completed successfully',
          summary: {
            transactionCount: transactions.length,
            totalIncome: summary.totalIncome,
            totalExpenses: summary.totalExpenses,
            netCashFlow: summary.netCashFlow,
            riskLevel: riskAssessment.riskLevel,
            riskScore: riskAssessment.overallRiskScore,
            // ⭐ NEW SUMMARY FIELDS
            foir: foirAnalysis.foir,
            foirStatus: foirAnalysis.foirStatus,
            incomeVerified: incomeVerification.verificationStatus === 'Verified',
            fraudScore: advancedFraud.fraudScore,
            fraudLevel: advancedFraud.fraudLevel,
            bankingBehaviorScore: bankingBehavior.behaviorScore,
            bankingBehaviorRating: bankingBehavior.behaviorRating,
            accountAgeMonths: bankingBehavior.accountVintage.accountAgeMonths,
            meetsMinimumAge: bankingBehavior.accountVintage.meetsMinimumAge
          }
        });
      } catch (processingError: any) {
        console.error('[Processing] Error:', processingError);

        // Update job status to failed
        await supabase
          .from('analysis_jobs')
          .update({
            status: 'failed',
            error: processingError.message
          })
          .eq('id', jobId);

        return NextResponse.json({
          success: false,
          jobId,
          error: 'Processing failed',
          details: processingError.message
        }, { status: 500 });
      }
    } else if (file.type === 'application/pdf') {
      try {
        console.log(`[Processing] Starting PDF analysis for job: ${jobId}`);

        // Parse PDF with password support
        const transactions = await parsePDFStatement(buffer, {
          password: password || undefined,
          tryCommonPasswords: true
        });

        if (transactions.length === 0) {
          throw new Error('No transactions found in PDF. Please ensure this is a valid bank statement.');
        }

        // Set job_id for all transactions
        transactions.forEach(tx => tx.job_id = jobId);

        console.log(`[Processing] Parsed ${transactions.length} transactions from PDF`);

        // Use same analysis pipeline as CSV
        const categorizedTransactions = categorizeTransactions(transactions);
        console.log(`[Processing] Categorized transactions`);

        const summary = analyzeSummary(categorizedTransactions);
        console.log(`[Processing] Generated summary analysis`);

        const riskAssessment = assessRisk(categorizedTransactions, summary);
        console.log(`[Processing] Completed risk assessment`);

        const fraudAlerts = detectFraudPatterns(categorizedTransactions);
        console.log(`[Processing] Basic fraud detection complete`);

        const foirAnalysis = calculateFOIR(transactions);
        console.log(`[Processing] FOIR analysis complete - FOIR: ${foirAnalysis.foir}%`);

        const incomeVerification = verifyIncome(transactions);
        console.log(`[Processing] Income verification complete - Status: ${incomeVerification.verificationStatus}`);

        const advancedFraud = detectAdvancedFraud(transactions);
        console.log(`[Processing] Advanced fraud detection complete - Score: ${advancedFraud.fraudScore}`);

        const bankingBehavior = calculateBankingBehaviorScore(transactions);
        console.log(`[Processing] Banking behavior analysis complete - Score: ${bankingBehavior.behaviorScore}`);

        const monthlySummaries = generateMonthlySummaries(transactions);
        console.log(`[Processing] Monthly summaries generated for ${monthlySummaries.monthlySummaries.length} months`);

        // Save transactions to database
        const { error: txError } = await supabase
          .from('bank_transactions')
          .insert(
            transactions.map(tx => ({
              job_id: jobId,
              user_id: userId,
              date: tx.date,
              description: tx.description,
              debit: tx.debit,
              credit: tx.credit,
              balance: tx.balance,
              category: (tx as any).category || null
            }))
          );

        if (txError) {
          console.error('Transaction insert error:', txError);
        }

        // Update job with ALL results
        const { error: updateError } = await supabase
          .from('analysis_jobs')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            metadata: {
              summary,
              riskAssessment,
              fraudAlerts,
              foirAnalysis,
              incomeVerification,
              advancedFraud,
              bankingBehavior,
              monthlySummaries,
              transactionCount: transactions.length,
              processingTime: Date.now()
            }
          })
          .eq('id', jobId);

        if (updateError) {
          console.error('Job update error:', updateError);
        }

        console.log(`[Processing] PDF job completed successfully: ${jobId}`);

        return NextResponse.json({
          success: true,
          jobId,
          referenceId: finalReferenceId,
          message: 'PDF analysis completed successfully',
          summary: {
            transactionCount: transactions.length,
            totalIncome: summary.totalIncome,
            totalExpenses: summary.totalExpenses,
            netCashFlow: summary.netCashFlow,
            riskLevel: riskAssessment.riskLevel,
            riskScore: riskAssessment.overallRiskScore,
            foir: foirAnalysis.foir,
            foirStatus: foirAnalysis.foirStatus,
            incomeVerified: incomeVerification.verificationStatus === 'Verified',
            fraudScore: advancedFraud.fraudScore,
            fraudLevel: advancedFraud.fraudLevel,
            bankingBehaviorScore: bankingBehavior.behaviorScore,
            bankingBehaviorRating: bankingBehavior.behaviorRating,
            accountAgeMonths: bankingBehavior.accountVintage.accountAgeMonths,
            meetsMinimumAge: bankingBehavior.accountVintage.meetsMinimumAge
          }
        });
      } catch (processingError: any) {
        console.error('[PDF Processing] Error:', processingError);

        // Update job status to failed
        await supabase
          .from('analysis_jobs')
          .update({
            status: 'failed',
            error: processingError.message
          })
          .eq('id', jobId);

        return NextResponse.json({
          success: false,
          jobId,
          error: 'PDF processing failed',
          details: processingError.message
        }, { status: 500 });
      }
    } else if (file.type === 'application/vnd.ms-excel' ||
               file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      try {
        console.log(`[Processing] Starting Excel analysis for job: ${jobId}`);

        // Parse Excel
        const transactions = await parseExcel(buffer);

        // Set job_id for all transactions
        transactions.forEach(tx => tx.job_id = jobId);

        console.log(`[Processing] Parsed ${transactions.length} transactions from Excel`);

        // Use same analysis pipeline as CSV
        const categorizedTransactions = categorizeTransactions(transactions);
        console.log(`[Processing] Categorized transactions`);

        const summary = analyzeSummary(categorizedTransactions);
        console.log(`[Processing] Generated summary analysis`);

        const riskAssessment = assessRisk(categorizedTransactions, summary);
        console.log(`[Processing] Completed risk assessment`);

        const fraudAlerts = detectFraudPatterns(categorizedTransactions);
        console.log(`[Processing] Basic fraud detection complete`);

        const foirAnalysis = calculateFOIR(transactions);
        console.log(`[Processing] FOIR analysis complete - FOIR: ${foirAnalysis.foir}%`);

        const incomeVerification = verifyIncome(transactions);
        console.log(`[Processing] Income verification complete - Status: ${incomeVerification.verificationStatus}`);

        const advancedFraud = detectAdvancedFraud(transactions);
        console.log(`[Processing] Advanced fraud detection complete - Score: ${advancedFraud.fraudScore}`);

        const bankingBehavior = calculateBankingBehaviorScore(transactions);
        console.log(`[Processing] Banking behavior analysis complete - Score: ${bankingBehavior.behaviorScore}`);

        const monthlySummaries = generateMonthlySummaries(transactions);
        console.log(`[Processing] Monthly summaries generated for ${monthlySummaries.monthlySummaries.length} months`);

        // Save transactions to database
        const { error: txError } = await supabase
          .from('bank_transactions')
          .insert(
            transactions.map(tx => ({
              job_id: jobId,
              user_id: userId,
              date: tx.date,
              description: tx.description,
              debit: tx.debit,
              credit: tx.credit,
              balance: tx.balance,
              category: (tx as any).category || null
            }))
          );

        if (txError) {
          console.error('Transaction insert error:', txError);
        }

        // Update job with ALL results
        const { error: updateError } = await supabase
          .from('analysis_jobs')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            metadata: {
              summary,
              riskAssessment,
              fraudAlerts,
              foirAnalysis,
              incomeVerification,
              advancedFraud,
              bankingBehavior,
              monthlySummaries,
              transactionCount: transactions.length,
              processingTime: Date.now()
            }
          })
          .eq('id', jobId);

        if (updateError) {
          console.error('Job update error:', updateError);
        }

        console.log(`[Processing] Excel job completed successfully: ${jobId}`);

        return NextResponse.json({
          success: true,
          jobId,
          referenceId: finalReferenceId,
          message: 'Excel analysis completed successfully',
          summary: {
            transactionCount: transactions.length,
            totalIncome: summary.totalIncome,
            totalExpenses: summary.totalExpenses,
            netCashFlow: summary.netCashFlow,
            riskLevel: riskAssessment.riskLevel,
            riskScore: riskAssessment.overallRiskScore,
            foir: foirAnalysis.foir,
            foirStatus: foirAnalysis.foirStatus,
            incomeVerified: incomeVerification.verificationStatus === 'Verified',
            fraudScore: advancedFraud.fraudScore,
            fraudLevel: advancedFraud.fraudLevel,
            bankingBehaviorScore: bankingBehavior.behaviorScore,
            bankingBehaviorRating: bankingBehavior.behaviorRating,
            accountAgeMonths: bankingBehavior.accountVintage.accountAgeMonths,
            meetsMinimumAge: bankingBehavior.accountVintage.meetsMinimumAge
          }
        });
      } catch (processingError: any) {
        console.error('[Excel Processing] Error:', processingError);

        // Update job status to failed
        await supabase
          .from('analysis_jobs')
          .update({
            status: 'failed',
            error: processingError.message
          })
          .eq('id', jobId);

        return NextResponse.json({
          success: false,
          jobId,
          error: 'Excel processing failed',
          details: processingError.message
        }, { status: 500 });
      }
    } else {
      return NextResponse.json(
        { success: false, error: 'Unsupported file type' },
        { status: 400 }
      );
    }

  } catch (error: any) {
    console.error('Upload API Error:', error);

    // Handle different types of errors with appropriate responses
    if (error.message?.includes('JWT') || error.message?.includes('Unauthorized')) {
      return NextResponse.json(
        { success: false, error: 'Authentication failed. Please log in again.' },
        { status: 401 }
      );
    }

    if (error.message?.includes('storage') || error.message?.includes('upload')) {
      return NextResponse.json(
        { success: false, error: 'File storage error. Please try again.' },
        { status: 500 }
      );
    }

    if (error.message?.includes('database') || error.message?.includes('insert')) {
      return NextResponse.json(
        { success: false, error: 'Database error. Please try again.' },
        { status: 500 }
      );
    }

    // Generic error response
    return NextResponse.json(
      { success: false, error: 'Upload failed. Please try again or contact support if the problem persists.', details: error.message },
      { status: 500 }
    );
  }
}

// GET method - Get recent uploads
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's recent uploads
    const { data: jobs, error } = await supabase
      .from('analysis_jobs')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ jobs: jobs || [] });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
