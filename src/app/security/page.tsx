'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Lock,
  Eye,
  FileCheck,
  Server,
  Globe,
  CheckCircle,
  Award,
  AlertTriangle,
  Users,
  Database,
  Key,
  RefreshCw,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SecurityPage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [ipRestrictions, setIpRestrictions] = useState(false);
  const [autoLogout, setAutoLogout] = useState(true);
  const [sensitiveDataMasking, setSensitiveDataMasking] = useState(true);

  const securityFeatures = [
    {
      icon: Lock,
      title: "End-to-End Encryption",
      description: "All data is encrypted using AES-256 encryption both in transit and at rest.",
      details: "Military-grade encryption ensures your financial documents are always protected.",
      link: "/security/encryption"
    },
    {
      icon: Shield,
      title: "SOC 2 Type II Compliance",
      description: "Our platform adheres to SOC 2 Type II standards for security and privacy.",
      details: "Annual audits verify our commitment to protecting your data with rigorous controls.",
      link: "/security/compliance"
    },
    {
      icon: Key,
      title: "Multi-Factor Authentication",
      description: "Add an extra layer of security to your account with 2FA.",
      details: "Support for authenticator apps, SMS codes, and hardware security keys.",
      link: "/security/mfa"
    },
    {
      icon: FileCheck,
      title: "Audit Logging",
      description: "Comprehensive audit logs for all user and system activities.",
      details: "Track who accessed what data and when, with tamper-proof logging.",
      link: "/security/audit-logs"
    },
    {
      icon: Server,
      title: "Secure Cloud Infrastructure",
      description: "Hosted on enterprise-grade cloud infrastructure with redundancy.",
      details: "Multiple security layers including firewalls, IDS/IPS, and DDoS protection.",
      link: "/security/infrastructure"
    },
    {
      icon: Globe,
      title: "Data Residency Controls",
      description: "Your data remains in India, complying with local regulations.",
      details: "Multiple data centers across India ensure both compliance and resilience.",
      link: "/security/data-residency"
    }
  ];

  const complianceBadges = [
    { name: "RBI Compliant", color: "bg-green-100 text-green-800" },
    { name: "GDPR Ready", color: "bg-blue-100 text-blue-800" },
    { name: "ISO 27001", color: "bg-purple-100 text-purple-800" },
    { name: "NBFC Guidelines", color: "bg-yellow-100 text-yellow-800" },
    { name: "PCI DSS", color: "bg-red-100 text-red-800" },
    { name: "SOC 2 Type II", color: "bg-indigo-100 text-indigo-800" }
  ];

  const securityEvents = [
    {
      type: "Login Attempt",
      status: "Success",
      user: "ravi.kumar@example.com",
      location: "Mumbai, India",
      ip: "103.45.123.45",
      time: "Today, 09:32 AM",
      device: "Windows 11 - Chrome"
    },
    {
      type: "Password Change",
      status: "Success",
      user: "admin@finscore.com",
      location: "Bangalore, India",
      ip: "49.207.221.78",
      time: "Yesterday, 04:17 PM",
      device: "macOS - Safari"
    },
    {
      type: "Login Attempt",
      status: "Failed",
      user: "sunil.gupta@example.com",
      location: "Unknown (VPN)",
      ip: "185.143.223.12",
      time: "Yesterday, 11:55 PM",
      device: "iOS - Mobile App"
    },
    {
      type: "Document Access",
      status: "Success",
      user: "priya.sharma@example.com",
      location: "Delhi, India",
      ip: "122.168.45.19",
      time: "Sep 23, 2025, 10:14 AM",
      device: "Android - Firefox"
    },
    {
      type: "API Key Generated",
      status: "Success",
      user: "system@finscore.com",
      location: "Hyderabad, India",
      ip: "Internal System",
      time: "Sep 21, 2025, 03:21 PM",
      device: "Server"
    }
  ];

  const handleGenerateReport = () => {
    setIsGenerating(true);
    console.log('Generating security compliance report...'); // Log instead of notification

    setTimeout(() => {
      setIsGenerating(false);
      console.log('Security compliance report generated and ready for download.'); // Log instead of notification
    }, 2500);
  };

  const handleMfaToggle = () => {
    setMfaEnabled(prev => !prev);
    console.log(mfaEnabled ? 'MFA Disabled' : 'MFA Enabled'); // Log instead of notification
  };

  // Function to handle navigating to detail pages for security features
  const navigateToFeature = (path: string) => {
    console.log(`Navigating to ${path} for detailed information...`); // Log instead of notification

    // Use Next.js router to navigate
    router.push(path);
  };
  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Security Center</h1>
              <p className="text-gray-600">Manage your account security and compliance settings</p>
            </div>
            <div className="flex gap-4">
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={handleGenerateReport}
                disabled={isGenerating}
              >
                {isGenerating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                {isGenerating ? "Generating..." : "Security Report"}
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Security Scan
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-4">
            {complianceBadges.map((badge) => (
              <motion.span
                key={badge.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}
              >
                {badge.name}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* Security Status Overview */}
        <div className="bg-white rounded-lg shadow-sm border border-green-200 p-6 mb-8">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <Shield className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-semibold text-gray-900">Security Status: Strong</h2>
              <p className="text-green-600">Your account security is up to date with all recommended protections.</p>
            </div>
            <div className="ml-auto flex items-center">
              <span className="text-sm font-medium text-gray-700 mr-3">Security Score</span>
              <div className="w-16 h-16 rounded-full flex items-center justify-center bg-green-100 border-4 border-green-200">
                <span className="text-xl font-bold text-green-700">92%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {securityFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-sm border p-6 cursor-pointer hover:shadow-md transition-all"
              onClick={() => navigateToFeature(feature.link)}
            >
              <div className="flex items-center mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="ml-3 text-lg font-semibold text-gray-900">{feature.title}</h3>
              </div>
              <p className="text-gray-700 mb-3">{feature.description}</p>
              <p className="text-sm text-gray-500">{feature.details}</p>
              <div className="mt-4 flex items-center text-blue-600 text-sm">
                <span>View details</span>
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Security Settings</h3>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
              <div>
                <h4 className="text-md font-medium text-gray-900">Multi-factor Authentication</h4>
                <p className="text-sm text-gray-500">Add an extra layer of security to your account login</p>
              </div>
              <button
                onClick={handleMfaToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${mfaEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${mfaEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
              <div>
                <h4 className="text-md font-medium text-gray-900">IP Address Restrictions</h4>
                <p className="text-sm text-gray-500">Restrict access to specific IP addresses or ranges</p>
              </div>
              <button
                onClick={() => {
                  setIpRestrictions(prev => !prev);
                  console.log(ipRestrictions ? 'IP Restrictions Disabled' : 'IP Restrictions Enabled'); // Log instead of notification
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${ipRestrictions ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${ipRestrictions ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
              <div>
                <h4 className="text-md font-medium text-gray-900">Auto-logout After Inactivity</h4>
                <p className="text-sm text-gray-500">Automatically log out after 30 minutes of inactivity</p>
              </div>
              <button
                onClick={() => {
                  setAutoLogout(prev => !prev);
                  console.log(autoLogout ? 'Auto-logout Disabled' : 'Auto-logout Enabled'); // Log instead of notification
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${autoLogout ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoLogout ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
              <div>
                <h4 className="text-md font-medium text-gray-900">Sensitive Data Masking</h4>
                <p className="text-sm text-gray-500">Mask sensitive data in reports and exports</p>
              </div>
              <button
                onClick={() => {
                  setSensitiveDataMasking(prev => !prev);
                  console.log(sensitiveDataMasking ? 'Data Masking Disabled' : 'Data Masking Enabled'); // Log instead of notification
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${sensitiveDataMasking ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${sensitiveDataMasking ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Recent Security Events */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Security Events</h3>
            <Link href="/security/audit-logs" className="text-sm text-blue-600 hover:text-blue-800">View All Events</Link>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {securityEvents.map((event, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{event.type}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        event.status === 'Success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.user}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.location}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.ip}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.time}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Data Compliance */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Data Compliance & Privacy</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-gray-50 rounded-lg">
              <h4 className="text-md font-medium text-gray-900 mb-4">Data Retention</h4>
              <p className="text-sm text-gray-600 mb-4">Your data is retained for 7 years in compliance with Indian financial regulations.</p>
              <div className="flex items-center text-sm text-gray-500">
                <FileCheck className="h-4 w-4 text-green-500 mr-2" />
                <span>Compliant with RBI Guidelines for NBFCs</span>
              </div>
            </div>

            <div className="p-6 bg-gray-50 rounded-lg">
              <h4 className="text-md font-medium text-gray-900 mb-4">Data Processing</h4>
              <p className="text-sm text-gray-600 mb-4">All data processing occurs within Indian territory on SOC 2 compliant servers.</p>
              <div className="flex items-center text-sm text-gray-500">
                <Globe className="h-4 w-4 text-green-500 mr-2" />
                <span>Data never leaves Indian territory</span>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mr-3 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Important Privacy Notice</h4>
                <p className="text-xs text-yellow-700 mt-1">
                  Password-protected bank statements uploaded to FinScore are processed solely for analysis purposes and are never shared with third parties unless required by law.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Recommendations */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Security Recommendations</h3>

          <div className="space-y-4">
            <div className="flex items-start p-4 bg-blue-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-gray-900">Enable multi-factor authentication</h4>
                <p className="text-xs text-gray-600 mt-1">Adding a second factor significantly improves your account security.</p>
                <button
                  onClick={handleMfaToggle}
                  className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-800"
                >
                  {mfaEnabled ? 'Disable MFA' : 'Enable MFA'}
                </button>
              </div>
            </div>

            <div className="flex items-start p-4 bg-blue-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-gray-900">Review API key permissions</h4>
                <p className="text-xs text-gray-600 mt-1">Ensure your API keys have the minimum required permissions.</p>
                <Link href="/security/api-keys" className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-800">
                  Manage API Keys
                </Link>
              </div>
            </div>

            <div className="flex items-start p-4 bg-blue-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-gray-900">Set up IP restrictions</h4>
                <p className="text-xs text-gray-600 mt-1">Limit access to your account from trusted IP addresses only.</p>
                <button
                  onClick={() => {
                    setIpRestrictions(prev => !prev);
                    console.log(ipRestrictions ? 'IP Restrictions Disabled' : 'IP Restrictions Enabled'); // Log instead of notification
                  }}
                  className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-800"
                >
                  {ipRestrictions ? 'Disable IP Restrictions' : 'Enable IP Restrictions'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
