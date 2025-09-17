"use client";

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Progress,
} from "@consulting-platform/ui";
import {
  Activity,
  AlertCircle,
  BarChart3,
  Brain,
  Calendar,
  DollarSign,
  Settings2,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { trpc as api } from "@/app/providers/trpc-provider";

export function AIUsageDashboard() {
  const [isEditing, setIsEditing] = useState(false);
  const [newLimits, setNewLimits] = useState({
    monthlyBudgetUSD: 100,
    dailyLimitUSD: 10,
  });

  // Fetch usage statistics
  const { data: usageStats, isLoading, error, refetch } = api.usage.getStats.useQuery();

  // Update limits mutation
  const updateLimitsMutation = api.usage.updateLimits.useMutation({
    onSuccess: () => {
      setIsEditing(false);
      refetch();
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-indigo-600" />
            AI Usage & Budget
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-indigo-600" />
            AI Usage & Budget
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-600">Error loading usage data</div>
        </CardContent>
      </Card>
    );
  }

  const monthlyPercentage = usageStats?.usage.monthly.percentUsed || 0;
  const dailyPercentage = usageStats?.usage.daily.percentUsed || 0;
  const isNearLimit = usageStats?.isNearLimit || false;

  const handleSaveLimits = () => {
    updateLimitsMutation.mutate(newLimits);
  };

  return (
    <Card className={isNearLimit ? "border-orange-400" : ""}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-indigo-600" />
            AI Usage & Budget
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-1"
          >
            <Settings2 className="h-4 w-4" />
            {isEditing ? "Cancel" : "Edit Limits"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Warning Banner */}
        {isNearLimit && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <p className="font-medium text-orange-900">Approaching Budget Limit</p>
              <p className="text-sm text-orange-700 mt-1">
                You've used {monthlyPercentage.toFixed(1)}% of your monthly AI budget. Consider
                upgrading your plan or optimizing AI usage.
              </p>
            </div>
          </div>
        )}

        {/* Usage Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Monthly Usage */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-indigo-600" />
                <span className="text-sm font-medium text-gray-700">Monthly Usage</span>
              </div>
              <span className="text-xs text-gray-500">{30 - new Date().getDate()} days left</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{usageStats?.formattedUsage.monthly}</p>
            <Progress
              value={monthlyPercentage}
              className="mt-3 h-2"
              indicatorClassName={monthlyPercentage > 80 ? "bg-orange-500" : "bg-indigo-600"}
            />
            <p className="text-xs text-gray-600 mt-1">
              {monthlyPercentage.toFixed(1)}% of monthly budget
            </p>
          </div>

          {/* Daily Usage */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-gray-700">Daily Usage</span>
              </div>
              <span className="text-xs text-gray-500">Today</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{usageStats?.formattedUsage.daily}</p>
            <Progress
              value={dailyPercentage}
              className="mt-3 h-2"
              indicatorClassName={dailyPercentage > 80 ? "bg-orange-500" : "bg-green-600"}
            />
            <p className="text-xs text-gray-600 mt-1">
              {dailyPercentage.toFixed(1)}% of daily limit
            </p>
          </div>

          {/* Cost Efficiency */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">Avg Cost/Request</span>
              </div>
              <span className="text-xs text-gray-500">This month</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">$0.08</p>
            <div className="flex items-center gap-1 mt-3">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-600">12% more efficient</span>
            </div>
            <p className="text-xs text-gray-600 mt-1">vs last month ($0.09)</p>
          </div>
        </div>

        {/* Budget Settings (Edit Mode) */}
        {isEditing && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Adjust Budget Limits
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="monthly-budget">Monthly Budget (USD)</Label>
                <Input
                  id="monthly-budget"
                  type="number"
                  min="10"
                  max="10000"
                  value={newLimits.monthlyBudgetUSD}
                  onChange={(e) =>
                    setNewLimits({
                      ...newLimits,
                      monthlyBudgetUSD: parseFloat(e.target.value),
                    })
                  }
                />
                <p className="text-xs text-gray-500 mt-1">Min: $10 • Max: $10,000</p>
              </div>
              <div>
                <Label htmlFor="daily-limit">Daily Limit (USD)</Label>
                <Input
                  id="daily-limit"
                  type="number"
                  min="1"
                  max="1000"
                  value={newLimits.dailyLimitUSD}
                  onChange={(e) =>
                    setNewLimits({
                      ...newLimits,
                      dailyLimitUSD: parseFloat(e.target.value),
                    })
                  }
                />
                <p className="text-xs text-gray-500 mt-1">Min: $1 • Max: $1,000</p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveLimits}
                disabled={updateLimitsMutation.isPending}
              >
                {updateLimitsMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        )}

        {/* Model Usage Breakdown */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Model Usage This Month
          </h3>
          <div className="space-y-2">
            {[
              { model: "Nova Lite", cost: "$3.20", usage: "53,333 tokens", percentage: 40 },
              { model: "Nova Pro", cost: "$8.00", usage: "10,000 tokens", percentage: 30 },
              { model: "Claude 3.7", cost: "$15.00", usage: "5,000 tokens", percentage: 20 },
              { model: "Llama 3", cost: "$1.50", usage: "15,000 tokens", percentage: 10 },
            ].map((model) => (
              <div
                key={model.model}
                className="flex items-center justify-between py-2 border-b last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-32">
                    <p className="text-sm font-medium text-gray-900">{model.model}</p>
                    <p className="text-xs text-gray-500">{model.usage}</p>
                  </div>
                  <div className="w-24">
                    <Progress value={model.percentage} className="h-1.5" />
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-700">{model.cost}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">💡 Cost Optimization Tips</h3>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Use Nova Lite for simple summaries and quick responses</li>
            <li>• Enable prompt caching for repetitive queries</li>
            <li>• Batch similar requests to reduce API calls</li>
            <li>• Review and optimize your prompt templates</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
