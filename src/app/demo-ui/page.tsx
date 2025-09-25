'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CheckCircle, AlertCircle, TrendingUp, Users, DollarSign, FileText } from 'lucide-react'

export default function ShadcnDemo() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const mockReports = [
    { id: 1, name: 'Q4 Financial Analysis', status: 'completed', risk: 'low', date: '2024-12-15' },
    { id: 2, name: 'Bank Statement Review', status: 'processing', risk: 'medium', date: '2024-12-14' },
    { id: 3, name: 'GST Compliance Check', status: 'pending', risk: 'high', date: '2024-12-13' },
  ]

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'default',
      processing: 'secondary',
      pending: 'outline'
    } as const
    return <Badge variant={variants[status as keyof typeof variants]}>{status}</Badge>
  }

  const getRiskBadge = (risk: string) => {
    const variants = {
      low: 'default',
      medium: 'secondary', 
      high: 'destructive'
    } as const
    return <Badge variant={variants[risk as keyof typeof variants]}>{risk} risk</Badge>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            🎨 Shadcn/UI Demo - Amazing UX Components
          </h1>
          <p className="text-xl text-gray-600">
            Experience the absolute best in modern React UI design
          </p>
        </div>

        {/* Alert Section */}
        <div className="space-y-4">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription>
              Your FinScore Analyzer now has the most beautiful UI components available.
            </AlertDescription>
          </Alert>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Navigation Errors Fixed!</AlertTitle>
            <AlertDescription>
              All API routes are now properly implemented with full CRUD operations.
            </AlertDescription>
          </Alert>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">+5.1% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$45,231</div>
              <p className="text-xs text-muted-foreground">+20.1% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Growth</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+12.5%</div>
              <p className="text-xs text-muted-foreground">+2.5% from last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Interactive Components */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Card */}
          <Card>
            <CardHeader>
              <CardTitle>Create New Report</CardTitle>
              <CardDescription>Generate a comprehensive financial analysis report</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="report-name">Report Name</Label>
                <Input id="report-name" placeholder="Enter report name..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="analysis-type">Analysis Type</Label>
                <Input id="analysis-type" placeholder="Comprehensive, Quick, Custom..." />
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button>Create Report</Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">Advanced Options</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Advanced Report Settings</DialogTitle>
                    <DialogDescription>
                      Configure detailed analysis parameters for your report.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="risk-threshold">Risk Threshold</Label>
                      <Input id="risk-threshold" placeholder="0.75" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="analysis-depth">Analysis Depth</Label>
                      <Input id="analysis-depth" placeholder="Deep" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setIsDialogOpen(false)}>
                      Apply Settings
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and tools</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" size="lg">
                📊 Generate Dashboard Report
              </Button>
              <Button className="w-full" variant="outline" size="lg">
                📤 Export All Data
              </Button>
              <Sheet>
                <SheetTrigger asChild>
                  <Button className="w-full" variant="secondary" size="lg">
                    ⚙️ System Settings
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>System Configuration</SheetTitle>
                    <SheetDescription>
                      Adjust your FinScore Analyzer settings and preferences.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="space-y-6 mt-6">
                    <div className="space-y-2">
                      <Label htmlFor="api-key">API Key</Label>
                      <Input id="api-key" type="password" placeholder="Enter your API key..." />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="webhook-url">Webhook URL</Label>
                      <Input id="webhook-url" placeholder="https://your-app.com/webhook" />
                    </div>
                    <Button className="w-full">Save Settings</Button>
                  </div>
                </SheetContent>
              </Sheet>
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
            <CardDescription>Overview of your latest financial analysis reports</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableCaption>A list of your recent financial reports.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Report Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Date Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.name}</TableCell>
                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                    <TableCell>{getRiskBadge(report.risk)}</TableCell>
                    <TableCell>{report.date}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">View</Button>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Feature Highlights */}
        <Card>
          <CardHeader>
            <CardTitle>✨ What Makes Shadcn/UI Amazing</CardTitle>
            <CardDescription>Why this is the absolute best React UI library</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold">🎨 Beautiful Design</h4>
                <p className="text-sm text-muted-foreground">
                  Modern, clean aesthetics that look professional out of the box
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">⚡ Copy & Paste</h4>
                <p className="text-sm text-muted-foreground">
                  Own your components - no package dependencies, just pure code
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">🔧 Fully Customizable</h4>
                <p className="text-sm text-muted-foreground">
                  Built with Tailwind CSS, customize every aspect easily
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">♿ Accessible</h4>
                <p className="text-sm text-muted-foreground">
                  Built on Radix UI primitives for excellent accessibility
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">🚀 Developer Experience</h4>
                <p className="text-sm text-muted-foreground">
                  TypeScript-first with excellent IntelliSense support
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">📱 Responsive</h4>
                <p className="text-sm text-muted-foreground">
                  Mobile-first design that works perfectly on all devices
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}