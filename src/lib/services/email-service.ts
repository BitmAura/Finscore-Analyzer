/**
 * Email Notification Service
 * Handles all email communications for the application
 */

import { Resend } from 'resend';
import nodemailer from 'nodemailer';

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export interface EmailOptions {
  to: string | string[];
  template: EmailTemplate;
  attachments?: any[];
}

// Initialize email services
const resend = new Resend(process.env.RESEND_API_KEY);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send email using Resend (preferred for production)
 */
export async function sendEmailResend(options: EmailOptions): Promise<boolean> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured, skipping email');
      return false;
    }

    const { to, template, attachments } = options;

    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'FinScore <noreply@finscore.app>',
      to: Array.isArray(to) ? to : [to],
      subject: template.subject,
      html: template.html,
      text: template.text,
      attachments,
    });

    console.log(`Email sent successfully to ${to}`);
    return true;
  } catch (error) {
    console.error('Failed to send email via Resend:', error);
    return false;
  }
}

/**
 * Send email using Nodemailer (fallback)
 */
export async function sendEmailNodemailer(options: EmailOptions): Promise<boolean> {
  try {
    if (!process.env.SMTP_HOST) {
      console.warn('SMTP not configured, skipping email');
      return false;
    }

    const { to, template, attachments } = options;

    await transporter.sendMail({
      from: process.env.FROM_EMAIL || 'FinScore <noreply@finscore.app>',
      to: Array.isArray(to) ? to.join(', ') : to,
      subject: template.subject,
      html: template.html,
      text: template.text,
      attachments,
    });

    console.log(`Email sent successfully to ${to}`);
    return true;
  } catch (error) {
    console.error('Failed to send email via Nodemailer:', error);
    return false;
  }
}

/**
 * Send email with fallback mechanism
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  // Try Resend first (better for production)
  if (process.env.RESEND_API_KEY) {
    const success = await sendEmailResend(options);
    if (success) return true;
  }

  // Fallback to Nodemailer
  if (process.env.SMTP_HOST) {
    return await sendEmailNodemailer(options);
  }

  console.warn('No email service configured');
  return false;
}

/**
 * Email templates
 */
export const EmailTemplates = {
  // Welcome email for new users
  welcome: (name: string): EmailTemplate => ({
    subject: 'Welcome to FinScore Analyzer!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Welcome to FinScore Analyzer!</h1>
        <p>Hi ${name},</p>
        <p>Thank you for joining FinScore Analyzer. You're now ready to start analyzing your bank statements with our advanced AI-powered tools.</p>
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">What you can do:</h3>
          <ul>
            <li>Upload CSV and PDF bank statements</li>
            <li>Get detailed financial analysis</li>
            <li>Receive risk assessments and fraud detection</li>
            <li>Generate professional reports</li>
          </ul>
        </div>
        <p>Get started by uploading your first bank statement!</p>
        <p>Best regards,<br>The FinScore Team</p>
      </div>
    `,
    text: `Welcome to FinScore Analyzer!

Hi ${name},

Thank you for joining FinScore Analyzer. You're now ready to start analyzing your bank statements with our advanced AI-powered tools.

What you can do:
- Upload CSV and PDF bank statements
- Get detailed financial analysis
- Receive risk assessments and fraud detection
- Generate professional reports

Get started by uploading your first bank statement!

Best regards,
The FinScore Team`
  }),

  // Password reset email
  passwordReset: (name: string, resetLink: string): EmailTemplate => ({
    subject: 'Reset Your FinScore Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Password Reset Request</h1>
        <p>Hi ${name},</p>
        <p>We received a request to reset your password. Click the button below to set a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p><small>This link will expire in 1 hour for security reasons.</small></p>
        <p>If you didn't request this reset, please ignore this email.</p>
        <p>Best regards,<br>The FinScore Team</p>
      </div>
    `,
    text: `Password Reset Request

Hi ${name},

We received a request to reset your password. Click the link below to set a new password:

${resetLink}

This link will expire in 1 hour for security reasons.

If you didn't request this reset, please ignore this email.

Best regards,
The FinScore Team`
  }),

  // Report completion email
  reportComplete: (name: string, reportName: string, reportLink: string): EmailTemplate => ({
    subject: 'Your FinScore Analysis Report is Ready',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Analysis Complete!</h1>
        <p>Hi ${name},</p>
        <p>Your bank statement analysis for <strong>"${reportName}"</strong> has been completed successfully.</p>
        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
          <h3 style="margin-top: 0;">Analysis Summary:</h3>
          <ul>
            <li>✅ Transaction categorization completed</li>
            <li>✅ Financial summary generated</li>
            <li>✅ Risk assessment performed</li>
            <li>✅ Fraud detection analysis done</li>
          </ul>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${reportLink}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Full Report
          </a>
        </div>
        <p>You can also access this report from your dashboard anytime.</p>
        <p>Best regards,<br>The FinScore Team</p>
      </div>
    `,
    text: `Analysis Complete!

Hi ${name},

Your bank statement analysis for "${reportName}" has been completed successfully.

Analysis Summary:
✅ Transaction categorization completed
✅ Financial summary generated
✅ Risk assessment performed
✅ Fraud detection analysis done

View your report: ${reportLink}

You can also access this report from your dashboard anytime.

Best regards,
The FinScore Team`
  }),

  // Application status update email
  applicationStatusUpdate: (name: string, applicationId: string, status: string, dashboardLink: string): EmailTemplate => ({
    subject: `Loan Application ${applicationId} Status Updated`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Application Status Update</h1>
        <p>Hi ${name},</p>
        <p>Your loan application <strong>${applicationId}</strong> status has been updated to:</p>
        <div style="text-align: center; margin: 20px 0;">
          <span style="background-color: ${
            status === 'approved' ? '#10b981' :
            status === 'rejected' ? '#ef4444' :
            status === 'under_review' ? '#f59e0b' : '#6b7280'
          }; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; text-transform: uppercase;">
            ${status.replace('_', ' ')}
          </span>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${dashboardLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Application Details
          </a>
        </div>
        <p>If you have any questions, please contact our support team.</p>
        <p>Best regards,<br>The FinScore Team</p>
      </div>
    `,
    text: `Application Status Update

Hi ${name},

Your loan application ${applicationId} status has been updated to: ${status.replace('_', ' ')}

View details: ${dashboardLink}

If you have any questions, please contact our support team.

Best regards,
The FinScore Team`
  }),

  // Risk alert notification
  riskAlert: (name: string, jobId: string, alertType: string, severity: string, reportLink: string): EmailTemplate => ({
    subject: `Risk Alert: ${alertType} Detected in Your Analysis`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626;">Risk Alert Notification</h1>
        <p>Hi ${name},</p>
        <p>We've detected a <strong>${severity.toLowerCase()}</strong> risk alert during your bank statement analysis:</p>
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <h3 style="margin-top: 0; color: #dc2626;">Alert Details:</h3>
          <ul>
            <li><strong>Type:</strong> ${alertType}</li>
            <li><strong>Severity:</strong> ${severity}</li>
            <li><strong>Report ID:</strong> ${jobId}</li>
          </ul>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${reportLink}" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Review Report
          </a>
        </div>
        <p>Please review your report for detailed information and next steps.</p>
        <p>Best regards,<br>The FinScore Team</p>
      </div>
    `,
    text: `Risk Alert Notification

Hi ${name},

We've detected a ${severity.toLowerCase()} risk alert during your bank statement analysis:

Alert Details:
- Type: ${alertType}
- Severity: ${severity}
- Report ID: ${jobId}

Please review your report: ${reportLink}

Best regards,
The FinScore Team`
  }),

  // Analysis progress update
  analysisProgress: (name: string, jobId: string, progress: number, reportLink: string): EmailTemplate => ({
    subject: `Analysis Progress Update - ${progress}% Complete`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Analysis Progress Update</h1>
        <p>Hi ${name},</p>
        <p>Your bank statement analysis is currently in progress:</p>
        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
          <h3 style="margin-top: 0;">Progress: ${progress}%</h3>
          <div style="background-color: #e5e7eb; border-radius: 10px; height: 20px; margin: 10px 0;">
            <div style="background-color: #2563eb; height: 20px; border-radius: 10px; width: ${progress}%;"></div>
          </div>
          <p>Report ID: ${jobId}</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${reportLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Progress
          </a>
        </div>
        <p>You'll receive another notification when the analysis is complete.</p>
        <p>Best regards,<br>The FinScore Team</p>
      </div>
    `,
    text: `Analysis Progress Update

Hi ${name},

Your bank statement analysis is currently in progress:

Progress: ${progress}%
Report ID: ${jobId}

View progress: ${reportLink}

You'll receive another notification when the analysis is complete.

Best regards,
The FinScore Team`
  })
};

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(email: string, name: string): Promise<boolean> {
  return await sendEmail({
    to: email,
    template: EmailTemplates.welcome(name)
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string, name: string, resetLink: string): Promise<boolean> {
  return await sendEmail({
    to: email,
    template: EmailTemplates.passwordReset(name, resetLink)
  });
}

/**
 * Send report completion email
 */
export async function sendReportCompleteEmail(email: string, name: string, reportName: string, reportLink: string): Promise<boolean> {
  return await sendEmail({
    to: email,
    template: EmailTemplates.reportComplete(name, reportName, reportLink)
  });
}

/**
 * Send application status update email
 */
export async function sendApplicationStatusEmail(email: string, name: string, applicationId: string, status: string, dashboardLink: string): Promise<boolean> {
  return await sendEmail({
    to: email,
    template: EmailTemplates.applicationStatusUpdate(name, applicationId, status, dashboardLink)
  });
}

/**
 * Send risk alert email
 */
export async function sendRiskAlertEmail(email: string, name: string, jobId: string, alertType: string, severity: string, reportLink: string): Promise<boolean> {
  return await sendEmail({
    to: email,
    template: EmailTemplates.riskAlert(name, jobId, alertType, severity, reportLink)
  });
}

/**
 * Send analysis progress email
 */
export async function sendAnalysisProgressEmail(email: string, name: string, jobId: string, progress: number, reportLink: string): Promise<boolean> {
  return await sendEmail({
    to: email,
    template: EmailTemplates.analysisProgress(name, jobId, progress, reportLink)
  });
}

export default {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendReportCompleteEmail,
  sendApplicationStatusEmail,
  sendRiskAlertEmail,
  sendAnalysisProgressEmail,
  EmailTemplates,
};