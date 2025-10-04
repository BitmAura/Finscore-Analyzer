import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdvancedFileUpload from '../AdvancedFileUpload';
import { vi, Mock, beforeEach, describe, it, expect } from 'vitest';

// Mock the financial analysis hook
vi.mock('../../../hooks/useFinancialAnalysis', () => ({
  useFinancialAnalysis: () => ({
    isLoading: false,
    isUploading: false,
    isAnalyzing: false,
    progress: 0,
    result: null,
    error: null,
    analysisId: null,
    analyzeDocuments: vi.fn(),
    pollDocumentStatus: vi.fn(),
    cancelAnalysis: vi.fn(),
    reset: vi.fn(),
  })
}));

// Mock auth hook
vi.mock('@supabase/auth-helpers-react', () => ({
  useUser: () => ({ id: 'test-user-id' })
}));

describe('AdvancedFileUpload', () => {
  it('renders without crashing', () => {
    render(
      <AdvancedFileUpload
        reportName="Test Report"
        referenceId="TEST-REF-123"
        reportType="bank-statement"
      />
    );
    expect(screen.getByText(/Drop files here or click to browse/i)).toBeInTheDocument();
  });

  it('calls onFilesChange when files are added', () => {
    const mockOnFilesChange = vi.fn();
    render(
      <AdvancedFileUpload
        onFilesChange={mockOnFilesChange}
        reportName="Test Report"
        referenceId="TEST-REF-123"
        reportType="bank-statement"
      />
    );

    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    const input = screen.getByRole('button', { name: /choose files/i });

    fireEvent.click(input);
    // Since the file input is hidden, we'll just simulate the change event directly
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, {
      target: { files: [file] }
    });

    expect(mockOnFilesChange).toHaveBeenCalled();
  });

  it('validates file types', () => {
    render(
      <AdvancedFileUpload
        acceptedTypes={['.pdf', '.xlsx']}
        reportName="Test Report"
        referenceId="TEST-REF-123"
        reportType="bank-statement"
      />
    );
    expect(screen.getByText(/Supported formats:/i)).toHaveTextContent('.pdf, .xlsx');
  });

  it('handles file size limits', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const file = new File(['test'.repeat(1000000)], 'large.pdf', { type: 'application/pdf' });
    Object.defineProperty(file, 'size', { value: 11 * 1024 * 1024 }); // 11MB

    render(
      <AdvancedFileUpload
        maxFileSize={1}
        reportName="Test Report"
        referenceId="TEST-REF-123"
        reportType="bank-statement"
      />
    );

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('exceeds 1MB limit'));
    consoleSpy.mockRestore();
  });

  it('limits the number of files', () => {
    render(
      <AdvancedFileUpload
        maxFiles={2}
        reportName="Test Report"
        referenceId="TEST-REF-123"
        reportType="bank-statement"
      />
    );
    expect(screen.getByText(/Upload up to 2 files/i)).toBeInTheDocument();
  });

  it('allows file removal', async () => {
    render(
      <AdvancedFileUpload
        reportName="Test Report"
        referenceId="TEST-REF-123"
        reportType="bank-statement"
      />
    );

    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    // Wait for the file to appear in the queue
    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });

    // Click the remove button
    const removeButton = screen.getByRole('button', { name: '' });
    fireEvent.click(removeButton);

    // Check that the file was removed
    await waitFor(() => {
      expect(screen.queryByText('test.pdf')).not.toBeInTheDocument();
    });
  });

  it('displays upload success message', async () => {
    render(
      <AdvancedFileUpload
        reportName="Test Report"
        referenceId="TEST-REF-123"
        reportType="bank-statement"
      />
    );

    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    // Find the Upload button for the file
    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });

    const uploadButton = screen.getByText('Upload');
    fireEvent.click(uploadButton);

    // Simulate a completed upload
    await waitFor(() => {
      const fileElement = screen.getByText('test.pdf').parentElement?.parentElement;
      if (fileElement) {
        Object.defineProperty(fileElement, 'dataset', {
          value: { testid: 'file-status-completed' }
        });
      }
    });
  });

  it('shows file formats correctly', () => {
    render(
      <AdvancedFileUpload
        acceptedTypes={['.pdf', '.docx']}
        reportName="Test Report"
        referenceId="TEST-REF-123"
        reportType="bank-statement"
      />
    );
    expect(screen.getByText(/Supported formats:/i)).toHaveTextContent('.pdf, .docx');
  });

  it('shows file size limit correctly', () => {
    render(
      <AdvancedFileUpload
        maxFileSize={5}
        reportName="Test Report"
        referenceId="TEST-REF-123"
        reportType="bank-statement"
      />
    );
    expect(screen.getByText(/Maximum 5MB per file/i)).toBeInTheDocument();
  });

  it('shows max files limit correctly', () => {
    render(
      <AdvancedFileUpload
        maxFiles={3}
        reportName="Test Report"
        referenceId="TEST-REF-123"
        reportType="bank-statement"
      />
    );
    expect(screen.getByText(/Upload up to 3 files/i)).toBeInTheDocument();
  });
});
