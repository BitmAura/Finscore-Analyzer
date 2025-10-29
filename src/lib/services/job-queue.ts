/**
 * Background Job Processing System
 * Uses BullMQ + Redis for scalable job processing
 * Handles large file uploads and complex analysis tasks
 */

import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { parseCSV } from '@/lib/parsing/csv-parser';
import { parsePDFStatement } from '@/lib/parsing/enhanced-pdf-parser';
import { detectBankDetails } from '@/lib/services/bank-detection-service';
import { categorizeTransactions } from '@/lib/analysis/categorization-service';
import { analyzeSummary } from '@/lib/analysis/summary-service';
import { assessRisk, detectFraudPatterns } from '@/lib/analysis/risk-service';
import { calculateFOIR } from '@/lib/analysis/foir-service';
import { verifyIncome } from '@/lib/analysis/income-verification-service';
import { detectAdvancedFraud } from '@/lib/analysis/advanced-fraud-service';
import { calculateBankingBehaviorScore } from '@/lib/analysis/banking-behavior-service';
import { generateMonthlySummaries } from '@/lib/analysis/monthly-summary-service';
import { sendReportCompleteEmail, sendRiskAlertEmail } from '@/lib/services/email-service';
// TODO: Move WebSocket broadcast to a separate service to avoid circular dependencies
// import { broadcastRiskUpdate } from '@/app/api/websocket/route';

// Redis configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
};

// Create Redis connection
const redis = new Redis(redisConfig);

// Job queues
export const analysisQueue = new Queue('statement-analysis', {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: 50,
    removeOnFail: 100,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

// Job data interfaces
interface AnalysisJobData {
  jobId: string;
  userId: string;
  fileName: string;
  filePath: string;
  fileType: string;
  fileBuffer: Buffer;
  password?: string;
  referenceId: string;
  reportName: string;
}

// Worker to process analysis jobs
const analysisWorker = new Worker(
  'statement-analysis',
  async (job: Job<AnalysisJobData>) => {
    const { jobId, userId, fileName, fileType, fileBuffer, password, reportName } = job.data;

    console.log(`[Worker] Processing job: ${jobId} for user: ${userId}`);

    try {
      // Update job status to processing
      await updateJobStatus(jobId, 'processing');
      await job.updateProgress(5);

      // Initialize Supabase client - pass the cookies helper directly
      const cookieStore = await cookies();
      const supabase = createRouteHandlerClient({ cookies: async () => cookieStore });

      let transactions: any[] = [];
      let bankDetails: any = {};

      // Process file based on type
      if (fileType === 'text/csv') {
        console.log(`[Worker] Processing CSV file: ${fileName}`);
        await job.updateProgress(10);

        // Parse CSV
        const fileContent = fileBuffer.toString();
        transactions = await parseCSV(fileContent);

        // Detect bank details
        bankDetails = detectBankDetails(fileContent);
        await job.updateProgress(20);

      } else if (fileType === 'application/pdf') {
        console.log(`[Worker] Processing PDF file: ${fileName}`);
        await job.updateProgress(10);

        // Parse PDF with password support
        transactions = await parsePDFStatement(fileBuffer, {
          password: password || undefined,
          tryCommonPasswords: true
        });

        if (transactions.length === 0) {
          throw new Error('No transactions found in PDF. Please ensure this is a valid bank statement.');
        }

        // Basic bank detection for PDF (can be enhanced)
        bankDetails = { bankName: 'Unknown Bank', confidence: 0 };
        await job.updateProgress(20);

      } else {
        throw new Error(`Unsupported file type: ${fileType}`);
      }

      // Set job_id for all transactions
      transactions.forEach(tx => tx.job_id = jobId);

      console.log(`[Worker] Parsed ${transactions.length} transactions`);
      await job.updateProgress(30);

      // Run complete analysis pipeline
      const categorizedTransactions = categorizeTransactions(transactions);
      console.log(`[Worker] Categorized transactions`);
      await job.updateProgress(40);

      const summary = analyzeSummary(categorizedTransactions);
      console.log(`[Worker] Generated summary analysis`);
      await job.updateProgress(50);

      const riskAssessment = assessRisk(categorizedTransactions, summary);
      console.log(`[Worker] Completed risk assessment`);
      await job.updateProgress(60);

      // TODO: Re-enable after moving WebSocket service
      // await broadcastRiskUpdate(jobId, {
      //   overallRiskScore: riskAssessment.overallRiskScore || 0,
      //   riskLevel: riskAssessment.riskLevel || 'Unknown'
      // });

      const fraudAlerts: import('@/lib/analysis/risk-service').FraudAnalysisResult = detectFraudPatterns(categorizedTransactions);
      console.log(`[Worker] Basic fraud detection complete`);
      await job.updateProgress(70);

      // TODO: Re-enable after moving WebSocket service
      // await broadcastRiskUpdate(jobId, {
      //   fraudScore: fraudAlerts.fraudScore,
      //   fraudLevel: fraudAlerts.fraudLevel,
      //   alerts: fraudAlerts.alerts
      // });

      // Advanced analysis modules
      const foirAnalysis = calculateFOIR(transactions);
      console.log(`[Worker] FOIR analysis complete - FOIR: ${foirAnalysis.foir}%`);
      await job.updateProgress(75);

      // TODO: Re-enable after moving WebSocket service
      // await broadcastRiskUpdate(jobId, {
      //   foir: foirAnalysis.foir || 0,
      //   foirStatus: foirAnalysis.foirStatus || 'Unknown'
      // });

      const incomeVerification = verifyIncome(transactions);
      console.log(`[Worker] Income verification complete - Status: ${incomeVerification.verificationStatus}`);
      await job.updateProgress(80);

      const advancedFraud = detectAdvancedFraud(transactions);
      console.log(`[Worker] Advanced fraud detection complete - Score: ${advancedFraud.fraudScore}`);
      await job.updateProgress(85);

      // TODO: Re-enable after moving WebSocket service
      // await broadcastRiskUpdate(jobId, {
      //   advancedFraudScore: advancedFraud.fraudScore || 0,
      //   fraudLevel: advancedFraud.fraudLevel || 'Unknown'
      // });

      const bankingBehavior = calculateBankingBehaviorScore(transactions);
      console.log(`[Worker] Banking behavior analysis complete - Score: ${bankingBehavior.behaviorScore}`);
      await job.updateProgress(90);

      // TODO: Re-enable after moving WebSocket service
      // await broadcastRiskUpdate(jobId, {
      //   bankingBehaviorScore: bankingBehavior.behaviorScore || 0,
      //   behaviorRating: bankingBehavior.behaviorRating || 'Unknown'
      // });

      const monthlySummaries = generateMonthlySummaries(transactions);
      console.log(`[Worker] Monthly summaries generated for ${monthlySummaries.monthlySummaries.length} months`);
      await job.updateProgress(95);

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
        throw new Error(`Failed to save transactions: ${txError.message}`);
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
            processingTime: Date.now(),
            bankDetails
          }
        })
        .eq('id', jobId);

      if (updateError) {
        console.error('Job update error:', updateError);
        throw new Error(`Failed to update job: ${updateError.message}`);
      }

      console.log(`[Worker] Job completed successfully: ${jobId}`);
      await job.updateProgress(100);

      // Send completion notification
      try {
        // Get user email
        const { data: user } = await supabase.auth.admin.getUserById(userId);
        if (user?.user?.email) {
          await sendReportCompleteEmail(
            user.user.email,
            user.user.user_metadata?.name || 'User',
            reportName,
            `${process.env.NEXT_PUBLIC_APP_URL}/reports/${jobId}`
          );
        }
      } catch (emailError) {
        console.error('Failed to send completion email:', emailError);
        // Don't fail the job for email errors
      }

      // Send risk alerts if any
      try {
        const { data: user } = await supabase.auth.admin.getUserById(userId);
        if (user?.user?.email && fraudAlerts.alerts.length > 0) {
          for (const alert of fraudAlerts.alerts.filter(a => a.severity === 'High' || a.severity === 'Medium')) {
            await sendRiskAlertEmail(
              user.user.email,
              user.user.user_metadata?.name || 'User',
              jobId,
              alert.type,
              alert.severity,
              `${process.env.NEXT_PUBLIC_APP_URL}/reports/${jobId}`
            );
          }
        }
      } catch (emailError) {
        console.error('Failed to send risk alert email:', emailError);
      }

      return {
        success: true,
        jobId,
        transactionCount: transactions.length,
        processingTime: Date.now() - job.timestamp
      };

    } catch (error: any) {
      console.error(`[Worker] Error processing job ${jobId}:`, error);

      // Update job status to failed
      await updateJobStatus(jobId, 'failed', error.message);

      throw error;
    }
  },
  {
    connection: redis,
    concurrency: 5, // Process up to 5 jobs simultaneously
    limiter: {
      max: 10, // Max jobs per duration
      duration: 1000, // Per second
    },
  }
);

// Helper function to update job status
async function updateJobStatus(jobId: string, status: string, error?: string) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: async () => cookieStore });

    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    } else if (status === 'failed' && error) {
      updateData.error = error;
    }

    const { error: updateError } = await supabase
      .from('analysis_jobs')
      .update(updateData)
      .eq('id', jobId);

    if (updateError) {
      console.error('Failed to update job status:', updateError);
    }
  } catch (err) {
    console.error('Error updating job status:', err);
  }
}

// Worker event handlers
analysisWorker.on('completed', (job) => {
  console.log(`[Worker] Job ${job.id} completed successfully`);
});

analysisWorker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed:`, err.message);
});

analysisWorker.on('stalled', (jobId) => {
  console.warn(`[Worker] Job ${jobId} stalled`);
});

// Queue management functions
export class JobQueueService {
  /**
   * Add analysis job to queue
   */
  static async addAnalysisJob(data: AnalysisJobData) {
    try {
      const job = await analysisQueue.add('analyze-statement', data, {
        priority: 1, // High priority for user-facing tasks
        delay: 0, // Start immediately
      });

      console.log(`[Queue] Added job ${job.id} for analysis job ${data.jobId}`);
      return job;
    } catch (error) {
      console.error('[Queue] Failed to add job:', error);
      throw error;
    }
  }

  /**
   * Get job status
   */
  static async getJobStatus(jobId: string) {
    try {
      const job = await analysisQueue.getJob(jobId);
      if (!job) return null;

      return {
        id: job.id,
        status: await job.getState(),
        progress: job.progress,
        data: job.data,
        finishedOn: job.finishedOn,
        processedOn: job.processedOn,
        failedReason: job.failedReason,
      };
    } catch (error) {
      console.error('[Queue] Failed to get job status:', error);
      return null;
    }
  }

  /**
   * Get queue statistics
   */
  static async getQueueStats() {
    try {
      const [waiting, active, completed, failed, delayed] = await Promise.all([
        analysisQueue.getWaiting(),
        analysisQueue.getActive(),
        analysisQueue.getCompleted(),
        analysisQueue.getFailed(),
        analysisQueue.getDelayed(),
      ]);

      return {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
        delayed: delayed.length,
        total: waiting.length + active.length + completed.length + failed.length + delayed.length,
      };
    } catch (error) {
      console.error('[Queue] Failed to get stats:', error);
      return null;
    }
  }

  /**
   * Clean up old completed jobs
   */
  static async cleanOldJobs(olderThan: number = 24 * 60 * 60 * 1000) { // 24 hours
    try {
      const cutoff = Date.now() - olderThan;
      await analysisQueue.clean(cutoff, 100, 'completed');
      await analysisQueue.clean(cutoff, 100, 'failed');
      console.log('[Queue] Cleaned up old jobs');
    } catch (error) {
      console.error('[Queue] Failed to clean jobs:', error);
    }
  }

  /**
   * Graceful shutdown
   */
  static async shutdown() {
    console.log('[Queue] Shutting down...');
    await analysisWorker.close();
    await analysisQueue.close();
    await redis.quit();
    console.log('[Queue] Shutdown complete');
  }
}

// Graceful shutdown handlers
process.on('SIGTERM', async () => {
  await JobQueueService.shutdown();
});

process.on('SIGINT', async () => {
  await JobQueueService.shutdown();
});

export default JobQueueService;