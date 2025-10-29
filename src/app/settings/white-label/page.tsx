'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowUp,
  Brush,
  Check,
  ChevronRight,
  Code,
  Copy,
  Globe,
  Palette,
  Save,
  Settings,
  Shield,
  Upload
} from 'lucide-react'

export default function WhiteLabelSettings() {
  const [activeTab, setActiveTab] = useState('branding')
  const [logo, setLogo] = useState<File | null>(null)
  const [favicon, setFavicon] = useState<File | null>(null)
  const [primaryColor, setPrimaryColor] = useState('#3b82f6')
  const [appName, setAppName] = useState('FinScore Analyzer')
  const [customDomain, setCustomDomain] = useState('')
  const [supportEmail, setSupportEmail] = useState('support@finscore.com')
  const [fromName, setFromName] = useState('FinScore Analyzer')

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogo(e.target.files[0])
    }
  }

  const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFavicon(e.target.files[0])
    }
  }

  const renderBrandingTab = () => (
    <div className="space-y-8">
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Brand Logo</h3>
        <div className="flex items-center gap-6">
          <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
            {logo ? (
              <img src={URL.createObjectURL(logo)} alt="Logo Preview" className="max-w-full max-h-full" />
            ) : (
              <div className="text-center text-gray-500">
                <Upload className="h-6 w-6 mx-auto mb-1" />
                <p className="text-xs">Upload Logo</p>
              </div>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Upload your company logo. Recommended size: 256x256px, PNG format.
            </p>
            <Input type="file" id="logo-upload" className="hidden" onChange={handleLogoChange} accept="image/png" />
            <Button asChild variant="outline">
              <label htmlFor="logo-upload">
                <Upload className="h-4 w-4 mr-2" />
                Choose File
              </label>
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Brand Colors</h3>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <Label htmlFor="primary-color">Primary Color</Label>
            <div className="relative">
              <Input
                type="color"
                id="primary-color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-12 h-10 p-1"
              />
            </div>
            <span className="font-mono text-sm">{primaryColor}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded" style={{ backgroundColor: primaryColor }}></div>
            <div className="w-8 h-8 rounded" style={{ backgroundColor: primaryColor, opacity: 0.8 }}></div>
            <div className="w-8 h-8 rounded" style={{ backgroundColor: primaryColor, opacity: 0.6 }}></div>
            <div className="w-8 h-8 rounded" style={{ backgroundColor: primaryColor, opacity: 0.4 }}></div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Application Name</h3>
        <div className="max-w-md">
          <Label htmlFor="app-name">Name</Label>
          <Input
            id="app-name"
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            className="mt-1"
          />
          <p className="text-xs text-gray-500 mt-1">
            This name will appear throughout the application.
          </p>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Favicon</h3>
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
            {favicon ? (
              <img src={URL.createObjectURL(favicon)} alt="Favicon Preview" className="max-w-full max-h-full" />
            ) : (
              <div className="text-center text-gray-500">
                <Upload className="h-5 w-5 mx-auto" />
              </div>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Upload your favicon. Recommended size: 32x32px, ICO or PNG format.
            </p>
            <Input type="file" id="favicon-upload" className="hidden" onChange={handleFaviconChange} accept="image/x-icon,image/png" />
            <Button asChild variant="outline">
              <label htmlFor="favicon-upload">
                <Upload className="h-4 w-4 mr-2" />
                Choose File
              </label>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )

  const renderDomainTab = () => (
    <div className="space-y-8">
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Custom Domain</h3>
        <div className="max-w-xl">
          <p className="text-sm text-gray-600 mb-4">
            Set up a custom domain to serve the application from your own URL.
          </p>
          <Label htmlFor="custom-domain">Domain Name</Label>
          <div className="flex mt-1">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
              https://
            </span>
            <Input
              id="custom-domain"
              placeholder="app.yourcompany.com"
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              className="rounded-l-none"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">DNS Configuration</h3>
        <p className="text-sm text-gray-600 mb-4">
          To point your domain to our servers, create a CNAME record with your DNS provider.
        </p>
        <div className="space-y-3">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-xs text-gray-500">Record Type</p>
            <p className="font-mono text-sm">CNAME</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-xs text-gray-500">Host</p>
            <p className="font-mono text-sm">{customDomain || 'app.yourcompany.com'}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-xs text-gray-500">Points to</p>
            <div className="flex items-center justify-between">
              <p className="font-mono text-sm">whitelabel.finscore.com</p>
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                <Copy className="h-3 w-3" />
                <span>Copy</span>
              </Button>
            </div>
          </div>
        </div>
        <div className="mt-6 flex items-center gap-2">
          <Button>
            <Check className="h-4 w-4 mr-2" />
            Verify Domain
          </Button>
          <p className="text-sm text-gray-500">
            DNS changes can take up to 48 hours to propagate.
          </p>
        </div>
      </Card>
    </div>
  )

  const renderEmailTab = () => (
    <div className="space-y-8">
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Sender Email</h3>
        <div className="max-w-md">
          <Label htmlFor="support-email">Support Email Address</Label>
          <Input
            id="support-email"
            type="email"
            value={supportEmail}
            onChange={(e) => setSupportEmail(e.target.value)}
            className="mt-1"
          />
          <p className="text-xs text-gray-500 mt-1">
            This email will be used for all outgoing system communications.
          </p>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Sender Name</h3>
        <div className="max-w-md">
          <Label htmlFor="from-name">&quot;From&quot; Name</Label>
          <Input
            id="from-name"
            value={fromName}
            onChange={(e) => setFromName(e.target.value)}
            className="mt-1"
          />
          <p className="text-xs text-gray-500 mt-1">
            The name that appears in the &quot;From&quot; field of emails.
          </p>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Email Templates</h3>
        <p className="text-sm text-gray-600 mb-4">
          Customize the look and feel of system emails.
        </p>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
            <p className="font-medium">Welcome Email</p>
            <Button variant="outline" size="sm">
              <Palette className="h-4 w-4 mr-2" />
              Customize
            </Button>
          </div>
          <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
            <p className="font-medium">Password Reset</p>
            <Button variant="outline" size="sm">
              <Palette className="h-4 w-4 mr-2" />
              Customize
            </Button>
          </div>
          <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
            <p className="font-medium">Report Notification</p>
            <Button variant="outline" size="sm">
              <Palette className="h-4 w-4 mr-2" />
              Customize
            </Button>
          </div>
          <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
            <p className="font-medium">Anomaly Alert</p>
            <Button variant="outline" size="sm">
              <Palette className="h-4 w-4 mr-2" />
              Customize
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )

  const renderAdvancedTab = () => (
    <div className="space-y-8">
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Custom CSS</h3>
        <div className="space-y-2">
          <Label htmlFor="custom-css">Custom Stylesheet</Label>
          <textarea
            id="custom-css"
            rows={10}
            className="w-full p-2 font-mono text-sm border border-gray-300 rounded-md"
            placeholder="/* Your custom CSS rules here */"
          ></textarea>
          <p className="text-xs text-gray-500">
            Apply custom styles to override the default application appearance. Use with caution.
          </p>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Custom JavaScript</h3>
        <div className="space-y-2">
          <Label htmlFor="custom-js">Custom Script</Label>
          <textarea
            id="custom-js"
            rows={10}
            className="w-full p-2 font-mono text-sm border border-gray-300 rounded-md"
            placeholder="// Your custom JavaScript here"
          ></textarea>
          <p className="text-xs text-gray-500">
            Inject custom JavaScript. This can be used for custom analytics or integrations.
          </p>
        </div>
      </Card>

      <Card className="p-6 border-red-200 bg-red-50">
        <h3 className="text-lg font-medium text-red-800 mb-4">Danger Zone</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Reset to Default</p>
            <p className="text-sm text-gray-600">
              This will remove all white-label customizations and restore default settings.
            </p>
          </div>
          <Button variant="destructive">Reset All Settings</Button>
        </div>
      </Card>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">White-Label Settings</h1>
            <p className="text-gray-500 mt-1">
              Customize the application&apos;s appearance to match your brand.
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            <span>Save Changes</span>
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <Card className="p-2">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              orientation="vertical"
              className="w-full"
            >
              <TabsList className="flex flex-col h-auto w-full">
                <TabsTrigger value="branding" className="w-full justify-start p-3">
                  <Palette className="h-4 w-4 mr-2" />
                  Branding
                </TabsTrigger>
                <TabsTrigger value="domain" className="w-full justify-start p-3">
                  <Globe className="h-4 w-4 mr-2" />
                  Domain
                </TabsTrigger>
                <TabsTrigger value="email" className="w-full justify-start p-3">
                  <Code className="h-4 w-4 mr-2" />
                  Email
                </TabsTrigger>
                <TabsTrigger value="advanced" className="w-full justify-start p-3">
                  <Settings className="h-4 w-4 mr-2" />
                  Advanced
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Tabs value={activeTab}>
            <TabsContent value="branding">{renderBrandingTab()}</TabsContent>
            <TabsContent value="domain">{renderDomainTab()}</TabsContent>
            <TabsContent value="email">{renderEmailTab()}</TabsContent>
            <TabsContent value="advanced">{renderAdvancedTab()}</TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

