import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import CreateNewReportModal from './CreateNewReportModal';
import * as useFinancialAnalysis from '@/hooks/useFinancialAnalysis';
import * as supabaseAuthHelpers from '@supabase/auth-helpers-react';

// Mock the child component
vi.mock('@/components/upload/RealTimeBankDetection', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-bank-detection">Mock Bank Detection</div>,
}));

// Mock the hooks
vi.mock('@/hooks/useFinancialAnalysis');
vi.mock('@supabase/auth-helpers-react');

describe('CreateNewReportModal', () => {
  const mockAnalyzeDocuments = vi.fn().mockResolvedValue(undefined);
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock useFinancialAnalysis hook with all required properties
    vi.spyOn(useFinancialAnalysis, 'useFinancialAnalysis').mockReturnValue({
      analyzeDocuments: mockAnalyzeDocuments,
      isAnalyzing: false,
      isLoading: false,
      isUploading: false,
      progress: 0,
      result: null,
      error: null,
      analysisId: null,
      reset: vi.fn(),
      uploadProgress: 0,
      analysisProgress: 0,
      currentStep: null
    } as any);

    // Mock useUser hook
    vi.spyOn(supabaseAuthHelpers, 'useUser').mockReturnValue({
      id: 'test-user-id',
} as any);
  });

  test('should complete the multi-step wizard and start analysis', async () => {
    const user = userEvent.setup();
    render(
      <CreateNewReportModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    // === Step 1: Report Details ===
    // On step 1, the step text is not visible. We check for the main title.
    expect(screen.getByText('Create New Analysis Report')).toBeInTheDocument();
    
    // Fill in report name
    const reportNameInput = screen.getByLabelText(/report name/i);
    await user.type(reportNameInput, 'Q1 Financials');
    expect(reportNameInput).toHaveValue('Q1 Financials');

    // Click Next
    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    // === Step 2: Upload Files ===
    await waitFor(() => {
      // Now on step 2, the step text should be visible
      expect(screen.getByText('Step 2 of 3')).toBeInTheDocument();
    });

    // Simulate file upload
    const file = new File(['dummy content'], 'statement.pdf', { type: 'application/pdf' });
    // Use test id for reliable selection
    const fileInput = screen.getByTestId('file-upload-input') as HTMLInputElement;

    if (fileInput) {
      await user.upload(fileInput, file);
    } else {
      throw new Error('File input not found for upload test');
    }
    
    // Check if the file is listed
    await waitFor(() => {
        expect(screen.getByText('statement.pdf')).toBeInTheDocument();
    });

    // Click Next again
    await user.click(nextButton);

    // === Step 3: Review & Confirm ===
    await waitFor(() => {
      expect(screen.getByText('Step 3 of 3')).toBeInTheDocument();
    });

    // Check if report details are displayed
    expect(screen.getByText('Q1 Financials')).toBeInTheDocument();
    
    // The mock for RealTimeBankDetection runs automatically
    // We just need to wait for the UI to update based on its mock output
    
    // Click Start Analysis
    const startAnalysisButton = screen.getByRole('button', { name: /start analysis/i });
    await user.click(startAnalysisButton);

    // Verify the analyzeDocuments function was called with correct parameters
    await waitFor(() => {
      expect(mockAnalyzeDocuments).toHaveBeenCalledTimes(1);
      expect(mockAnalyzeDocuments).toHaveBeenCalledWith(
        [expect.any(File)],
        [],
        'test-user-id',
        'Q1 Financials',
        expect.stringContaining('REF-'),
        'comprehensive'
      );
    }, { timeout: 5000 });

    // Mock that analysis is complete
    vi.spyOn(useFinancialAnalysis, 'useFinancialAnalysis').mockReturnValue({
        analyzeDocuments: mockAnalyzeDocuments,
        isAnalyzing: false,
        isLoading: false,
        isUploading: false,
        progress: 100,
        result: { success: true },
        error: null,
        analysisId: 'test-analysis-id',
        reset: vi.fn(),
        uploadProgress: 100,
        analysisProgress: 100,
        currentStep: 'complete'
      } as any);

    // It should eventually call onClose and onSuccess
    await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalledTimes(1);
        expect(mockOnSuccess).toHaveBeenCalledTimes(1);
    });
  }, 10000);
});
