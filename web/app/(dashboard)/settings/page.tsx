"use client";

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Switch,
} from "@consulting-platform/ui";
import {
  Bell,
  ChevronRight,
  CreditCard,
  Download,
  Globe,
  Palette,
  Save,
  Settings,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { AIUsageDashboard } from "@/components/settings/ai-usage-dashboard";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    organizationName: "Consailt Inc.",
    organizationEmail: "admin@consailt.com",
    timezone: "America/New_York",
    language: "English",
    notifications: {
      email: true,
      push: true,
      projectUpdates: true,
      taskAssignments: true,
      teamInvites: true,
      weeklyReports: false,
    },
    security: {
      twoFactor: false,
      sessionTimeout: "30",
      ipWhitelist: false,
    },
    appearance: {
      theme: "light",
      compactMode: false,
      showTips: true,
    },
  });

  const handleNotificationChange = (key: string) => {
    setSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key as keyof typeof prev.notifications],
      },
    }));
  };

  const handleSecurityChange = (key: string) => {
    setSettings((prev) => ({
      ...prev,
      security: {
        ...prev.security,
        [key]:
          key === "sessionTimeout"
            ? prev.security.sessionTimeout
            : !prev.security[key as keyof typeof prev.security],
      },
    }));
  };

  const handleAppearanceChange = (key: string) => {
    setSettings((prev) => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        [key]: !prev.appearance[key as keyof typeof prev.appearance],
      },
    }));
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your organization and account preferences</p>
        </div>
        <Button className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>

      {/* Organization Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-indigo-600" />
            Organization Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="org-name">Organization Name</Label>
              <Input
                id="org-name"
                value={settings.organizationName}
                onChange={(e) => setSettings({ ...settings, organizationName: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="org-email">Organization Email</Label>
              <Input
                id="org-email"
                type="email"
                value={settings.organizationEmail}
                onChange={(e) => setSettings({ ...settings, organizationEmail: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <select
                id="timezone"
                className="w-full px-3 py-2 border rounded-lg"
                value={settings.timezone}
                onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
              >
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="Europe/London">London (GMT)</option>
                <option value="Europe/Paris">Paris (CET)</option>
                <option value="Asia/Tokyo">Tokyo (JST)</option>
              </select>
            </div>
            <div>
              <Label htmlFor="language">Language</Label>
              <select
                id="language"
                className="w-full px-3 py-2 border rounded-lg"
                value={settings.language}
                onChange={(e) => setSettings({ ...settings, language: e.target.value })}
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
                <option value="Chinese">Chinese</option>
                <option value="Japanese">Japanese</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-indigo-600" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-gray-500">Receive notifications via email</p>
              </div>
              <Switch
                checked={settings.notifications.email}
                onCheckedChange={() => handleNotificationChange("email")}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-gray-500">Receive browser push notifications</p>
              </div>
              <Switch
                checked={settings.notifications.push}
                onCheckedChange={() => handleNotificationChange("push")}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Project Updates</p>
                <p className="text-sm text-gray-500">Get notified about project changes</p>
              </div>
              <Switch
                checked={settings.notifications.projectUpdates}
                onCheckedChange={() => handleNotificationChange("projectUpdates")}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Task Assignments</p>
                <p className="text-sm text-gray-500">Get notified when assigned to tasks</p>
              </div>
              <Switch
                checked={settings.notifications.taskAssignments}
                onCheckedChange={() => handleNotificationChange("taskAssignments")}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Team Invites</p>
                <p className="text-sm text-gray-500">Get notified about team invitations</p>
              </div>
              <Switch
                checked={settings.notifications.teamInvites}
                onCheckedChange={() => handleNotificationChange("teamInvites")}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Weekly Reports</p>
                <p className="text-sm text-gray-500">Receive weekly summary reports</p>
              </div>
              <Switch
                checked={settings.notifications.weeklyReports}
                onCheckedChange={() => handleNotificationChange("weeklyReports")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-indigo-600" />
            Security Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-gray-500">Add an extra layer of security</p>
              </div>
              <Switch
                checked={settings.security.twoFactor}
                onCheckedChange={() => handleSecurityChange("twoFactor")}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Session Timeout</p>
                <p className="text-sm text-gray-500">Auto-logout after inactivity</p>
              </div>
              <select
                className="px-3 py-1 border rounded-lg"
                value={settings.security.sessionTimeout}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    security: { ...settings.security, sessionTimeout: e.target.value },
                  })
                }
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="120">2 hours</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">IP Whitelist</p>
                <p className="text-sm text-gray-500">Restrict access to specific IP addresses</p>
              </div>
              <Switch
                checked={settings.security.ipWhitelist}
                onCheckedChange={() => handleSecurityChange("ipWhitelist")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-indigo-600" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Theme</p>
                <p className="text-sm text-gray-500">Choose your preferred theme</p>
              </div>
              <select
                className="px-3 py-1 border rounded-lg"
                value={settings.appearance.theme}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    appearance: { ...settings.appearance, theme: e.target.value },
                  })
                }
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Compact Mode</p>
                <p className="text-sm text-gray-500">Reduce spacing for more content</p>
              </div>
              <Switch
                checked={settings.appearance.compactMode}
                onCheckedChange={() => handleAppearanceChange("compactMode")}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Show Tips</p>
                <p className="text-sm text-gray-500">Display helpful tips and hints</p>
              </div>
              <Switch
                checked={settings.appearance.showTips}
                onCheckedChange={() => handleAppearanceChange("showTips")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing & Plans */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-indigo-600" />
            Billing & Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg">
              <div>
                <p className="font-semibold text-indigo-900">Professional Plan</p>
                <p className="text-sm text-indigo-700">$99/month • Renews on Jan 1, 2024</p>
              </div>
              <Button variant="outline" size="sm">
                Manage Plan
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Payment Method</span>
              <span className="flex items-center gap-2">
                <span className="text-gray-900">•••• 4242</span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Billing Email</span>
              <span className="text-gray-900">billing@consailt.com</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Usage Dashboard */}
      <AIUsageDashboard />

      {/* Data & Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-indigo-600" />
            Data & Privacy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              <Download className="h-4 w-4 mr-2" />
              Download Your Data
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-red-600 hover:text-red-700"
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
