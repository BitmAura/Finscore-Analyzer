'use client'

import { useState, useEffect } from 'react'
import { Bell, CheckCircle, ChevronDown, ChevronRight, Clock, FileText, Filter, Info, MoreVertical, RefreshCw, Settings, Trash2, X, AlertTriangle, ArrowUpRight, Calendar, CreditCard } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type NotificationType = 'anomaly' | 'document' | 'report' | 'system' | 'account'
type NotificationSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info'
type NotificationStatus = 'unread' | 'read' | 'archived'

interface Notification {
  id: string
  title: string
  message: string
  type: NotificationType
  severity: NotificationSeverity
  status: NotificationStatus
  timestamp: string
  link?: string
  metadata?: Record<string, any>
}

// Generate sample notification data
const generateNotifications = (): Notification[] => {
  // Use October 13, 2025 as the current date
  const baseDate = new Date('2025-10-13T12:00:00')

  return [
    {
      id: 'notif-001',
      title: 'Large Transaction Detected',
      message: 'Unusual transaction of $27,500 detected in account ending 4721',
      type: 'anomaly',
      severity: 'high',
      status: 'unread',
      timestamp: new Date(baseDate.getTime() - 15 * 60000).toISOString(), // 15 minutes ago
      link: '/dashboard/enhanced-dashboard',
      metadata: {
        accountId: 'acc_4721',
        transactionId: 'tx_38219',
        amount: 27500
      }
    },
    {
      id: 'notif-002',
      title: 'Monthly Report Ready',
      message: 'Your September 2025 financial report is now available',
      type: 'report',
      severity: 'medium',
      status: 'unread',
      timestamp: new Date(baseDate.getTime() - 2 * 3600000).toISOString(), // 2 hours ago
      link: '/reports/comprehensive',
      metadata: {
        reportId: 'rep_92847',
        period: 'September 2025'
      }
    },
    {
      id: 'notif-003',
      title: 'Document Processing Complete',
      message: 'Bank statement successfully processed with 127 transactions',
      type: 'document',
      severity: 'info',
      status: 'read',
      timestamp: new Date(baseDate.getTime() - 5 * 3600000).toISOString(), // 5 hours ago
      link: '/documents/process',
      metadata: {
        documentId: 'doc_23857',
        documentName: 'HDFC Bank Statement - Sep 2025.pdf'
      }
    },
    {
      id: 'notif-004',
      title: 'Cash Flow Alert',
      message: 'Projected negative cash flow in 15 days based on recurring expenses',
      type: 'anomaly',
      severity: 'critical',
      status: 'read',
      timestamp: new Date(baseDate.getTime() - 12 * 3600000).toISOString(), // 12 hours ago
      link: '/dashboard/enhanced-dashboard',
      metadata: {
        projectedDeficit: -12500,
        daysUntilNegative: 15
      }
    },
    {
      id: 'notif-005',
      title: 'New Feature Available',
      message: 'Try our new AI-powered executive summary feature',
      type: 'system',
      severity: 'info',
      status: 'read',
      timestamp: new Date(baseDate.getTime() - 24 * 3600000).toISOString(), // 1 day ago
      link: '/reports/comprehensive?tab=ai-summary',
      metadata: {
        featureId: 'ai_summary'
      }
    },
    {
      id: 'notif-006',
      title: 'Account Verification Required',
      message: 'Please verify your email address to ensure uninterrupted service',
      type: 'account',
      severity: 'high',
      status: 'read',
      timestamp: new Date(baseDate.getTime() - 48 * 3600000).toISOString(), // 2 days ago
      link: '/profile',
    },
    {
      id: 'notif-007',
      title: 'Potential Duplicate Payment',
      message: 'Two similar payments of $1,450 to "Office Supply Co" detected',
      type: 'anomaly',
      severity: 'high',
      status: 'archived',
      timestamp: new Date(baseDate.getTime() - 72 * 3600000).toISOString(), // 3 days ago
      link: '/dashboard/enhanced-dashboard',
      metadata: {
        transactions: ['tx_37219', 'tx_37220'],
        vendor: 'Office Supply Co',
        amount: 1450
      }
    },
    {
      id: 'notif-008',
      title: 'Tax Filing Reminder',
      message: 'Quarterly tax filing deadline in 7 days',
      type: 'account',
      severity: 'medium',
      status: 'archived',
      timestamp: new Date(baseDate.getTime() - 96 * 3600000).toISOString(), // 4 days ago
      link: '/calendar',
      metadata: {
        deadline: '2025-10-20',
        taxType: 'Quarterly GST'
      }
    },
  ]
}

const typesMap: Record<NotificationType, { icon: React.ReactNode, label: string }> = {
  anomaly: {
    icon: <AlertTriangle className="h-4 w-4 text-amber-500" />,
    label: 'Anomaly'
  },
  document: {
    icon: <FileText className="h-4 w-4 text-blue-500" />,
    label: 'Document'
  },
  report: {
    icon: <ArrowUpRight className="h-4 w-4 text-green-500" />,
    label: 'Report'
  },
  system: {
    icon: <Info className="h-4 w-4 text-purple-500" />,
    label: 'System'
  },
  account: {
    icon: <CreditCard className="h-4 w-4 text-blue-500" />,
    label: 'Account'
  }
}

const severityMap: Record<NotificationSeverity, { color: string }> = {
  critical: { color: 'bg-red-500' },
  high: { color: 'bg-amber-500' },
  medium: { color: 'bg-blue-500' },
  low: { color: 'bg-green-500' },
  info: { color: 'bg-gray-500' }
}

interface NotificationChannelPreference {
  id: string
  channel: 'email' | 'push' | 'sms' | 'slack' | 'in_app'
  enabled: boolean
}

interface NotificationTypePreference {
  id: string
  type: NotificationType
  displayName: string
  description: string
  email: boolean
  push: boolean
  sms: boolean
  slack: boolean
  in_app: boolean
}

export default function NotificationCenterPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [allNotifications, setAllNotifications] = useState<Notification[]>([])
  const [channelPreferences, setChannelPreferences] = useState<NotificationChannelPreference[]>([
    { id: 'email', channel: 'email', enabled: true },
    { id: 'push', channel: 'push', enabled: true },
    { id: 'sms', channel: 'sms', enabled: false },
    { id: 'slack', channel: 'slack', enabled: true },
    { id: 'in_app', channel: 'in_app', enabled: true },
  ])

  const [typePreferences, setTypePreferences] = useState<NotificationTypePreference[]>([
    {
      id: 'anomaly',
      type: 'anomaly',
      displayName: 'Financial Anomalies',
      description: 'Unusual transactions and patterns',
      email: true,
      push: true,
      sms: true,
      slack: true,
      in_app: true
    },
    {
      id: 'document',
      type: 'document',
      displayName: 'Document Processing',
      description: 'Updates on document processing status',
      email: true,
      push: false,
      sms: false,
      slack: false,
      in_app: true
    },
    {
      id: 'report',
      type: 'report',
      displayName: 'Report Generation',
      description: 'Notifications about report creation and updates',
      email: true,
      push: true,
      sms: false,
      slack: true,
      in_app: true
    },
    {
      id: 'system',
      type: 'system',
      displayName: 'System Updates',
      description: 'Product updates and new features',
      email: true,
      push: false,
      sms: false,
      slack: false,
      in_app: true
    },
    {
      id: 'account',
      type: 'account',
      displayName: 'Account & Security',
      description: 'Login activity and security alerts',
      email: true,
      push: true,
      sms: true,
      slack: true,
      in_app: true
    }
  ])

  useEffect(() => {
    // Simulating fetching notifications from an API
    setAllNotifications(generateNotifications())
  }, [])

  const filteredNotifications = allNotifications.filter(notification => {
    if (activeTab === 'all') return notification.status !== 'archived'
    if (activeTab === 'unread') return notification.status === 'unread'
    if (activeTab === 'archived') return notification.status === 'archived'
    return notification.type === activeTab && notification.status !== 'archived'
  })

  const unreadCount = allNotifications.filter(n => n.status === 'unread').length

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date('2025-10-13T12:00:00') // Current date (October 13, 2025)
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const markAsRead = (id: string) => {
    setAllNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, status: 'read' } : notification
      )
    )
  }

  const markAllAsRead = () => {
    setAllNotifications(prev =>
      prev.map(notification =>
        notification.status === 'unread' ? { ...notification, status: 'read' } : notification
      )
    )
  }

  const archiveNotification = (id: string) => {
    setAllNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, status: 'archived' } : notification
      )
    )
  }

  const deleteNotification = (id: string) => {
    setAllNotifications(prev => prev.filter(notification => notification.id !== id))
  }

  const restoreNotification = (id: string) => {
    setAllNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, status: 'read' } : notification
      )
    )
  }

  const updateChannelPreference = (id: string, enabled: boolean) => {
    setChannelPreferences(prev =>
      prev.map(pref => pref.id === id ? { ...pref, enabled } : pref)
    )
  }

  const updateTypePreference = (id: string, channel: keyof Omit<NotificationTypePreference, 'id' | 'type' | 'displayName' | 'description'>, enabled: boolean) => {
    setTypePreferences(prev =>
      prev.map(pref => {
        if (pref.id === id) {
          return { ...pref, [channel]: enabled }
        }
        return pref
      })
    )
  }

  const renderNotificationCenter = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Notification Center</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={markAllAsRead}>
              <CheckCircle className="h-4 w-4" />
              <span>Mark all read</span>
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-7">
            <TabsTrigger value="all" className="relative">
              All
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 min-w-[1rem] flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
            <TabsTrigger value="anomaly">Anomalies</TabsTrigger>
            <TabsTrigger value="document">Documents</TabsTrigger>
            <TabsTrigger value="report">Reports</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>
        </Tabs>

        <Card>
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <Bell className="h-12 w-12 text-gray-300 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No notifications</h3>
              <p className="text-gray-500">
                {activeTab === 'unread'
                  ? "You've read all notifications"
                  : activeTab === 'archived'
                  ? "No archived notifications"
                  : `No ${activeTab === 'all' ? '' : activeTab + ' '}notifications to display`}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredNotifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 ${notification.status === 'unread' ? 'bg-blue-50' : ''} hover:bg-gray-50 transition-colors`}
                >
                  <div className="flex items-start">
                    <div className={`p-2 rounded-full ${notification.status === 'unread' ? 'bg-white' : 'bg-gray-100'} mr-3`}>
                      {typesMap[notification.type].icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">{notification.title}</p>
                            <span className={`h-2 w-2 rounded-full ${severityMap[notification.severity].color}`}></span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        </div>
                        <div className="flex items-center ml-4">
                          <span className="text-xs text-gray-500 whitespace-nowrap mr-2">
                            {formatTimestamp(notification.timestamp)}
                          </span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {notification.status === 'unread' ? (
                                <DropdownMenuItem onClick={() => markAsRead(notification.id)}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  <span>Mark as read</span>
                                </DropdownMenuItem>
                              ) : null}
                              {notification.status !== 'archived' ? (
                                <DropdownMenuItem onClick={() => archiveNotification(notification.id)}>
                                  <Archive className="h-4 w-4 mr-2" />
                                  <span>Archive</span>
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => restoreNotification(notification.id)}>
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  <span>Restore</span>
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => deleteNotification(notification.id)} className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      <div className="mt-2 flex justify-between items-center">
                        <div className="flex items-center">
                          <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full mr-2">
                            {typesMap[notification.type].label}
                          </span>
                          {notification.severity === 'critical' || notification.severity === 'high' ? (
                            <span className={`text-xs ${
                              notification.severity === 'critical' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                            } px-2 py-1 rounded-full`}>
                              {notification.severity.charAt(0).toUpperCase() + notification.severity.slice(1)} Priority
                            </span>
                          ) : null}
                        </div>
                        {notification.link ? (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={notification.link} className="text-blue-600 text-xs flex items-center">
                              View Details
                              <ChevronRight className="ml-1 h-3 w-3" />
                            </a>
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    )
  }

  const renderNotificationSettings = () => {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Notification Preferences</h2>
          <p className="text-gray-600">
            Customize when and how you receive notifications.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-medium text-gray-900 mb-4">Notification Channels</h3>
          <Card>
            <div className="p-4 border-b border-gray-100">
              <p className="text-sm text-gray-600">
                Enable or disable notification delivery channels
              </p>
            </div>
            <div className="divide-y divide-gray-100">
              <div className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-gray-900">Email Notifications</p>
                  <p className="text-xs text-gray-500">Sent to john.doe@example.com</p>
                </div>
                <Switch
                  checked={channelPreferences.find(p => p.channel === 'email')?.enabled || false}
                  onCheckedChange={(checked) => updateChannelPreference('email', checked)}
                />
              </div>
              <div className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-gray-900">Push Notifications</p>
                  <p className="text-xs text-gray-500">Sent to your browser and mobile devices</p>
                </div>
                <Switch
                  checked={channelPreferences.find(p => p.channel === 'push')?.enabled || false}
                  onCheckedChange={(checked) => updateChannelPreference('push', checked)}
                />
              </div>
              <div className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-gray-900">SMS Notifications</p>
                  <p className="text-xs text-gray-500">Sent to +1 (555) 123-4567</p>
                </div>
                <Switch
                  checked={channelPreferences.find(p => p.channel === 'sms')?.enabled || false}
                  onCheckedChange={(checked) => updateChannelPreference('sms', checked)}
                />
              </div>
              <div className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-gray-900">Slack Notifications</p>
                  <p className="text-xs text-gray-500">Sent to #finance-alerts channel</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">Configure</Button>
                  <Switch
                    checked={channelPreferences.find(p => p.channel === 'slack')?.enabled || false}
                    onCheckedChange={(checked) => updateChannelPreference('slack', checked)}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-gray-900">In-App Notifications</p>
                  <p className="text-xs text-gray-500">Shown in the notification center</p>
                </div>
                <Switch
                  checked={channelPreferences.find(p => p.channel === 'in_app')?.enabled || false}
                  onCheckedChange={(checked) => updateChannelPreference('in_app', checked)}
                />
              </div>
            </div>
          </Card>
        </div>

        <div>
          <h3 className="text-xl font-medium text-gray-900 mb-4">Notification Types</h3>
          <Card>
            <div className="divide-y divide-gray-100">
              {typePreferences.map(pref => (
                <div key={pref.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        {typesMap[pref.type].icon}
                        <p className="font-medium text-gray-900">{pref.displayName}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{pref.description}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg mt-3">
                    <p className="text-xs font-medium text-gray-700 mb-2">Delivery Channels</p>
                    <div className="grid grid-cols-5 gap-4">
                      <div className="flex items-center gap-2">
                        <Switch
                          id={`${pref.id}-email`}
                          checked={pref.email}
                          onCheckedChange={(checked) => updateTypePreference(pref.id, 'email', checked)}
                          className="data-[state=checked]:bg-blue-600"
                        />
                        <label htmlFor={`${pref.id}-email`} className="text-xs text-gray-700">
                          Email
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          id={`${pref.id}-push`}
                          checked={pref.push}
                          onCheckedChange={(checked) => updateTypePreference(pref.id, 'push', checked)}
                          className="data-[state=checked]:bg-blue-600"
                        />
                        <label htmlFor={`${pref.id}-push`} className="text-xs text-gray-700">
                          Push
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          id={`${pref.id}-sms`}
                          checked={pref.sms}
                          onCheckedChange={(checked) => updateTypePreference(pref.id, 'sms', checked)}
                          className="data-[state=checked]:bg-blue-600"
                        />
                        <label htmlFor={`${pref.id}-sms`} className="text-xs text-gray-700">
                          SMS
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          id={`${pref.id}-slack`}
                          checked={pref.slack}
                          onCheckedChange={(checked) => updateTypePreference(pref.id, 'slack', checked)}
                          className="data-[state=checked]:bg-blue-600"
                        />
                        <label htmlFor={`${pref.id}-slack`} className="text-xs text-gray-700">
                          Slack
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          id={`${pref.id}-in_app`}
                          checked={pref.in_app}
                          onCheckedChange={(checked) => updateTypePreference(pref.id, 'in_app', checked)}
                          className="data-[state=checked]:bg-blue-600"
                        />
                        <label htmlFor={`${pref.id}-in_app`} className="text-xs text-gray-700">
                          In-App
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div>
          <h3 className="text-xl font-medium text-gray-900 mb-4">Schedule & Timing</h3>
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <p className="font-medium text-gray-900 mb-2">Quiet Hours</p>
                <p className="text-sm text-gray-600 mb-4">
                  During quiet hours, only critical notifications will be delivered via email and push.
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700 mb-1">Start Time</p>
                    <Select defaultValue="22:00">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }).map((_, i) => (
                          <SelectItem
                            key={i}
                            value={`${i.toString().padStart(2, '0')}:00`}
                          >
                            {`${i.toString().padStart(2, '0')}:00`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700 mb-1">End Time</p>
                    <Select defaultValue="08:00">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }).map((_, i) => (
                          <SelectItem
                            key={i}
                            value={`${i.toString().padStart(2, '0')}:00`}
                          >
                            {`${i.toString().padStart(2, '0')}:00`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div>
                  <p className="font-medium text-gray-900">Enable Quiet Hours</p>
                  <p className="text-xs text-gray-500">Silence non-critical notifications</p>
                </div>
                <Switch defaultChecked={true} />
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div>
                  <p className="font-medium text-gray-900">Weekend Mute</p>
                  <p className="text-xs text-gray-500">Silence all but critical notifications on weekends</p>
                </div>
                <Switch defaultChecked={false} />
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div>
                  <p className="font-medium text-gray-900">Digest Mode</p>
                  <p className="text-xs text-gray-500">Group notifications into a daily summary email</p>
                </div>
                <div className="flex items-center gap-3">
                  <Select defaultValue="none">
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Don&apos;t digest</SelectItem>
                      <SelectItem value="daily">Daily digest</SelectItem>
                      <SelectItem value="weekly">Weekly digest</SelectItem>
                    </SelectContent>
                  </Select>
                  <Switch defaultChecked={false} />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  const [settingsView, setSettingsView] = useState(false)

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-blue-100">
              <Bell className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Notifications
              </h1>
              <p className="text-gray-500">
                Stay updated on important financial events and system updates
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setSettingsView(!settingsView)}
          >
            <Settings className="h-4 w-4" />
            <span>{settingsView ? 'View Notifications' : 'Notification Settings'}</span>
          </Button>
        </div>
      </header>

      {settingsView ? renderNotificationSettings() : renderNotificationCenter()}
    </div>
  )
}

// Custom Archive icon component
const Archive = (props: any) => (
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
    <rect width="20" height="5" x="2" y="3" rx="1" />
    <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
    <path d="M10 12h4" />
  </svg>
)
