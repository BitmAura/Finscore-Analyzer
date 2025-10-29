'use client'

import { useState, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Upload,
  Download,
  Trash2,
  Edit,
  Search,
  Filter,
  ArrowUpDown,
  Eye,
  AlertCircle,
  CheckCircle2,
  Lock,
  FileText,
  AlertTriangle,
  Layers
} from 'lucide-react'

// Custom icons
const Check2 = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M9 11l3 3L22 4"></path>
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
  </svg>
)

const X = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
)

interface DocumentType {
  id: string
  name: string
  icon: React.ReactNode
  formats: string[]
  description: string
}

const documentTypes: DocumentType[] = [
  {
    id: 'bank_statement',
    name: 'Bank Statement',
    icon: <FileText className="w-6 h-6 text-blue-600" />,
    formats: ['PDF', 'CSV', 'XLSX'],
    description: 'Monthly account statements from financial institutions'
  },
  {
    id: 'gst_return',
    name: 'GST Return',
    icon: <FileText className="w-6 h-6 text-green-600" />,
    formats: ['PDF', 'XLSX'],
    description: 'Goods and Services Tax filing documents'
  },
  {
    id: 'invoice',
    name: 'Invoice',
    icon: <FileText className="w-6 h-6 text-purple-600" />,
    formats: ['PDF', 'DOCX', 'PNG', 'JPG'],
    description: 'Customer or vendor invoices'
  },
  {
    id: 'bank_statement_password',
    name: 'Password-Protected Statement',
    icon: <Lock className="w-6 h-6 text-amber-600" />,
    formats: ['PDF'],
    description: 'Password-protected bank statements'
  },
  {
    id: 'credit_card',
    name: 'Credit Card Statement',
    icon: <FileText className="w-6 h-6 text-red-600" />,
    formats: ['PDF', 'CSV'],
    description: 'Credit card account statements'
  }
]

interface ProcessingStep {
  id: string
  name: string
  status: 'waiting' | 'processing' | 'completed' | 'failed'
  message?: string
  progress?: number
}

export default function AdvancedDocumentProcessor() {
  const [selectedDocType, setSelectedDocType] = useState<string | null>(null)
  const [files, setFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [currentStage, setCurrentStage] = useState<'select' | 'upload' | 'processing' | 'complete'>('select')
  const [password, setPassword] = useState('')
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([
    { id: 'upload', name: 'Document Upload', status: 'waiting' },
    { id: 'validation', name: 'Format Validation', status: 'waiting' },
    { id: 'extraction', name: 'Data Extraction', status: 'waiting' },
    { id: 'enrichment', name: 'Data Enrichment', status: 'waiting' },
    { id: 'analysis', name: 'Financial Analysis', status: 'waiting' }
  ])
  const [processingResults, setProcessingResults] = useState({
    success: false,
    documentId: '',
    summary: {
      accountName: '',
      totalTransactions: 0,
      totalCredits: 0,
      totalDebits: 0,
      period: '',
      anomalies: 0
    }
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDocTypeSelect = (docTypeId: string) => {
    setSelectedDocType(docTypeId)
    setCurrentStage('upload')
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files))
    }
  }

  const simulateFileUpload = () => {
    setUploadProgress(0)

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          startDocumentProcessing()
          return 100
        }
        return prev + 5
      })
    }, 100)
  }

  const updateProcessingStep = (stepId: string, status: 'waiting' | 'processing' | 'completed' | 'failed', message?: string) => {
    setProcessingSteps(steps =>
      steps.map(step =>
        step.id === stepId ? { ...step, status, message, progress: status === 'completed' ? 100 : step.progress } : step
      )
    )
  }

  const startDocumentProcessing = () => {
    setCurrentStage('processing')

    // Simulate document processing with realistic timing
    updateProcessingStep('upload', 'completed')

    // Validation step
    setTimeout(() => {
      updateProcessingStep('validation', 'processing')
      setTimeout(() => {
        updateProcessingStep('validation', 'completed')

        // Extraction step
        updateProcessingStep('extraction', 'processing')
        setTimeout(() => {
          if (Math.random() > 0.9) {
            // Occasionally simulate an extraction issue
            updateProcessingStep('extraction', 'failed', 'Unable to parse some data fields')
            // But continue anyway after a delay
            setTimeout(() => {
              updateProcessingStep('extraction', 'completed', 'Completed with some warnings')
              startEnrichmentStep()
            }, 2000)
          } else {
            updateProcessingStep('extraction', 'completed')
            startEnrichmentStep()
          }
        }, 3000)
      }, 1500)
    }, 1000)
  }

  const startEnrichmentStep = () => {
    updateProcessingStep('enrichment', 'processing')
    setTimeout(() => {
      updateProcessingStep('enrichment', 'completed')

      // Analysis step
      updateProcessingStep('analysis', 'processing')
      setTimeout(() => {
        updateProcessingStep('analysis', 'completed')

        // Set sample results
        setProcessingResults({
          success: true,
          documentId: 'doc_' + Math.random().toString(36).substr(2, 9),
          summary: {
            accountName: 'Business Operations Account',
            totalTransactions: 127,
            totalCredits: 45780.29,
            totalDebits: 32450.56,
            period: 'September 1 - 30, 2025',
            anomalies: 3
          }
        })

        setCurrentStage('complete')
      }, 2500)
    }, 2000)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    simulateFileUpload()
  }

  const renderDocumentTypeSelector = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Select Document Type</h2>
        <p className="text-gray-500">
          Choose the type of financial document you want to analyze
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documentTypes.map(docType => (
          <Card
            key={docType.id}
            onClick={() => handleDocTypeSelect(docType.id)}
            className={`p-4 cursor-pointer hover:shadow-md transition-all ${
              selectedDocType === docType.id ? 'ring-2 ring-blue-600' : ''
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="bg-gray-100 p-2 rounded-lg">
                {docType.icon}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{docType.name}</h3>
                <p className="text-xs text-gray-500">
                  Supports: {docType.formats.join(', ')}
                </p>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-600">{docType.description}</p>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderFileUploader = () => {
    const selectedType = documentTypes.find(dt => dt.id === selectedDocType)

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Upload Documents</h2>
            <p className="text-gray-500">
              {selectedType ? `Upload your ${selectedType.name.toLowerCase()}` : 'Upload your documents'}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setCurrentStage('select')}
          >
            Change Type
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="mb-4">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Drag and drop or click to upload
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                {selectedType?.formats.join(', ')} up to 20MB
              </p>

              <div className="mt-6">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept={selectedType?.formats.map(f =>
                    `.${f.toLowerCase()}`).join(',')}
                  multiple={selectedType?.id !== 'bank_statement_password'}
                />
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4"
                >
                  Select Files
                </Button>
              </div>
            </div>
          </Card>

          {selectedDocType === 'bank_statement_password' && (
            <Card className="p-4">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Document Password
              </Label>
              <div className="flex mt-1">
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="rounded-r-none"
                  placeholder="Enter document password"
                  required
                />
                <Button
                  type="button"
                  variant="secondary"
                  className="rounded-l-none"
                >
                  Auto-Detect
                </Button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                We will use this to decrypt your password-protected document
              </p>
            </Card>
          )}

          {files.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium text-sm text-gray-700">Selected Files</h3>
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-800">{file.name}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              className="px-8"
              disabled={files.length === 0 || (selectedDocType === 'bank_statement_password' && !password)}
            >
              Process Documents
            </Button>
          </div>
        </form>
      </div>
    )
  }

  const renderProcessing = () => (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Processing Documents</h2>
                  <p className="text-gray-500">
                    We&apos;re analyzing your financial documents with our AI-powered system
                  </p>      </div>

      <div className="space-y-6">
        {processingSteps.map((step, idx) => (
          <div key={step.id} className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                {step.status === 'waiting' && (
                  <div className="w-6 h-6 rounded-full border-2 border-gray-300 mr-3" />
                )}
                {step.status === 'processing' && (
                  <div className="w-6 h-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mr-3" />
                )}
                {step.status === 'completed' && (
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-3">
                    <Check2 className="w-4 h-4 text-green-600" />
                  </div>
                )}
                {step.status === 'failed' && (
                  <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center mr-3">
                    <X className="w-4 h-4 text-red-600" />
                  </div>
                )}
                <span className={`font-medium ${
                  step.status === 'completed' ? 'text-green-600' : 
                  step.status === 'failed' ? 'text-red-600' :
                  step.status === 'processing' ? 'text-blue-600' : 
                  'text-gray-500'
                }`}>
                  {step.name}
                </span>
              </div>
              {step.status === 'completed' && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  Complete
                </span>
              )}
              {step.status === 'failed' && (
                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                  Failed
                </span>
              )}
            </div>

            {step.status === 'processing' && (
              <Progress value={step.progress || 50} className="h-1" />
            )}

            {step.message && (
              <p className="text-xs ml-9 text-gray-500">{step.message}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )

  const renderComplete = () => (
    <div className="space-y-8">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
          <Check2 className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Processing Complete</h2>
          <p className="text-gray-500">
            Your document has been processed and is ready to view
          </p>
        </div>
      </div>

      <Card className="p-6 border border-green-200 bg-green-50">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Document ID</p>
              <p className="font-medium">{processingResults.documentId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Account</p>
              <p className="font-medium">{processingResults.summary.accountName}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Total Transactions</p>
              <p className="font-medium">{processingResults.summary.totalTransactions}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Credits</p>
              <p className="font-medium text-green-600">
                ${processingResults.summary.totalCredits.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Debits</p>
              <p className="font-medium text-red-600">
                ${processingResults.summary.totalDebits.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Period</p>
              <p className="font-medium">{processingResults.summary.period}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Anomalies Detected</p>
              <div className="flex items-center">
                <span className="font-medium">{processingResults.summary.anomalies}</span>
                {processingResults.summary.anomalies > 0 && (
                  <AlertTriangle className="w-4 h-4 text-amber-500 ml-1" />
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => {
            setCurrentStage('select')
            setFiles([])
            setPassword('')
            setProcessingSteps(processingSteps.map(step => ({ ...step, status: 'waiting', message: undefined })))
          }}
        >
          Process Another Document
        </Button>

        <div className="space-x-3">
          <Button variant="outline">
            Download Report
          </Button>
          <Button>
            View Full Analysis
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Document Processor</h1>
        <p className="text-gray-500">Upload and analyze your financial documents</p>
      </div>

      {currentStage === 'select' && renderDocumentTypeSelector()}
      {currentStage === 'upload' && renderFileUploader()}
      {currentStage === 'processing' && renderProcessing()}
      {currentStage === 'complete' && renderComplete()}
    </div>
  )
}
