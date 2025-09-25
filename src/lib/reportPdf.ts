import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function generateReportPdf({
  reportName,
  companyName,
  referenceId,
  reportType,
  accounts,
  analysisResults
}: {
  reportName: string;
  companyName: string;
  referenceId: string;
  reportType: string;
  accounts: Array<{ key: string; bankName: string; accountNumber: string; pdfPassword: string; files: File[] }>;
  analysisResults?: any;
}) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  let y = 800;
  page.drawText('FinScore Analyzer Report', { x: 50, y, size: 24, font, color: rgb(0.2, 0.2, 0.7) });
  y -= 40;
  page.drawText(`Case ID: ${reportName}`, { x: 50, y, size: 14, font });
  y -= 20;
  page.drawText(`Company Name: ${companyName || '-'}`, { x: 50, y, size: 14, font });
  y -= 20;
  page.drawText(`Reference ID: ${referenceId}`, { x: 50, y, size: 14, font });
  y -= 20;
  page.drawText(`Type: ${reportType}`, { x: 50, y, size: 14, font });
  y -= 30;
  page.drawText('Accounts:', { x: 50, y, size: 16, font });
  y -= 20;
  accounts.forEach((acct, idx) => {
    page.drawText(`${idx + 1}. ${acct.key} | ${acct.bankName} | ${acct.accountNumber}`, { x: 60, y, size: 12, font });
    y -= 16;
  });
  y -= 20;
  page.drawText('Analysis Results:', { x: 50, y, size: 16, font });
  y -= 20;
  if (analysisResults) {
    page.drawText(JSON.stringify(analysisResults, null, 2).slice(0, 800), { x: 60, y, size: 10, font });
  } else {
    page.drawText('No results available.', { x: 60, y, size: 12, font });
  }
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
