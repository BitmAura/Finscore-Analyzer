'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import {
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  Clock,
  Code,
  Copy,
  Edit,
  FileText,
  Play,
  Plus,
  RefreshCw,
  Save,
  Settings,
  Trash2,
  Workflow as WorkflowIcon,
  Zap
} from 'lucide-react'

// Custom icon
const Workflow = (props: any) => (
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
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 3v18" />
    <path d="M3 9h6" />
    <path d="M3 15h6" />
    <path d="M15 3v18" />
    <path d="M15 9h6" />
    <path d="M15 15h6" />
  </svg>
)

interface Trigger {
  id: string
  name: string
  type: string
  description: string
  icon?: React.ReactNode
}

interface Action {
  id: string
  name: string
  type: string
  description: string
  icon?: React.ReactNode
}

interface Workflow {
  id: string
  name: string
  description: string
  active: boolean
  triggers: string[]
  actions: string[]
  conditions: {
    type: 'and' | 'or'
    rules: {
      field: string
      operator: string
      value: string | number
    }[]
  }
  created: string
  lastRun?: string
  runCount: number
  creator: string
}

export default function WorkflowAutomation() {
  const [activeTab, setActiveTab] = useState('workflows')
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [workflowName, setWorkflowName] = useState('')
  const [workflowDescription, setWorkflowDescription] = useState('')
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([])
  const [selectedActions, setSelectedActions] = useState<string[]>([])

  // Sample data
  const triggers: Trigger[] = [
    {
      id: 'transaction-received',
      name: 'Transaction Received',
      type: 'banking',
      description: 'Triggers when a new transaction is received in connected bank accounts',
      icon: <FileText className="h-5 w-5" />
    },
    {
      id: 'large-expense',
      name: 'Large Expense Detected',
      type: 'banking',
      description: 'Triggers when an expense above a certain threshold is detected',
      icon: <AlertTriangle className="h-5 w-5" />
    },
    {
      id: 'balance-threshold',
      name: 'Balance Threshold',
      type: 'banking',
      description: 'Triggers when account balance falls below or rises above a threshold',
      icon: <AlertTriangle className="h-5 w-5" />
    },
    {
      id: 'recurring-payment',
      name: 'Recurring Payment Due',
      type: 'billing',
      description: 'Triggers when a recurring payment is coming due',
      icon: <RefreshCw className="h-5 w-5" />
    },
    {
      id: 'document-processed',
      name: 'Document Processed',
      type: 'documents',
      description: 'Triggers when a financial document is successfully processed',
      icon: <FileText className="h-5 w-5" />
    },
    {
      id: 'anomaly-detected',
      name: 'Anomaly Detected',
      type: 'analytics',
      description: 'Triggers when the system detects an anomaly in financial data',
      icon: <AlertTriangle className="h-5 w-5" />
    },
    {
      id: 'schedule',
      name: 'Scheduled Trigger',
      type: 'system',
      description: 'Triggers at scheduled intervals or specific times',
      icon: <Clock className="h-5 w-5" />
    }
  ]

  const actions: Action[] = [
    {
      id: 'email-notification',
      name: 'Send Email Notification',
      type: 'notification',
      description: 'Send an email notification to specified recipients',
      icon: <FileText className="h-5 w-5" />
    },
    {
      id: 'slack-notification',
      name: 'Send Slack Message',
      type: 'notification',
      description: 'Send a message to a Slack channel',
      icon: <FileText className="h-5 w-5" />
    },
    {
      id: 'generate-report',
      name: 'Generate Financial Report',
      type: 'reporting',
      description: 'Automatically generate a financial report',
      icon: <FileText className="h-5 w-5" />
    },
    {
      id: 'update-category',
      name: 'Update Transaction Category',
      type: 'data',
      description: 'Automatically categorize transactions based on rules',
      icon: <Edit className="h-5 w-5" />
    },
    {
      id: 'flag-transaction',
      name: 'Flag Transaction for Review',
      type: 'data',
      description: 'Mark a transaction for manual review',
      icon: <AlertTriangle className="h-5 w-5" />
    },
    {
      id: 'api-webhook',
      name: 'Trigger External Webhook',
      type: 'integration',
      description: 'Send data to an external system via webhook',
      icon: <Code className="h-5 w-5" />
    },
    {
      id: 'create-task',
      name: 'Create Task',
      type: 'productivity',
      description: 'Create a task for follow-up action',
      icon: <FileText className="h-5 w-5" />
    }
  ]

  const workflows: Workflow[] = [
    {
      id: 'workflow-1',
      name: 'Low Balance Alert',
      description: 'Send notification when account balance drops below threshold',
      active: true,
      triggers: ['balance-threshold'],
      actions: ['email-notification', 'slack-notification'],
      conditions: {
        type: 'and',
        rules: [
          { field: 'balance', operator: 'less_than', value: 5000 }
        ]
      },
      created: '2025-09-15T10:30:00',
      lastRun: '2025-10-12T08:45:00',
      runCount: 3,
      creator: 'Admin User'
    },
    {
      id: 'workflow-2',
      name: 'Large Transaction Review',
      description: 'Flag large transactions for manual review and notify team',
      active: true,
      triggers: ['transaction-received', 'large-expense'],
      actions: ['flag-transaction', 'email-notification'],
      conditions: {
        type: 'and',
        rules: [
          { field: 'amount', operator: 'greater_than', value: 10000 }
        ]
      },
      created: '2025-09-20T14:15:00',
      lastRun: '2025-10-11T16:30:00',
      runCount: 2,
      creator: 'Admin User'
    },
    {
      id: 'workflow-3',
      name: 'Weekly Financial Report',
      description: 'Generate and email weekly financial reports every Monday',
      active: true,
      triggers: ['schedule'],
      actions: ['generate-report', 'email-notification'],
      conditions: {
        type: 'and',
        rules: [
          { field: 'day_of_week', operator: 'equals', value: 'Monday' }
        ]
      },
      created: '2025-09-22T09:00:00',
      lastRun: '2025-10-07T07:00:00',
      runCount: 3,
      creator: 'Admin User'
    },
    {
      id: 'workflow-4',
      name: 'Anomaly Investigation Process',
      description: 'Create tasks and notify team when anomalies are detected',
      active: false,
      triggers: ['anomaly-detected'],
      actions: ['create-task', 'email-notification', 'slack-notification'],
      conditions: {
        type: 'and',
        rules: [
          { field: 'severity', operator: 'greater_than', value: 'medium' }
        ]
      },
      created: '2025-10-01T11:20:00',
      lastRun: undefined,
      runCount: 0,
      creator: 'Admin User'
    }
  ]

  const getTriggerById = (id: string) => {
    return triggers.find(t => t.id === id)
  }

  const getActionById = (id: string) => {
    return actions.find(a => a.id === id)
  }

  const handleCreateWorkflow = () => {
    setShowCreateModal(true)
    setWorkflowName('')
    setWorkflowDescription('')
    setSelectedTriggers([])
    setSelectedActions([])
  }

  const handleSelectWorkflow = (id: string) => {
    setSelectedWorkflow(id)
    setEditMode(false)
  }

  const handleToggleEditMode = () => {
    setEditMode(!editMode)
  }

  const renderWorkflowsList = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Workflow Automations</h2>
          <p className="text-gray-500">
            Automate financial processes and notifications
          </p>
        </div>
        <Button onClick={handleCreateWorkflow} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>Create Workflow</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workflows.map((workflow) => (
          <Card
            key={workflow.id}
            className={`p-5 cursor-pointer hover:shadow-md transition-shadow ${
              selectedWorkflow === workflow.id ? 'ring-2 ring-blue-600' : ''
            }`}
            onClick={() => handleSelectWorkflow(workflow.id)}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${workflow.active ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  <Workflow className={`h-5 w-5 ${workflow.active ? 'text-blue-600' : 'text-gray-500'}`} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{workflow.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-1">
                    {workflow.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <Switch checked={workflow.active} />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-gray-500">Created</p>
                  <p className="font-medium text-gray-700">
                    {new Date(workflow.created).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Run Count</p>
                  <p className="font-medium text-gray-700">{workflow.runCount}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                  workflow.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                }`}>
                  {workflow.active ? 'Active' : 'Disabled'}
                </span>
              </div>
              <Button variant="ghost" size="sm" className="text-gray-500">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )

  const selectedWorkflowData = selectedWorkflow
    ? workflows.find(w => w.id === selectedWorkflow)
    : null

  const renderWorkflowDetail = () => {
    if (!selectedWorkflowData) return null

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedWorkflow(null)}
            >
              <ArrowRight className="h-4 w-4 rotate-180" />
              <span className="ml-1">Back</span>
            </Button>
            <h2 className="text-2xl font-bold text-gray-900">{selectedWorkflowData.name}</h2>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
              selectedWorkflowData.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
            }`}>
              {selectedWorkflowData.active ? 'Active' : 'Disabled'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!editMode ? (
              <>
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={handleToggleEditMode}
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </Button>
                <Button
                  className="flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  <span>Run Now</span>
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={handleToggleEditMode}
                >
                  <ArrowRight className="h-4 w-4 rotate-180" />
                  <span>Cancel</span>
                </Button>
                <Button
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Workflow Details</h3>

              {editMode ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="workflow-name">Name</Label>
                    <Input
                      id="workflow-name"
                      defaultValue={selectedWorkflowData.name}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="workflow-description">Description</Label>
                    <Input
                      id="workflow-description"
                      defaultValue={selectedWorkflowData.description}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch defaultChecked={selectedWorkflowData.active} id="workflow-status" />
                    <Label htmlFor="workflow-status">Active</Label>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-600">{selectedWorkflowData.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                    <div>
                      <p className="text-sm text-gray-500">Created</p>
                      <p className="font-medium text-gray-900">
                        {new Date(selectedWorkflowData.created).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Created By</p>
                      <p className="font-medium text-gray-900">{selectedWorkflowData.creator}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Last Run</p>
                      <p className="font-medium text-gray-900">
                        {selectedWorkflowData.lastRun
                          ? new Date(selectedWorkflowData.lastRun).toLocaleDateString()
                          : 'Never'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Run Count</p>
                      <p className="font-medium text-gray-900">{selectedWorkflowData.runCount}</p>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Triggers</h3>

                {editMode ? (
                  <div className="space-y-4">
                    {triggers
                      .filter(trigger => selectedWorkflowData.triggers.includes(trigger.id))
                      .map(trigger => (
                        <div
                          key={trigger.id}
                          className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-lg">
                              {trigger.icon || <Zap className="h-4 w-4 text-blue-600" />}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{trigger.name}</p>
                              <p className="text-xs text-gray-500">{trigger.description}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}

                      <Button variant="outline" className="w-full mt-2">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Trigger
                      </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedWorkflowData.triggers.map(triggerId => {
                      const trigger = getTriggerById(triggerId)
                      if (!trigger) return null

                      return (
                        <div
                          key={trigger.id}
                          className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg"
                        >
                          <div className="bg-blue-100 p-2 rounded-lg">
                            {trigger.icon || <Zap className="h-4 w-4 text-blue-600" />}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{trigger.name}</p>
                            <p className="text-xs text-gray-500">{trigger.description}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>

                {editMode ? (
                  <div className="space-y-4">
                    {actions
                      .filter(action => selectedWorkflowData.actions.includes(action.id))
                      .map(action => (
                        <div
                          key={action.id}
                          className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="bg-purple-100 p-2 rounded-lg">
                              {action.icon || <Zap className="h-4 w-4 text-purple-600" />}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{action.name}</p>
                              <p className="text-xs text-gray-500">{action.description}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}

                      <Button variant="outline" className="w-full mt-2">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Action
                      </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedWorkflowData.actions.map(actionId => {
                      const action = getActionById(actionId)
                      if (!action) return null

                      return (
                        <div
                          key={action.id}
                          className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg"
                        >
                          <div className="bg-purple-100 p-2 rounded-lg">
                            {action.icon || <Zap className="h-4 w-4 text-purple-600" />}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{action.name}</p>
                            <p className="text-xs text-gray-500">{action.description}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Conditions</h3>

              {editMode ? (
                <div className="space-y-4">
                  <div className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Select defaultValue={selectedWorkflowData.conditions.type}>
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="and">AND</SelectItem>
                            <SelectItem value="or">OR</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-sm text-gray-600">Match all conditions</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {selectedWorkflowData.conditions.rules.map((rule, idx) => (
                        <div
                          key={idx}
                          className="flex flex-wrap items-center gap-2 p-3 border border-gray-100 rounded-lg"
                        >
                          <div className="w-[150px]">
                            <Select defaultValue={rule.field}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="amount">Amount</SelectItem>
                                <SelectItem value="balance">Balance</SelectItem>
                                <SelectItem value="severity">Severity</SelectItem>
                                <SelectItem value="day_of_week">Day of Week</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="w-[150px]">
                            <Select defaultValue={rule.operator}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="equals">Equals</SelectItem>
                                <SelectItem value="not_equals">Not Equals</SelectItem>
                                <SelectItem value="greater_than">Greater Than</SelectItem>
                                <SelectItem value="less_than">Less Than</SelectItem>
                                <SelectItem value="contains">Contains</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <Input
                            defaultValue={rule.value.toString()}
                            className="w-[200px]"
                          />

                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <Button variant="outline" className="mt-3 text-sm">
                      <Plus className="h-3 w-3 mr-1" />
                      Add Condition
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium mb-2">
                      {selectedWorkflowData.conditions.type === 'and'
                        ? 'Match ALL of the following:'
                        : 'Match ANY of the following:'}
                    </p>

                    <div className="space-y-2">
                      {selectedWorkflowData.conditions.rules.map((rule, idx) => (
                        <div key={idx} className="bg-white p-2 rounded border border-gray-100">
                          <p className="text-sm">
                            <span className="font-medium">{rule.field}</span>
                            {' '}
                            {rule.operator.replace('_', ' ')}
                            {' '}
                            <span className="font-medium">{rule.value.toString()}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Execution History</h3>

              <div className="space-y-3">
                {selectedWorkflowData.runCount > 0 && selectedWorkflowData.lastRun ? (
                  <>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(selectedWorkflowData.lastRun).toLocaleDateString()}, {new Date(selectedWorkflowData.lastRun).toLocaleTimeString()}
                        </p>
                        <p className="text-xs text-gray-500">Success</p>
                      </div>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Completed
                      </span>
                    </div>

                    {selectedWorkflowData.runCount > 1 && (
                      <>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {new Date(new Date(selectedWorkflowData.lastRun).getTime() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}, {new Date(selectedWorkflowData.lastRun).toLocaleTimeString()}
                            </p>
                            <p className="text-xs text-gray-500">Success</p>
                          </div>
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            Completed
                          </span>
                        </div>

                        {selectedWorkflowData.runCount > 2 && (
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {new Date(new Date(selectedWorkflowData.lastRun).getTime() - 14 * 24 * 60 * 60 * 1000).toLocaleDateString()}, {new Date(selectedWorkflowData.lastRun).toLocaleTimeString()}
                              </p>
                              <p className="text-xs text-gray-500">Success</p>
                            </div>
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              Completed
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <p>No execution history available</p>
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Settings</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">Email Notifications</p>
                    <p className="text-xs text-gray-500">Get notified when workflow runs</p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">Error Alerts</p>
                    <p className="text-xs text-gray-500">Notify on workflow failures</p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">Log History</p>
                    <p className="text-xs text-gray-500">Save detailed execution logs</p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>

                <div className="pt-2 mt-2 border-t border-gray-100">
                  <p className="font-medium text-gray-800 mb-2">Execution Timeout</p>
                  <div className="flex flex-col space-y-2">
                    <Slider defaultValue={[30]} max={120} step={1} />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>0 seconds</span>
                      <span>30 seconds</span>
                      <span>120 seconds</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Workflow JSON</h3>

              <div className="bg-gray-900 text-gray-300 p-4 rounded-lg text-xs font-mono overflow-x-auto">
                <pre className="whitespace-pre-wrap break-all">
                  {JSON.stringify(selectedWorkflowData, null, 2)}
                </pre>
              </div>

              <Button variant="outline" size="sm" className="mt-3 w-full flex items-center justify-center gap-2">
                <Copy className="h-4 w-4" />
                <span>Copy JSON</span>
              </Button>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  const renderTriggersLibrary = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Triggers Library</h2>
          <p className="text-gray-500">
            Available events that can start a workflow
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {triggers.map((trigger) => (
          <Card key={trigger.id} className="p-5 hover:bg-gray-50">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                {trigger.icon || <Zap className="h-5 w-5 text-blue-600" />}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{trigger.name}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {trigger.description}
                </p>
                <div className="mt-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                    {trigger.type}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderActionsLibrary = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Actions Library</h2>
          <p className="text-gray-500">
            Available operations that can be performed by workflows
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action) => (
          <Card key={action.id} className="p-5 hover:bg-gray-50">
            <div className="flex items-start gap-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                {action.icon || <Zap className="h-5 w-5 text-purple-600" />}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{action.name}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {action.description}
                </p>
                <div className="mt-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                    {action.type}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Workflow Settings</h2>
        <p className="text-gray-500">
          Configure global workflow automation settings
        </p>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">General Settings</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800">Enable Workflow Engine</p>
              <p className="text-sm text-gray-500">Turn on/off all workflow automations</p>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800">Run Workflows in Debug Mode</p>
              <p className="text-sm text-gray-500">Log detailed execution information</p>
            </div>
            <Switch defaultChecked={false} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800">Email Error Reports</p>
              <p className="text-sm text-gray-500">Receive emails when workflows fail</p>
            </div>
            <Switch defaultChecked={true} />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Performance</h3>

        <div className="space-y-6">
          <div>
            <p className="font-medium text-gray-800 mb-2">Max Concurrent Workflows</p>
            <div className="flex flex-col space-y-2">
              <Slider defaultValue={[5]} max={20} step={1} />
              <div className="flex justify-between text-sm text-gray-500">
                <span>1</span>
                <span>5</span>
                <span>20</span>
              </div>
            </div>
          </div>

          <div>
            <p className="font-medium text-gray-800 mb-2">Default Timeout (seconds)</p>
            <div className="flex flex-col space-y-2">
              <Slider defaultValue={[30]} max={120} step={1} />
              <div className="flex justify-between text-sm text-gray-500">
                <span>10</span>
                <span>30</span>
                <span>120</span>
              </div>
            </div>
          </div>

          <div>
            <p className="font-medium text-gray-800 mb-2">History Retention (days)</p>
            <div className="flex flex-col space-y-2">
              <Slider defaultValue={[30]} max={90} step={1} />
              <div className="flex justify-between text-sm text-gray-500">
                <span>7</span>
                <span>30</span>
                <span>90</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">API Integration</h3>

        <div className="space-y-4">
          <div>
            <Label htmlFor="api-key">API Key</Label>
            <div className="flex mt-1">
              <Input
                id="api-key"
                value="sk_workflow_7a9b3c2d1e5f8g7h6i5j4k3l2m1n0o9p"
                className="font-mono text-sm rounded-r-none"
                readOnly
              />
              <Button variant="secondary" className="rounded-l-none">
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Use this API key to programmatically trigger workflows
            </p>
          </div>

          <div className="pt-4 mt-2 border-t border-gray-100">
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Regenerate API Key
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Workflow Automation
            </h1>
            <p className="text-gray-500 mt-1">
              Create automated workflows for your financial processes
            </p>
          </div>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-8 w-full md:w-auto">
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="triggers">Triggers</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="mt-0">
          {selectedWorkflow ? renderWorkflowDetail() : renderWorkflowsList()}
        </TabsContent>

        <TabsContent value="triggers" className="mt-0">
          {renderTriggersLibrary()}
        </TabsContent>

        <TabsContent value="actions" className="mt-0">
          {renderActionsLibrary()}
        </TabsContent>

        <TabsContent value="settings" className="mt-0">
          {renderSettingsTab()}
        </TabsContent>
      </Tabs>
    </div>
  )
}
