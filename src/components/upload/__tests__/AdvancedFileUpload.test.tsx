import React from 'react'
import { describe, test, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import AdvancedFileUpload from '../AdvancedFileUpload'

describe('AdvancedFileUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renders upload area with correct elements', () => {
    render(<AdvancedFileUpload />)
    
    expect(screen.getByText('Drop files here or click to browse')).toBeInTheDocument()
    expect(screen.getByText('Choose Files')).toBeInTheDocument()
    expect(screen.getByText(/upload up to.*files/i)).toBeInTheDocument()
    expect(screen.getByText(/supported formats/i)).toBeInTheDocument()
  })

  test('accepts file input and displays file info', async () => {
    const mockOnFilesChange = vi.fn()
    render(<AdvancedFileUpload onFilesChange={mockOnFilesChange} />)
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    expect(fileInput).toBeInTheDocument()
    
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
    
    await userEvent.upload(fileInput, file)
    
    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument()
    })
    
    expect(mockOnFilesChange).toHaveBeenCalled()
  })

  test('validates file types correctly', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<AdvancedFileUpload acceptedTypes={['.pdf', '.xlsx']} />)
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' })
    
    // Trigger file input change event
    await act(async () => {
      Object.defineProperty(fileInput, 'files', {
        value: [invalidFile],
        writable: false,
      })
      fireEvent.change(fileInput)
    })
    
    // File should not appear in the list since it's invalid
    await waitFor(() => {
      expect(screen.queryByText('test.txt')).not.toBeInTheDocument()
    })
    
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('File type not supported'))
    consoleSpy.mockRestore()
  })

  test('validates file size limits', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<AdvancedFileUpload maxFileSize={1} />)
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    // Create a file larger than 1MB (1MB = 1024*1024 bytes)
    const largeFile = new File(['x'.repeat(2 * 1024 * 1024)], 'large.pdf', { type: 'application/pdf' })
    
    await userEvent.upload(fileInput, largeFile)
    
    // File should not appear since it's too large
    await waitFor(() => {
      expect(screen.queryByText('large.pdf')).not.toBeInTheDocument()
    })
    
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('File size exceeds'))
    consoleSpy.mockRestore()
  })

  test('respects maximum file count', async () => {
    render(<AdvancedFileUpload maxFiles={2} />)
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const files = [
      new File(['1'], '1.pdf', { type: 'application/pdf' }),
      new File(['2'], '2.pdf', { type: 'application/pdf' }),
      new File(['3'], '3.pdf', { type: 'application/pdf' })
    ]
    
    await userEvent.upload(fileInput, files)

    await waitFor(() => {
      // Should only show 2 files (the maximum)
      expect(screen.getByText('1.pdf')).toBeInTheDocument()
      expect(screen.getByText('2.pdf')).toBeInTheDocument()
      expect(screen.queryByText('3.pdf')).not.toBeInTheDocument()
    })
  })

  test('removes files correctly', async () => {
    render(<AdvancedFileUpload />)
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
    
    await userEvent.upload(fileInput, file)
    
    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument()
    })

    // Find the remove button (X icon button) - it doesn't have accessible name, so find by role and position
    const removeButtons = screen.getAllByRole('button')
    const removeButton = removeButtons.find(button => {
      const svg = button.querySelector('svg')
      return svg && svg.querySelector('path[d*="M6 18L18 6M6 6l12 12"]')
    })
    
    expect(removeButton).toBeInTheDocument()
    if (removeButton) {
      await userEvent.click(removeButton)
    }

    await waitFor(() => {
      expect(screen.queryByText('test.pdf')).not.toBeInTheDocument()
    })
  })

  test('upload button appears when files are pending', async () => {
    render(<AdvancedFileUpload />)
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
    
    await userEvent.upload(fileInput, file)
    
    await waitFor(() => {
      expect(screen.getByText('Upload All')).toBeInTheDocument()
    })
  })

  test('displays file count in upload queue header', async () => {
    render(<AdvancedFileUpload maxFiles={5} />)
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const files = [
      new File(['1'], '1.pdf', { type: 'application/pdf' }),
      new File(['2'], '2.pdf', { type: 'application/pdf' })
    ]
    
    await userEvent.upload(fileInput, files)
    
    await waitFor(() => {
      expect(screen.getByText('Upload Queue (2/5)')).toBeInTheDocument()
    })
  })

  test('handles custom accepted file types', async () => {
    render(<AdvancedFileUpload acceptedTypes={['.pdf', '.docx']} />)
    
    expect(screen.getByText('Supported formats: .pdf, .docx')).toBeInTheDocument()
  })

  test('handles custom max file size', () => {
    render(<AdvancedFileUpload maxFileSize={5} />)
    
    expect(screen.getByText(/maximum 5mb per file/i)).toBeInTheDocument()
  })

  test('handles custom max files count', () => {
    render(<AdvancedFileUpload maxFiles={3} />)
    
    expect(screen.getByText(/upload up to 3 files/i)).toBeInTheDocument()
  })
})