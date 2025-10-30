"use client";

import Link from "next/link";
import { FeedHealthTable } from "../../../../../components/rss/FeedHealthTable";
import { trpc } from "../../../providers/trpc-provider";

export default function AdminRssPage() {
  const healthQuery = trpc.news.getFeedHealth.useQuery();
  const summaryQuery = trpc.news.getFeedHealthSummary.useQuery();

  if (healthQuery.isLoading || summaryQuery.isLoading) {
    return <div className="p-6">Loading RSS feed health...</div>;
  }

  if (healthQuery.error) {
    return <div className="p-6 text-red-600">Error: {healthQuery.error.message}</div>;
  }

  const data = healthQuery.data || [];
  const summary =
    summaryQuery.data ||
    ({ healthy: 0, degraded: 0, failing: 0, disabled: 0 } as {
      healthy: number;
      degraded: number;
      failing: number;
      disabled: number;
    });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">RSS Monitoring</h1>
        <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">
          Back to Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Healthy" value={summary.healthy} tone="green" />
        <KpiCard label="Degraded" value={summary.degraded} tone="yellow" />
        <KpiCard label="Failing" value={summary.failing} tone="orange" />
        <KpiCard label="Disabled" value={summary.disabled} tone="red" />
      </div>

      <FeedHealthTable items={data} />
    </div>
  );
}

function KpiCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "green" | "yellow" | "orange" | "red";
}) {
  const toneMap: Record<string, string> = {
    green: "bg-green-50 text-green-700 border-green-200",
    yellow: "bg-yellow-50 text-yellow-800 border-yellow-200",
    orange: "bg-orange-50 text-orange-800 border-orange-200",
    red: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <div className={`rounded-md border p-4 ${toneMap[tone]}`}>
      <div className="text-xs uppercase tracking-wide">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}
