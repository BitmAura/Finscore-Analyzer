'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowRight,
  Book,
  Building,
  ChevronRight,
  Code,
  ExternalLink,
  FileText,
  Filter,
  LayoutGrid,
  MessageCircle,
  Search,
  Settings,
  ShoppingCart,
  Users,
  Zap
} from 'lucide-react'

interface Integration {
  id: string
  name: string
  description: string
  category: 'CRM' | 'Communication' | 'Accounting' | 'Project Management' | 'Data Warehouse' | 'Marketing'
  logo: string // URL or path to logo
  developer: string
  website: string
  documentation: string
  connected: boolean
  setupGuide: string[]
}

const integrationData: Integration[] = [
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'Sync financial data with customer records for a complete 360-degree view.',
    category: 'CRM',
    logo: '/logos/salesforce.svg',
    developer: 'Salesforce',
    website: 'https://salesforce.com',
    documentation: 'https://developer.salesforce.com',
    connected: true,
    setupGuide: [
      'Authenticate with your Salesforce account.',
      'Grant FinScore Analyzer access to required objects (Account, Opportunity).',
      'Configure field mappings between FinScore data and Salesforce fields.',
      'Set up sync frequency and direction (one-way or two-way).'
    ]
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Enrich your CRM data with financial insights to better score leads and manage deals.',
    category: 'CRM',
    logo: '/logos/hubspot.svg',
    developer: 'HubSpot',
    website: 'https://hubspot.com',
    documentation: 'https://developers.hubspot.com',
    connected: false,
    setupGuide: [
      'Authenticate with your HubSpot account.',
      'Select the data to sync (Companies, Deals).',
      'Map FinScore analytics to custom properties in HubSpot.',
      'Enable automatic data refresh.'
    ]
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Receive real-time notifications for financial anomalies and reports in your Slack channels.',
    category: 'Communication',
    logo: '/logos/slack.svg',
    developer: 'Slack',
    website: 'https://slack.com',
    documentation: 'https://api.slack.com',
    connected: true,
    setupGuide: [
      'Connect your Slack workspace.',
      'Choose the channel for notifications.',
      'Select which events should trigger a Slack message (e.g., large transaction, low balance).',
      'Customize notification templates.'
    ]
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks Online',
    description: 'Seamlessly sync transaction data and financial reports with your accounting software.',
    category: 'Accounting',
    logo: '/logos/quickbooks.svg',
    developer: 'Intuit',
    website: 'https://quickbooks.intuit.com',
    documentation: 'https://developer.intuit.com',
    connected: true,
    setupGuide: [
      'Connect your QuickBooks Online account.',
      'Map bank accounts between FinScore and QuickBooks.',
      'Configure automatic transaction syncing.',
      'Set rules for categorizing expenses.'
    ]
  },
  {
    id: 'xero',
    name: 'Xero',
    description: 'Automate your bookkeeping by syncing financial data directly into your Xero organization.',
    category: 'Accounting',
    logo: '/logos/xero.svg',
    developer: 'Xero',
    website: 'https://xero.com',
    documentation: 'https://developer.xero.com',
    connected: false,
    setupGuide: [
      'Authorize FinScore Analyzer to access your Xero organization.',
      'Map accounts and tax rates.',
      'Enable automatic bank feed synchronization.',
      'Review and approve synced transactions.'
    ]
  },
  {
    id: 'snowflake',
    name: 'Snowflake',
    description: 'Export enriched financial data to your Snowflake data warehouse for advanced analytics.',
    category: 'Data Warehouse',
    logo: '/logos/snowflake.svg',
    developer: 'Snowflake',
    website: 'https://snowflake.com',
    documentation: 'https://docs.snowflake.com',
    connected: false,
    setupGuide: [
      'Provide your Snowflake account details (account identifier, warehouse, database, schema).',
      'Create a dedicated user and role with appropriate permissions.',
      'Configure the data export schedule.',
      'Select the datasets to be exported.'
    ]
  },
  {
    id: 'jira',
    name: 'Jira',
    description: 'Create Jira issues automatically for financial anomalies that require investigation.',
    category: 'Project Management',
    logo: '/logos/jira.svg',
    developer: 'Atlassian',
    website: 'https://www.atlassian.com/software/jira',
    documentation: 'https://developer.atlassian.com/server/jira/platform/rest-apis/',
    connected: false,
    setupGuide: [
      'Connect your Jira Cloud instance.',
      'Select the project and issue type for created tasks.',
      'Map anomaly details to Jira fields (summary, description, priority).',
      'Configure the trigger conditions for issue creation.'
    ]
  },
  {
    id: 'google-sheets',
    name: 'Google Sheets',
    description: 'Export financial reports and raw data directly to Google Sheets for custom analysis.',
    category: 'Data Warehouse',
    logo: '/logos/google-sheets.svg',
    developer: 'Google',
    website: 'https://www.google.com/sheets/about/',
    documentation: 'https://developers.google.com/sheets/api',
    connected: true,
    setupGuide: [
      'Authenticate with your Google account.',
      'Grant permission to create and edit spreadsheets.',
      'Select a destination folder in Google Drive.',
      'Choose to export as a new sheet or update an existing one.'
    ]
  }
]

const categories = [
  { id: 'all', name: 'All', icon: <LayoutGrid className="h-4 w-4" /> },
  { id: 'CRM', name: 'CRM', icon: <Users className="h-4 w-4" /> },
  { id: 'Communication', name: 'Communication', icon: <MessageCircle className="h-4 w-4" /> },
  { id: 'Accounting', name: 'Accounting', icon: <FileText className="h-4 w-4" /> },
  { id: 'Project Management', name: 'Project Management', icon: <Building className="h-4 w-4" /> },
  { id: 'Data Warehouse', name: 'Data Warehouse', icon: <Code className="h-4 w-4" /> },
  { id: 'Marketing', name: 'Marketing', icon: <ShoppingCart className="h-4 w-4" /> },
]

export default function IntegrationMarketplace() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)

  const filteredIntegrations = integrationData.filter(integration => {
    const matchesCategory = activeCategory === 'all' || integration.category === activeCategory
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          integration.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  if (selectedIntegration) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Button variant="outline" onClick={() => setSelectedIntegration(null)} className="mb-6 flex items-center gap-2">
          <ArrowRight className="h-4 w-4 rotate-180" />
          <span>Back to Marketplace</span>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center gap-6">
              <img src={selectedIntegration.logo} alt={`${selectedIntegration.name} logo`} className="w-20 h-20 rounded-lg shadow-md" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{selectedIntegration.name}</h1>
                <p className="text-gray-600 mt-1">{selectedIntegration.description}</p>
              </div>
            </div>

            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Setup Guide</h2>
              <div className="space-y-4">
                {selectedIntegration.setupGuide.map((step, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </div>
                    <p className="text-gray-700">{step}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Resources</h2>
              <div className="space-y-3">
                <a href={selectedIntegration.website} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <ExternalLink className="h-4 w-4 text-gray-500" />
                    <span className="font-medium text-gray-800">Developer Website</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </a>
                <a href={selectedIntegration.documentation} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <Book className="h-4 w-4 text-gray-500" />
                    <span className="font-medium text-gray-800">API Documentation</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </a>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              {selectedIntegration.connected ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-4">
                    <Zap className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Connected</h3>
                  <p className="text-sm text-gray-600 mt-1 mb-4">This integration is active.</p>
                  <Button variant="outline" className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Integration
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto flex items-center justify-center mb-4">
                    <Zap className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Connect Integration</h3>
                  <p className="text-sm text-gray-600 mt-1 mb-4">Enable this integration to start syncing data.</p>
                  <Button className="w-full">
                    <Zap className="h-4 w-4 mr-2" />
                    Connect Now
                  </Button>
                </div>
              )}
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Developer</span>
                  <span className="font-medium text-gray-800">{selectedIntegration.developer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Category</span>
                  <span className="font-medium text-gray-800">{selectedIntegration.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Permissions</span>
                  <span className="font-medium text-blue-600 cursor-pointer">View required</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900">Integration Marketplace</h1>
        <p className="text-lg text-gray-600 mt-2 max-w-2xl mx-auto">
          Connect FinScore Analyzer with your favorite tools to automate workflows and sync data.
        </p>
      </header>

      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative w-full md:flex-1">
            <Input
              type="text"
              placeholder="Search integrations..."
              className="pr-10 h-12 text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute right-4 top-3.5 h-6 w-6 text-gray-400" />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span>My Integrations</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map(category => (
          <Button
            key={category.id}
            variant={activeCategory === category.id ? 'default' : 'outline'}
            onClick={() => setActiveCategory(category.id)}
            className="flex items-center gap-2"
          >
            {category.icon}
            <span>{category.name}</span>
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredIntegrations.map(integration => (
          <Card
            key={integration.id}
            className="p-6 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer"
            onClick={() => setSelectedIntegration(integration)}
          >
            <div className="flex items-center justify-between mb-4">
              <img src={integration.logo} alt={`${integration.name} logo`} className="w-12 h-12 rounded-lg" />
              {integration.connected && (
                <span className="flex items-center text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  <Zap className="h-3 w-3 mr-1" />
                  Connected
                </span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{integration.name}</h3>
            <p className="text-sm text-gray-600 mt-1 h-20 line-clamp-4">{integration.description}</p>
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
              <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                {integration.category}
              </span>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </Card>
        ))}
      </div>

      {filteredIntegrations.length === 0 && (
        <div className="text-center py-16">
          <h3 className="text-xl font-medium text-gray-900">No integrations found</h3>
          <p className="text-gray-500 mt-2">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}
    </div>
  )
}
