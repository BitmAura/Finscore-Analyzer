'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { ArrowRight, Check, ChevronRight, CreditCard, FileText, Fingerprint, MailOpen, RefreshCw, User, Users } from 'lucide-react'

interface OnboardingStep {
  id: string
  title: string
  description: string
  completed: boolean
  optional?: boolean
}

export default function OnboardingFlow() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [onboardingProgress, setOnboardingProgress] = useState<number>(0)
  const [businessType, setBusinessType] = useState<string>('')
  const [organizationSize, setOrganizationSize] = useState<string>('')
  const [accountingMethod, setAccountingMethod] = useState<string>('')
  const [inviteTeam, setInviteTeam] = useState<{ email: string, role: string }[]>([
    { email: '', role: 'viewer' }
  ])

  const steps = [
    {
      id: 'welcome',
      title: 'Welcome to FinScore Analyzer',
      subtitle: 'Let\'s get your account set up for success'
    },
    {
      id: 'business-profile',
      title: 'Business Profile',
      subtitle: 'Tell us about your business to customize your experience'
    },
    {
      id: 'team-setup',
      title: 'Team Setup',
      subtitle: 'Invite your team members to collaborate'
    },
    {
      id: 'data-sources',
      title: 'Connect Data Sources',
      subtitle: 'Link your financial accounts for automated insights'
    },
    {
      id: 'preferences',
      title: 'Set Preferences',
      subtitle: 'Customize your experience and notifications'
    },
    {
      id: 'complete',
      title: 'All Set!',
      subtitle: 'Your FinScore Analyzer account is ready to use'
    }
  ]

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
      setOnboardingProgress(Math.round(((currentStep + 1) / (steps.length - 1)) * 100))
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      setOnboardingProgress(Math.round(((currentStep - 1) / (steps.length - 1)) * 100))
    }
  }

  const addTeamMember = () => {
    setInviteTeam([...inviteTeam, { email: '', role: 'viewer' }])
  }

  const removeTeamMember = (index: number) => {
    const newInviteTeam = [...inviteTeam]
    newInviteTeam.splice(index, 1)
    setInviteTeam(newInviteTeam)
  }

  const updateTeamMember = (index: number, field: 'email' | 'role', value: string) => {
    const newInviteTeam = [...inviteTeam]
    newInviteTeam[index] = { ...newInviteTeam[index], [field]: value }
    setInviteTeam(newInviteTeam)
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center">
            <div className="mb-8">
              <div className="w-20 h-20 bg-blue-600 rounded-xl mx-auto flex items-center justify-center mb-6">
                <FileText className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to FinScore Analyzer</h2>
              <p className="text-gray-600 max-w-md mx-auto">
                The intelligent financial analysis platform that helps you understand your business performance and make better decisions.
              </p>
            </div>

            <div className="max-w-lg mx-auto">
              <Card className="p-6 mb-6">
                <h3 className="text-lg font-medium mb-4">Here&apos;s what we&apos;ll cover:</h3>

                <div className="space-y-3">
                  {steps.slice(1, -1).map((step, idx) => (
                    <div key={step.id} className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium">
                        {idx + 1}
                      </div>
                      <div className="flex-grow">
                        <p className="font-medium text-gray-900">{step.title}</p>
                        <p className="text-sm text-gray-500">{step.subtitle}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <p className="text-sm text-gray-500 mb-6">
                This should take about 3-5 minutes to complete. You can always update these settings later.
              </p>

              <Button onClick={nextStep} className="w-full">
                Let&apos;s Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )

      case 1:
        return (
          <div className="max-w-xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Business Profile</h2>

            <div className="space-y-6">
              <div>
                <Label htmlFor="business-name" className="text-sm font-medium">
                  Business Name
                </Label>
                <Input
                  id="business-name"
                  placeholder="Enter your business name"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="business-type" className="text-sm font-medium">
                  Business Type
                </Label>
                <Select value={businessType} onValueChange={setBusinessType}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select your business type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sole-proprietor">Sole Proprietorship</SelectItem>
                    <SelectItem value="partnership">Partnership</SelectItem>
                    <SelectItem value="llp">Limited Liability Partnership</SelectItem>
                    <SelectItem value="private-limited">Private Limited Company</SelectItem>
                    <SelectItem value="public-limited">Public Limited Company</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="organization-size" className="text-sm font-medium">
                  Organization Size
                </Label>
                <Select value={organizationSize} onValueChange={setOrganizationSize}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select your organization size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solo">Just me</SelectItem>
                    <SelectItem value="micro">2-10 employees</SelectItem>
                    <SelectItem value="small">11-50 employees</SelectItem>
                    <SelectItem value="medium">51-200 employees</SelectItem>
                    <SelectItem value="large">201-1000 employees</SelectItem>
                    <SelectItem value="enterprise">1000+ employees</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">
                  Accounting Method
                </Label>
                <RadioGroup value={accountingMethod} onValueChange={setAccountingMethod} className="mt-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label htmlFor="cash">Cash Basis</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="accrual" id="accrual" />
                    <Label htmlFor="accrual">Accrual Basis</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="hybrid" id="hybrid" />
                    <Label htmlFor="hybrid">Hybrid Method</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="industry" className="text-sm font-medium">
                  Industry
                </Label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tech">Technology</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="finance">Financial Services</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="hospitality">Hospitality</SelectItem>
                    <SelectItem value="construction">Construction</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-between mt-10">
              <Button variant="outline" onClick={prevStep}>
                Back
              </Button>
              <Button onClick={nextStep}>
                Continue
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="max-w-xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Team Setup</h2>
            <p className="text-gray-600 mb-6">
              Invite team members to collaborate on financial analysis
            </p>

            <Card className="p-6 mb-8">
              <div className="space-y-4">
                {inviteTeam.map((member, idx) => (
                  <div key={idx} className="flex flex-wrap gap-3 items-center">
                    <div className="flex-1 min-w-[250px]">
                      <Input
                        placeholder="Email address"
                        value={member.email}
                        onChange={(e) => updateTeamMember(idx, 'email', e.target.value)}
                      />
                    </div>
                    <div className="w-32">
                      <Select
                        value={member.role}
                        onValueChange={(value) => updateTeamMember(idx, 'role', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {idx > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 px-2"
                        onClick={() => removeTeamMember(idx)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                className="mt-4 w-full"
                onClick={addTeamMember}
              >
                <Users className="h-4 w-4 mr-2" />
                Add Another Team Member
              </Button>
            </Card>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-8">
              <h3 className="text-sm font-medium text-blue-800 mb-1">About User Roles:</h3>
              <ul className="text-sm text-blue-700 space-y-1 pl-5 list-disc">
                <li><span className="font-medium">Admin:</span> Full access to all features, can add/remove users</li>
                <li><span className="font-medium">Editor:</span> Can create reports, upload documents, and analyze data</li>
                <li><span className="font-medium">Viewer:</span> Can only view reports and dashboards</li>
              </ul>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                Back
              </Button>
              <Button onClick={nextStep}>
                Continue
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="max-w-xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Data Sources</h2>
            <p className="text-gray-600 mb-6">
              Link your accounts to automate data import and analysis
            </p>

            <div className="space-y-4 mb-8">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Banking Connections</h3>
                      <p className="text-sm text-gray-500">Connect your bank accounts for automatic transaction import</p>
                    </div>
                  </div>
                  <Button>Connect</Button>
                </div>

                <div className="text-sm text-gray-600">
                  We support over 20,000 banks and financial institutions worldwide
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <FileText className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Accounting Software</h3>
                      <p className="text-sm text-gray-500">Sync your accounting data for comprehensive analysis</p>
                    </div>
                  </div>
                  <Button>Connect</Button>
                </div>

                <div className="text-sm text-gray-600">
                  Compatible with QuickBooks, Xero, Tally, and more
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-100 p-2 rounded-lg">
                      <FileText className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Tax Portals</h3>
                      <p className="text-sm text-gray-500">Import data from government tax portals</p>
                    </div>
                  </div>
                  <Button>Connect</Button>
                </div>

                <div className="text-sm text-gray-600">
                  Access GST returns, income tax filings, and more
                </div>
              </Card>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-8">
              <div className="flex items-start gap-2">
                <Fingerprint className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-blue-800">Security Guarantee</h3>
                  <p className="text-xs text-blue-700">
                    We use bank-level 256-bit encryption and never store your credentials. All connections are read-only.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                Back
              </Button>
              <Button onClick={nextStep}>
                Continue
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="max-w-xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Set Preferences</h2>
            <p className="text-gray-600 mb-6">
              Customize your experience and notification settings
            </p>

            <Card className="p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Reporting Preferences</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">Default Currency</p>
                    <p className="text-sm text-gray-500">Select your primary currency for reports</p>
                  </div>
                  <Select defaultValue="inr">
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inr">INR (₹)</SelectItem>
                      <SelectItem value="usd">USD ($)</SelectItem>
                      <SelectItem value="eur">EUR (€)</SelectItem>
                      <SelectItem value="gbp">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">Date Format</p>
                    <p className="text-sm text-gray-500">Choose your preferred date display format</p>
                  </div>
                  <Select defaultValue="dd-mm-yyyy">
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dd-mm-yyyy">DD-MM-YYYY</SelectItem>
                      <SelectItem value="mm-dd-yyyy">MM-DD-YYYY</SelectItem>
                      <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">Fiscal Year Start</p>
                    <p className="text-sm text-gray-500">Set your company&apos;s financial year beginning</p>
                  </div>
                  <Select defaultValue="apr">
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jan">January</SelectItem>
                      <SelectItem value="apr">April</SelectItem>
                      <SelectItem value="jul">July</SelectItem>
                      <SelectItem value="oct">October</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            <Card className="p-6 mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">Email Reports</p>
                    <p className="text-sm text-gray-500">Receive weekly summary reports</p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">Anomaly Alerts</p>
                    <p className="text-sm text-gray-500">Get notified of unusual financial activity</p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">Document Processing</p>
                    <p className="text-sm text-gray-500">Alerts when documents are processed</p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">Team Activity</p>
                    <p className="text-sm text-gray-500">Notifications when team members take actions</p>
                  </div>
                  <Switch defaultChecked={false} />
                </div>
              </div>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                Back
              </Button>
              <Button onClick={nextStep}>
                Complete Setup
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="text-center max-w-xl mx-auto">
            <div className="mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-6">
                <Check className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">You&apos;re all set!</h2>
              <p className="text-gray-600">
                Your FinScore Analyzer account is ready to use. Get started with these recommended actions:
              </p>
            </div>

            <div className="space-y-4 mb-10">
              <Card className="p-4 hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-medium text-gray-900">Upload Your First Document</h3>
                      <p className="text-sm text-gray-500">Get insights from your financial statements</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </Card>

              <Card className="p-4 hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-full">
                      <CreditCard className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-medium text-gray-900">Connect Your Bank Account</h3>
                      <p className="text-sm text-gray-500">Set up automatic data import</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </Card>

              <Card className="p-4 hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-2 rounded-full">
                      <User className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-medium text-gray-900">Complete Your Profile</h3>
                      <p className="text-sm text-gray-500">Add your business details and branding</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </Card>

              <Card className="p-4 hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-100 p-2 rounded-full">
                      <MailOpen className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-medium text-gray-900">Invite Your Team</h3>
                      <p className="text-sm text-gray-500">Collaborate with colleagues</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </Card>
            </div>

            <Button onClick={() => router.push('/dashboard/enhanced-dashboard')} className="w-full">
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {currentStep > 0 && currentStep < steps.length - 1 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium text-gray-700">
                Step {currentStep} of {steps.length - 2}
              </p>
              <p className="text-sm text-gray-500">
                {onboardingProgress}% Complete
              </p>
            </div>
            <Progress value={onboardingProgress} className="h-2" />
          </div>
        )}

        <Card className="p-8">
          {renderStepContent()}
        </Card>
      </div>
    </div>
  )
}
