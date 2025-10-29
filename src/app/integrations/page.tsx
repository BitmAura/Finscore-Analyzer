'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { AlertCircle, ArrowRight, Landmark, CheckCircle2, Download, FileText, Lock, RefreshCcw, ShieldCheck } from 'lucide-react'

interface ConnectorProps {
  name: string
  icon: React.ReactNode
  description: string
  connected: boolean
  lastSync?: string
  status: 'active' | 'pending' | 'error' | 'disconnected'
}

export default function DataIntegration() {
  const [activeTab, setActiveTab] = useState('banking')
  const [isConnecting, setIsConnecting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const bankingConnectors: ConnectorProps[] = [
    {
      name: 'HDFC Bank',
      icon: <Landmark className="h-6 w-6 text-blue-600" />,
      description: 'Connect accounts, statements, and transaction data',
      connected: true,
      lastSync: '13 Oct 2025, 09:30 AM',
      status: 'active'
    },
    {
      name: 'ICICI Bank',
      icon: <Landmark className="h-6 w-6 text-orange-600" />,
      description: 'Connect accounts, statements, and transaction data',
      connected: true,
      lastSync: '12 Oct 2025, 11:45 PM',
      status: 'active'
    },
    {
      name: 'SBI Bank',
      icon: <Landmark className="h-6 w-6 text-blue-800" />,
      description: 'Connect accounts, statements, and transaction data',
      connected: false,
      status: 'disconnected'
    },
    {
      name: 'Axis Bank',
      icon: <Landmark className="h-6 w-6 text-purple-600" />,
      description: 'Connect accounts, statements, and transaction data',
      connected: true,
      lastSync: '10 Oct 2025, 03:15 PM',
      status: 'error'
    },
    {
      name: 'Kotak Mahindra',
      icon: <Landmark className="h-6 w-6 text-red-600" />,
      description: 'Connect accounts, statements, and transaction data',
      connected: false,
      status: 'disconnected'
    }
  ]

  const accountingConnectors: ConnectorProps[] = [
    {
      name: 'QuickBooks',
      icon: <FileText className="h-6 w-6 text-blue-600" />,
      description: 'Sync accounting data, invoices, and expenses',
      connected: true,
      lastSync: '13 Oct 2025, 10:15 AM',
      status: 'active'
    },
    {
      name: 'Xero',
      icon: <FileText className="h-6 w-6 text-teal-600" />,
      description: 'Sync accounting data, invoices, and expenses',
      connected: false,
      status: 'disconnected'
    },
    {
      name: 'Tally',
      icon: <FileText className="h-6 w-6 text-purple-600" />,
      description: 'Sync accounting data, invoices, and expenses',
      connected: true,
      lastSync: '11 Oct 2025, 09:30 AM',
      status: 'pending'
    }
  ]

  const taxConnectors: ConnectorProps[] = [
    {
      name: 'GST Portal',
      icon: <FileText className="h-6 w-6 text-green-600" />,
      description: 'Import GST returns and filing data',
      connected: true,
      lastSync: '05 Oct 2025, 11:20 AM',
      status: 'active'
    },
    {
      name: 'Income Tax Portal',
      icon: <FileText className="h-6 w-6 text-amber-600" />,
      description: 'Import income tax returns and assessment data',
      connected: false,
      status: 'disconnected'
    }
  ]

  const filteredConnectors = () => {
    let connectors: ConnectorProps[] = []

    switch(activeTab) {
      case 'banking':
        connectors = bankingConnectors
        break
      case 'accounting':
        connectors = accountingConnectors
        break
      case 'tax':
        connectors = taxConnectors
        break
      default:
        connectors = [...bankingConnectors, ...accountingConnectors, ...taxConnectors]
    }

    if (!searchQuery) return connectors

    return connectors.filter(c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  const getStatusIndicator = (status: string) => {
    switch(status) {
      case 'active':
        return <div className="w-2 h-2 rounded-full bg-green-500" />
      case 'pending':
        return <div className="w-2 h-2 rounded-full bg-amber-500" />
      case 'error':
        return <div className="w-2 h-2 rounded-full bg-red-500" />
      default:
        return <div className="w-2 h-2 rounded-full bg-gray-300" />
    }
  }

  const simulateConnection = () => {
    setIsConnecting(true)
    // Simulate connection delay
    setTimeout(() => {
      setIsConnecting(false)
    }, 2000)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Data Integrations</h1>
        <p className="text-gray-500">
          Connect your financial data sources for automated analysis
        </p>
      </header>

      <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Input
            type="text"
            placeholder="Search integrations..."
            className="pr-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg
            className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span>Export Connections</span>
          </Button>
          <Button className="flex items-center gap-2">
            <RefreshCcw className="h-4 w-4" />
            <span>Sync All Active</span>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-8 w-full md:w-auto">
          <TabsTrigger value="banking">Banking</TabsTrigger>
          <TabsTrigger value="accounting">Accounting</TabsTrigger>
          <TabsTrigger value="tax">Tax Portals</TabsTrigger>
        </TabsList>

        <Card className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                {activeTab === 'banking' && 'Banking Integrations'}
                {activeTab === 'accounting' && 'Accounting Software'}
                {activeTab === 'tax' && 'Tax Portal Connections'}
              </h2>
              <p className="text-sm text-gray-500">
                {activeTab === 'banking' && 'Connect your bank accounts for automatic transaction import'}
                {activeTab === 'accounting' && 'Sync your accounting software data'}
                {activeTab === 'tax' && 'Import data from government tax portals'}
              </p>
            </div>
            <div className="hidden md:block">
              <Button size="sm" variant="outline" className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                <span>All Connections Use Bank-Level Encryption</span>
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {filteredConnectors().map((connector, idx) => (
              <div
                key={`${connector.name}-${idx}`}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 p-2 rounded-lg">
                      {connector.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">{connector.name}</h3>
                        <div className="flex items-center gap-1">
                          {getStatusIndicator(connector.status)}
                          <span className="text-xs text-gray-500">
                            {connector.status === 'active' && 'Connected'}
                            {connector.status === 'pending' && 'Syncing...'}
                            {connector.status === 'error' && 'Error'}
                            {connector.status === 'disconnected' && 'Disconnected'}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500">{connector.description}</p>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                    {connector.connected && connector.lastSync && (
                      <div className="text-xs text-gray-500 whitespace-nowrap">
                        Last sync: {connector.lastSync}
                      </div>
                    )}

                    {connector.connected ? (
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          Configure
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Disconnect
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={simulateConnection}
                        disabled={isConnecting}
                        className="flex items-center gap-2"
                      >
                        {isConnecting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Connecting...</span>
                          </>
                        ) : (
                          <>
                            <Lock className="h-4 w-4" />
                            <span>Secure Connect</span>
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                {connector.status === 'error' && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-md">
                    <AlertCircle className="h-4 w-4" />
                    <span>Connection error. Please reauthenticate to restore automatic syncing.</span>
                  </div>
                )}

                {connector.status === 'active' && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Switch id={`auto-sync-${idx}`} defaultChecked={true} />
                          <Label htmlFor={`auto-sync-${idx}`}>Auto-sync</Label>
                        </div>

                        <div className="flex items-center gap-2">
                          <Switch id={`notifications-${idx}`} defaultChecked={true} />
                          <Label htmlFor={`notifications-${idx}`}>Notifications</Label>
                        </div>
                      </div>

                      <Button variant="ghost" size="sm" className="text-blue-600">
                        <span>View Connected Data</span>
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </Tabs>

      <div className="mt-12">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Data Security & Privacy</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-start gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <ShieldCheck className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Bank-Level Encryption</h3>
                <p className="text-sm text-gray-500">
                  All connections use 256-bit TLS encryption to ensure your data remains secure during transfer.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Lock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Read-Only Access</h3>
                <p className="text-sm text-gray-500">
                  We only request read-only access to your accounts. We can never modify or initiate transactions.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-1">SOC 2 Compliant</h3>
                <p className="text-sm text-gray-500">
                  Our platform maintains SOC 2 compliance, ensuring the highest standards for security and privacy.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
