"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FeedActions } from "@/components/rss/FeedActions";
import { FeedMetricsChart } from "@/components/rss/FeedMetricsChart";
import { trpc } from "../../../../providers/trpc-provider";

export default function AdminRssDetailPage() {
  const params = useParams();
  const feedKey = decodeURIComponent(String(params?.feedKey || ""));

  const healthQuery = trpc.news.getFeedHealth.useQuery({ feedKey });

  if (!feedKey) return <div className="p-6">Invalid feed key</div>;
  if (healthQuery.isLoading) return <div className="p-6">Loading feed details...</div>;
  if (healthQuery.error) return <div className="p-6 text-red-600">{healthQuery.error.message}</div>;

  const row = (healthQuery.data || [])[0];
  if (!row) return <div className="p-6">Feed not found</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{feedKey}</h1>
        <Link href="/admin/rss" className="text-sm text-blue-600 hover:underline">
          Back to RSS Monitoring
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Kpi label="Status" value={row.health_status} />
        <Kpi label="Failures" value={String(row.consecutive_failures || 0)} />
        <Kpi
          label="Last Success"
          value={
            row.last_successful_fetch ? new Date(row.last_successful_fetch).toLocaleString() : "—"
          }
        />
        <Kpi label="24h%" value={String(row.success_rate_24h ?? "—")} />
        <Kpi label="7d%" value={String(row.success_rate_7d ?? "—")} />
        <div className="border rounded-md p-4">
          <div className="font-medium mb-2">Actions</div>
          <FeedActions feedKey={feedKey} currentStatus={row.health_status} />
        </div>
      </div>

      <FeedMetricsChart feedKey={feedKey} days={7} />

      {row.last_error ? (
        <div className="border rounded-md p-4">
          <div className="font-medium mb-2">Last Error</div>
          <pre className="whitespace-pre-wrap text-sm text-red-700">{row.last_error}</pre>
        </div>
      ) : null}
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="border rounded-md p-4">
      <div className="text-xs uppercase tracking-wide text-gray-600">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}
