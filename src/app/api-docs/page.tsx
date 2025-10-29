'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  ArrowRight,
  Book,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Code,
  Copy,
  ExternalLink,
  FileText,
  Key,
  Lock,
  PlayCircle,
  Server,
  Terminal,
  AlertTriangle
} from 'lucide-react'

// Custom Icon Components
const Webhook = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 16.98h-5.99c-1.1 0-1.95.94-1.95 1.95s.84 2.01 1.95 2.01H18c1.1 0 2-.9 2-2.01s-.9-1.95-2-1.95z" />
    <path d="M23 11.25l-3.5-1.75L23 7.75v3.5z" />
    <path d="M4 5.97H10C11.1 5.97 12 6.87 12 7.97S11.1 9.97 10 9.97H4C2.9 9.97 2 9.07 2 7.97S2.9 5.97 4 5.97z" />
    <path d="M1 12.75L4.5 14.5L1 16.25V12.75z" />
    <path d="M9.5 4L7.75 1H10.25L12 4H9.5z" />
    <path d="M14.5 20L16.25 23H13.75L12 20H14.5z" />
    <path d="M12 10C12 10 9 11 7.5 13.5" />
    <path d="M12 14C12 14 15 13 16.5 10.5" />
  </svg>
)

const CopyToClipboard = ({ text, children }: { text: string, children: React.ReactNode }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="relative text-left"
    >
      {children}
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {copied ? (
          <span className="flex items-center bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
            <Check className="h-3 w-3 mr-1" /> Copied
          </span>
        ) : (
          <span className="bg-gray-100 p-1 rounded-md text-gray-600 hover:text-gray-900 transition-colors">
            <Copy className="h-4 w-4" />
          </span>
        )}
      </div>
    </button>
  )
}

interface Endpoint {
  id: string
  name: string
  description: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  url: string
  category: string
  parameters?: {
    name: string
    type: string
    required: boolean
    description: string
  }[]
  requestBody?: {
    type: string
    properties: {
      name: string
      type: string
      required: boolean
      description: string
    }[]
  }
  responses: {
    status: number
    description: string
    example: any
  }[]
}

export default function ApiDocumentation() {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('curl')

  // Sample API documentation data
  const apiEndpoints: Endpoint[] = [
    {
      id: 'get-documents',
      name: 'List Documents',
      description: 'Retrieve a list of all documents',
      method: 'GET',
      url: '/api/v1/documents',
      category: 'Documents',
      parameters: [
        {
          name: 'limit',
          type: 'integer',
          required: false,
          description: 'Maximum number of documents to return (default: 20, max: 100)'
        },
        {
          name: 'offset',
          type: 'integer',
          required: false,
          description: 'Number of documents to skip (default: 0)'
        },
        {
          name: 'sort',
          type: 'string',
          required: false,
          description: 'Field to sort by (default: createdAt)'
        },
        {
          name: 'order',
          type: 'string',
          required: false,
          description: 'Sort order (asc or desc, default: desc)'
        }
      ],
      responses: [
        {
          status: 200,
          description: 'Success',
          example: {
            "data": [
              {
                "id": "doc_1234567890",
                "name": "Bank Statement - September 2025",
                "type": "bank_statement",
                "status": "processed",
                "createdAt": "2025-10-01T10:30:00Z",
                "updatedAt": "2025-10-01T10:35:12Z"
              },
              {
                "id": "doc_0987654321",
                "name": "Invoice #12345",
                "type": "invoice",
                "status": "processing",
                "createdAt": "2025-10-02T14:20:00Z",
                "updatedAt": "2025-10-02T14:20:00Z"
              }
            ],
            "meta": {
              "total": 42,
              "limit": 20,
              "offset": 0
            }
          }
        }
      ]
    },
    {
      id: 'get-document',
      name: 'Get Document',
      description: 'Retrieve a specific document by ID',
      method: 'GET',
      url: '/api/v1/documents/{id}',
      category: 'Documents',
      parameters: [
        {
          name: 'id',
          type: 'string',
          required: true,
          description: 'Document ID'
        },
        {
          name: 'include',
          type: 'string',
          required: false,
          description: 'Related resources to include (e.g., "analysis,transactions")'
        }
      ],
      responses: [
        {
          status: 200,
          description: 'Success',
          example: {
            "id": "doc_1234567890",
            "name": "Bank Statement - September 2025",
            "type": "bank_statement",
            "status": "processed",
            "createdAt": "2025-10-01T10:30:00Z",
            "updatedAt": "2025-10-01T10:35:12Z",
            "metadata": {
              "accountNumber": "XXXX1234",
              "bankName": "Example Bank",
              "period": {
                "start": "2025-09-01",
                "end": "2025-09-30"
              }
            },
            "analysis": {
              "totalCredits": 45780.29,
              "totalDebits": 32450.56,
              "openingBalance": 112345.67,
              "closingBalance": 124567.89
            }
          }
        },
        {
          status: 404,
          description: 'Document not found',
          example: {
            "error": {
              "code": "document_not_found",
              "message": "Document with ID 'doc_1234567890' not found"
            }
          }
        }
      ]
    },
    {
      id: 'create-document',
      name: 'Create Document',
      description: 'Upload and create a new document',
      method: 'POST',
      url: '/api/v1/documents',
      category: 'Documents',
      requestBody: {
        type: 'multipart/form-data',
        properties: [
          {
            name: 'file',
            type: 'file',
            required: true,
            description: 'The document file to upload'
          },
          {
            name: 'name',
            type: 'string',
            required: false,
            description: 'Document name (defaults to filename if not provided)'
          },
          {
            name: 'type',
            type: 'string',
            required: false,
            description: 'Document type (e.g., bank_statement, invoice, etc.)'
          },
          {
            name: 'password',
            type: 'string',
            required: false,
            description: 'Password for protected documents'
          }
        ]
      },
      responses: [
        {
          status: 201,
          description: 'Document created',
          example: {
            "id": "doc_1234567890",
            "name": "Bank Statement - September 2025",
            "type": "bank_statement",
            "status": "processing",
            "createdAt": "2025-10-13T15:30:00Z",
            "updatedAt": "2025-10-13T15:30:00Z"
          }
        },
        {
          status: 400,
          description: 'Invalid request',
          example: {
            "error": {
              "code": "invalid_request",
              "message": "The file must be a PDF, CSV, or XLSX document"
            }
          }
        }
      ]
    },
    {
      id: 'get-reports',
      name: 'List Reports',
      description: 'Retrieve a list of all generated reports',
      method: 'GET',
      url: '/api/v1/reports',
      category: 'Reports',
      parameters: [
        {
          name: 'limit',
          type: 'integer',
          required: false,
          description: 'Maximum number of reports to return (default: 20, max: 100)'
        },
        {
          name: 'offset',
          type: 'integer',
          required: false,
          description: 'Number of reports to skip (default: 0)'
        },
        {
          name: 'type',
          type: 'string',
          required: false,
          description: 'Filter by report type'
        }
      ],
      responses: [
        {
          status: 200,
          description: 'Success',
          example: {
            "data": [
              {
                "id": "rep_1234567890",
                "name": "Financial Report - Q3 2025",
                "type": "financial_summary",
                "createdAt": "2025-10-10T09:00:00Z"
              },
              {
                "id": "rep_0987654321",
                "name": "Cash Flow Analysis - September 2025",
                "type": "cash_flow",
                "createdAt": "2025-10-05T14:30:00Z"
              }
            ],
            "meta": {
              "total": 15,
              "limit": 20,
              "offset": 0
            }
          }
        }
      ]
    },
    {
      id: 'create-report',
      name: 'Generate Report',
      description: 'Create a new report from document data',
      method: 'POST',
      url: '/api/v1/reports',
      category: 'Reports',
      requestBody: {
        type: 'application/json',
        properties: [
          {
            name: 'name',
            type: 'string',
            required: true,
            description: 'Name of the report'
          },
          {
            name: 'type',
            type: 'string',
            required: true,
            description: 'Type of report to generate'
          },
          {
            name: 'documentIds',
            type: 'array',
            required: true,
            description: 'Array of document IDs to include in the report'
          },
          {
            name: 'parameters',
            type: 'object',
            required: false,
            description: 'Additional parameters for report generation'
          }
        ]
      },
      responses: [
        {
          status: 202,
          description: 'Report generation accepted',
          example: {
            "id": "rep_1234567890",
            "name": "Financial Report - Q3 2025",
            "type": "financial_summary",
            "status": "processing",
            "createdAt": "2025-10-13T15:45:00Z"
          }
        }
      ]
    },
    {
      id: 'create-webhook',
      name: 'Create Webhook',
      description: 'Register a new webhook endpoint',
      method: 'POST',
      url: '/api/v1/webhooks',
      category: 'Webhooks',
      requestBody: {
        type: 'application/json',
        properties: [
          {
            name: 'url',
            type: 'string',
            required: true,
            description: 'The URL to send webhook events to'
          },
          {
            name: 'events',
            type: 'array',
            required: true,
            description: 'Array of event types to subscribe to'
          },
          {
            name: 'description',
            type: 'string',
            required: false,
            description: 'Description of this webhook'
          },
          {
            name: 'secret',
            type: 'string',
            required: false,
            description: 'Secret used to sign webhook payloads'
          }
        ]
      },
      responses: [
        {
          status: 201,
          description: 'Webhook created',
          example: {
            "id": "wh_1234567890",
            "url": "https://example.com/webhooks/finscore",
            "events": ["document.processed", "report.completed"],
            "description": "Production webhook",
            "createdAt": "2025-10-13T16:00:00Z"
          }
        }
      ]
    }
  ]

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-blue-100 text-blue-800'
      case 'POST':
        return 'bg-green-100 text-green-800'
      case 'PUT':
        return 'bg-amber-100 text-amber-800'
      case 'DELETE':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredEndpoints = searchQuery
    ? apiEndpoints.filter(endpoint =>
        endpoint.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        endpoint.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        endpoint.url.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : apiEndpoints

  const endpointsByCategory = filteredEndpoints.reduce((acc, endpoint) => {
    if (!acc[endpoint.category]) {
      acc[endpoint.category] = []
    }
    acc[endpoint.category].push(endpoint)
    return acc
  }, {} as Record<string, Endpoint[]>)

  const selectedEndpointData = selectedEndpoint
    ? apiEndpoints.find(e => e.id === selectedEndpoint)
    : null

  const getCodeSnippet = (endpoint: Endpoint) => {
    const { method, url } = endpoint
    const baseUrl = 'https://api.finscore.com'
    const fullUrl = `${baseUrl}${url}`

    switch (selectedLanguage) {
      case 'curl':
        return `curl -X ${method} "${fullUrl}" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"${
    endpoint.requestBody && method !== 'GET' 
      ? ` \\
  -d '{
    // Request body JSON
  }'` 
      : ''
  }`
      case 'javascript':
        return `import axios from 'axios';

const response = await axios({
  method: '${method.toLowerCase()}',
  url: '${fullUrl}',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }${
    endpoint.requestBody && method !== 'GET'
      ? `,
  data: {
    // Request body JSON
  }`
      : ''
  }
});

console.log(response.data);`
      case 'python':
        return `import requests

url = "${fullUrl}"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
${endpoint.requestBody && method !== 'GET'
  ? `payload = {
    # Request body JSON
}

response = requests.${method.toLowerCase()}(url, json=payload, headers=headers)`
  : `response = requests.${method.toLowerCase()}(url, headers=headers)`}

print(response.json())`
      case 'go':
        return `package main

import (
	"fmt"
	"net/http"
	"io/ioutil"
	${endpoint.requestBody && method !== 'GET' ? `"bytes"
	"encoding/json"` : ''}
)

func main() {
	url := "${fullUrl}"
	${endpoint.requestBody && method !== 'GET' ? `data := map[string]interface{}{
		// Request body JSON
	}
	jsonData, _ := json.Marshal(data)` : ''}

	req, _ := http.NewRequest("${method}", url, ${endpoint.requestBody && method !== 'GET' ? 'bytes.NewBuffer(jsonData)' : 'nil'})
	req.Header.Set("Authorization", "Bearer YOUR_API_KEY")
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	body, _ := ioutil.ReadAll(resp.Body)
	fmt.Println(string(body))
}`
      default:
        return ''
    }
  }

  const renderOverviewTab = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
        <Card className="p-6">
          <p className="text-gray-600">
            Welcome to the FinScore Analyzer API documentation. Our API provides programmatic access to the same features available in our web interface. With the FinScore API, you can upload documents, process financial data, generate reports, and automate workflows.
          </p>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Base URL</h3>
              <div className="bg-gray-50 p-3 rounded-md font-mono text-sm">
                https://api.finscore.com
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">API Version</h3>
              <div className="bg-gray-50 p-3 rounded-md font-mono text-sm">
                Current: v1 (2025-10-01)
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication</h2>
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="h-5 w-5 text-gray-500" />
            <h3 className="font-medium text-lg">API Keys</h3>
          </div>
          <p className="text-gray-600 mb-4">
            All API requests must include your API key in an <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">Authorization</code> header:
          </p>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-md font-mono text-sm overflow-x-auto mb-4">
            <span className="text-gray-400">Authorization:</span> Bearer YOUR_API_KEY
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <Button variant="outline" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              <span>Manage API Keys</span>
            </Button>
            <span className="text-sm text-gray-500">
              You can manage your API keys in your account settings.
            </span>
          </div>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Rate Limits</h2>
        <Card className="p-6">
          <p className="text-gray-600 mb-4">
            API rate limits vary by plan level:
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate Limit</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Document Processing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3 text-sm font-medium">Standard</td>
                  <td className="px-4 py-3 text-sm">60 requests/minute</td>
                  <td className="px-4 py-3 text-sm">100 documents/day</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm font-medium">Business</td>
                  <td className="px-4 py-3 text-sm">300 requests/minute</td>
                  <td className="px-4 py-3 text-sm">500 documents/day</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm font-medium">Enterprise</td>
                  <td className="px-4 py-3 text-sm">1000 requests/minute</td>
                  <td className="px-4 py-3 text-sm">Unlimited</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Handling</h2>
        <Card className="p-6">
          <p className="text-gray-600 mb-4">
            The API uses conventional HTTP response codes to indicate success or failure of requests.
            Codes in the 2xx range indicate success, codes in the 4xx range indicate an error with the
            provided information, and codes in the 5xx range indicate an error with our servers.
          </p>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-md font-mono text-sm overflow-x-auto">
            <pre>{`{
  "error": {
    "code": "invalid_request",
    "message": "The file must be a PDF, CSV, or XLSX document",
    "details": {
      "field": "file",
      "reason": "invalid_file_type"
    }
  }
}`}</pre>
          </div>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">SDKs & Libraries</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Code className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-medium">JavaScript SDK</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Official JavaScript/TypeScript library for Node.js and browser environments.
            </p>
            <div className="bg-gray-50 p-3 rounded-md font-mono text-xs mb-4">
              npm install @finscore/javascript
            </div>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Book className="h-4 w-4" />
              <span>View Documentation</span>
            </Button>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Code className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-medium">Python SDK</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Official Python library for integration with Python applications.
            </p>
            <div className="bg-gray-50 p-3 rounded-md font-mono text-xs mb-4">
              pip install finscore-python
            </div>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Book className="h-4 w-4" />
              <span>View Documentation</span>
            </Button>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Code className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-medium">Go SDK</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Official Go library for integration with Go applications.
            </p>
            <div className="bg-gray-50 p-3 rounded-md font-mono text-xs mb-4">
              go get github.com/finscore/go-sdk
            </div>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Book className="h-4 w-4" />
              <span>View Documentation</span>
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )

  const renderReferenceTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <div className="sticky top-6">
          <Input
            type="text"
            placeholder="Search endpoints..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4"
          />

          <div className="space-y-4">
            {Object.entries(endpointsByCategory).map(([category, endpoints]) => (
              <div key={category}>
                <h3 className="font-medium text-gray-900 mb-2">{category}</h3>
                <div className="space-y-1">
                  {endpoints.map(endpoint => (
                    <button
                      key={endpoint.id}
                      onClick={() => setSelectedEndpoint(endpoint.id)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                        selectedEndpoint === endpoint.id 
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getMethodColor(endpoint.method)}`}>
                          {endpoint.method}
                        </span>
                        <span>{endpoint.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:col-span-3">
        {selectedEndpointData ? (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getMethodColor(selectedEndpointData.method)}`}>
                    {selectedEndpointData.method}
                  </span>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedEndpointData.name}</h2>
                </div>
                <p className="text-gray-600 mt-1">{selectedEndpointData.description}</p>
              </div>

              <Button variant="outline" className="flex items-center gap-2">
                <PlayCircle className="h-4 w-4" />
                <span>Try It</span>
              </Button>
            </div>

            <Card>
              <div className="flex items-center border-b border-gray-200">
                <div className={`px-4 py-3 font-mono text-sm ${getMethodColor(selectedEndpointData.method)}`}>
                  {selectedEndpointData.method}
                </div>
                <div className="px-4 py-3 font-mono text-sm flex-1 overflow-x-auto">
                  {selectedEndpointData.url}
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-600">
                  {selectedEndpointData.description}
                </p>
              </div>
            </Card>

            <div className="space-y-6">
              {selectedEndpointData.parameters && selectedEndpointData.parameters.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Parameters</h3>
                  <Card>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Required</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {selectedEndpointData.parameters.map(param => (
                            <tr key={param.name}>
                              <td className="px-6 py-4 text-sm font-mono">{param.name}</td>
                              <td className="px-6 py-4 text-sm">{param.type}</td>
                              <td className="px-6 py-4 text-sm">
                                {param.required ? (
                                  <span className="text-red-600">Yes</span>
                                ) : (
                                  <span className="text-gray-500">No</span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-sm">{param.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
              )}

              {selectedEndpointData.requestBody && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Request Body</h3>
                  <Card>
                    <div className="p-4 border-b border-gray-200">
                      <p className="text-sm">
                        <span className="font-medium">Content-Type: </span>
                        <span className="font-mono">{selectedEndpointData.requestBody.type}</span>
                      </p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Required</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {selectedEndpointData.requestBody.properties.map(prop => (
                            <tr key={prop.name}>
                              <td className="px-6 py-4 text-sm font-mono">{prop.name}</td>
                              <td className="px-6 py-4 text-sm">{prop.type}</td>
                              <td className="px-6 py-4 text-sm">
                                {prop.required ? (
                                  <span className="text-red-600">Yes</span>
                                ) : (
                                  <span className="text-gray-500">No</span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-sm">{prop.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
              )}

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Responses</h3>
                <div className="space-y-4">
                  {selectedEndpointData.responses.map((response, idx) => (
                    <Card key={idx}>
                      <div className="flex items-center border-b border-gray-200 p-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          response.status >= 200 && response.status < 300
                            ? 'bg-green-100 text-green-800'
                            : response.status >= 400 && response.status < 500
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {response.status}
                        </span>
                        <span className="ml-3 text-sm text-gray-600">
                          {response.description}
                        </span>
                      </div>
                      <div className="p-4">
                        <div className="bg-gray-900 text-gray-100 p-4 rounded-md font-mono text-sm overflow-x-auto">
                          <pre>{JSON.stringify(response.example, null, 2)}</pre>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Code Examples</h3>
                <Card>
                  <div className="border-b border-gray-200">
                    <div className="flex">
                      <button
                        onClick={() => setSelectedLanguage('curl')}
                        className={`px-4 py-3 text-sm font-medium ${
                          selectedLanguage === 'curl'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-600'
                        }`}
                      >
                        cURL
                      </button>
                      <button
                        onClick={() => setSelectedLanguage('javascript')}
                        className={`px-4 py-3 text-sm font-medium ${
                          selectedLanguage === 'javascript'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-600'
                        }`}
                      >
                        JavaScript
                      </button>
                      <button
                        onClick={() => setSelectedLanguage('python')}
                        className={`px-4 py-3 text-sm font-medium ${
                          selectedLanguage === 'python'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-600'
                        }`}
                      >
                        Python
                      </button>
                      <button
                        onClick={() => setSelectedLanguage('go')}
                        className={`px-4 py-3 text-sm font-medium ${
                          selectedLanguage === 'go'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-600'
                        }`}
                      >
                        Go
                      </button>
                    </div>
                  </div>
                  <CopyToClipboard text={getCodeSnippet(selectedEndpointData)}>
                    <div className="group relative">
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-md font-mono text-sm overflow-x-auto">
                        <pre>{getCodeSnippet(selectedEndpointData)}</pre>
                      </div>
                    </div>
                  </CopyToClipboard>
                </Card>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Server className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Select an endpoint</h3>
            <p className="text-gray-500 max-w-md">
              Choose an API endpoint from the list to see detailed documentation, parameters, and code examples.
            </p>
          </div>
        )}
      </div>
    </div>
  )

  const renderWebhooksTab = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Webhooks</h2>
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Webhook className="h-5 w-5 text-gray-500" />
            <h3 className="font-medium text-lg">Overview</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Webhooks allow you to receive real-time notifications when specific events occur in your FinScore account. Instead of polling the API for changes, webhooks will send HTTP POST requests to your specified endpoint whenever an event happens.
          </p>
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <div className="flex items-start gap-2">
              <div className="p-1 bg-blue-100 rounded-full mt-0.5">
                <Check className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Implementation Checklist</p>
                <ul className="mt-2 text-sm text-gray-600 space-y-2">
                  <li className="flex items-center gap-2">
                    <span>1.</span>
                    <span>Create a publicly accessible HTTPS endpoint on your server</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span>2.</span>
                    <span>Register the webhook URL in your FinScore dashboard or via API</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span>3.</span>
                    <span>Verify webhook signatures to ensure authenticity</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span>4.</span>
                    <span>Respond with a 200 status code to acknowledge receipt</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Events</h2>
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payload Example</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 text-sm font-mono">document.created</td>
                  <td className="px-6 py-4 text-sm">Fired when a new document is uploaded</td>
                  <td className="px-6 py-4 text-sm">
                    <Button variant="ghost" size="sm" className="text-blue-600">
                      View Example
                    </Button>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-mono">document.processed</td>
                  <td className="px-6 py-4 text-sm">Fired when document processing completes</td>
                  <td className="px-6 py-4 text-sm">
                    <Button variant="ghost" size="sm" className="text-blue-600">
                      View Example
                    </Button>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-mono">document.failed</td>
                  <td className="px-6 py-4 text-sm">Fired when document processing fails</td>
                  <td className="px-6 py-4 text-sm">
                    <Button variant="ghost" size="sm" className="text-blue-600">
                      View Example
                    </Button>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-mono">report.created</td>
                  <td className="px-6 py-4 text-sm">Fired when a report generation is requested</td>
                  <td className="px-6 py-4 text-sm">
                    <Button variant="ghost" size="sm" className="text-blue-600">
                      View Example
                    </Button>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-mono">report.completed</td>
                  <td className="px-6 py-4 text-sm">Fired when a report is generated successfully</td>
                  <td className="px-6 py-4 text-sm">
                    <Button variant="ghost" size="sm" className="text-blue-600">
                      View Example
                    </Button>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-mono">anomaly.detected</td>
                  <td className="px-6 py-4 text-sm">Fired when an anomaly is detected in financial data</td>
                  <td className="px-6 py-4 text-sm">
                    <Button variant="ghost" size="sm" className="text-blue-600">
                      View Example
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Securing Webhooks</h2>
        <Card className="p-6">
          <div className="space-y-4">
            <p className="text-gray-600">
              To verify that webhook requests are coming from FinScore, we include a signature in the
              <code className="bg-gray-100 px-1 py-0.5 rounded font-mono mx-1">X-FinScore-Signature</code>
              header of every webhook request. This signature is a HMAC SHA-256 hash of the request body, using your webhook secret as the key.
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-800 text-sm">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-medium">Important</p>
                  <p className="mt-1">
                    Keep your webhook secret secure and never expose it in client-side code. Verify signatures on your server to ensure webhook authenticity.
                  </p>
                </div>
              </div>
            </div>

            <h3 className="font-medium text-gray-900">Verification Example (Node.js)</h3>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-md font-mono text-sm overflow-x-auto">
              <pre>{`const crypto = require('crypto');

// Express middleware to verify webhook signature
function verifyWebhookSignature(req, res, next) {
  const signature = req.headers['x-finscore-signature'];
  const webhookSecret = 'YOUR_WEBHOOK_SECRET';
  
  // Create HMAC using the secret
  const hmac = crypto.createHmac('sha256', webhookSecret);
  const digest = hmac.update(JSON.stringify(req.body)).digest('hex');
  
  // Compare our digest with the one from FinScore
  if (signature === digest) {
    next();
  } else {
    res.status(401).send('Invalid signature');
  }
}`}</pre>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )

  const renderGuideTab = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Integration Guides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-medium">Document Processing</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Learn how to upload documents and retrieve processed data.
            </p>
            <Button variant="outline" size="sm" className="flex items-center gap-2 w-full">
              <ArrowRight className="h-4 w-4" />
              <span>Read Guide</span>
            </Button>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="font-medium">Report Generation</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Create custom financial reports from your data.
            </p>
            <Button variant="outline" size="sm" className="flex items-center gap-2 w-full">
              <ArrowRight className="h-4 w-4" />
              <span>Read Guide</span>
            </Button>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="font-medium">Workflow Automation</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Automate financial processes with the Workflow API.
            </p>
            <Button variant="outline" size="sm" className="flex items-center gap-2 w-full">
              <ArrowRight className="h-4 w-4" />
              <span>Read Guide</span>
            </Button>
          </Card>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Tutorials</h2>
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Terminal className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium">Building a Document Processing Pipeline</h3>
                <p className="text-sm text-gray-600 mt-1 mb-4">
                  Learn how to build an automated pipeline for processing financial documents and extracting insights.
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  <span className="mr-6">15 minutes</span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                    Intermediate
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Terminal className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium">Creating a Custom Dashboard</h3>
                <p className="text-sm text-gray-600 mt-1 mb-4">
                  Build a custom financial dashboard using our API and visualization libraries.
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  <span className="mr-6">30 minutes</span>
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-xs">
                    Advanced
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Terminal className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium">Setting Up Webhook Notifications</h3>
                <p className="text-sm text-gray-600 mt-1 mb-4">
                  Learn how to receive and process real-time notifications from FinScore.
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  <span className="mr-6">10 minutes</span>
                  <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs">
                    Beginner
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Sample Applications</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Code className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-medium">Financial Statement Analyzer</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                  React
                </span>
                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                  Node.js
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              A sample application that demonstrates document uploading, processing, and visualization of financial data.
            </p>
            <Button variant="outline" size="sm" className="flex items-center gap-2 w-full">
              <ExternalLink className="h-4 w-4" />
              <span>View on GitHub</span>
            </Button>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Code className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="font-medium">Expense Tracker Integration</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-800 rounded">
                  Python
                </span>
                <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-800 rounded">
                  Flask
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              A sample expense tracking application that uses the FinScore API to categorize and analyze expenses.
            </p>
            <Button variant="outline" size="sm" className="flex items-center gap-2 w-full">
              <ExternalLink className="h-4 w-4" />
              <span>View on GitHub</span>
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              API Documentation
            </h1>
            <p className="text-gray-500 mt-1">
              Integrate FinScore Analyzer into your applications
            </p>
          </div>
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <Button variant="outline" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              <span>Get API Keys</span>
            </Button>
            <Button className="flex items-center gap-2">
              <Book className="h-4 w-4" />
              <span>View SDKs</span>
            </Button>
          </div>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-8 w-full md:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reference">API Reference</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="guides">Guides</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0">
          {renderOverviewTab()}
        </TabsContent>

        <TabsContent value="reference" className="mt-0">
          {renderReferenceTab()}
        </TabsContent>

        <TabsContent value="webhooks" className="mt-0">
          {renderWebhooksTab()}
        </TabsContent>

        <TabsContent value="guides" className="mt-0">
          {renderGuideTab()}
        </TabsContent>
      </Tabs>
    </div>
  )
}
