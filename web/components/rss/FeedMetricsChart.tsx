"use client";

import { trpc } from "../../app/providers/trpc-provider";

export function FeedMetricsChart({ feedKey, days = 7 }: { feedKey: string; days?: number }) {
  const metricsQuery = trpc.news.getFeedMetrics.useQuery({ feedKey, sinceDays: days });

  if (metricsQuery.isLoading) return <div className="p-3">Loading metrics...</div>;
  if (metricsQuery.error)
    return <div className="p-3 text-red-600">Error: {metricsQuery.error.message}</div>;

  const metrics = metricsQuery.data || [];

  return (
    <div className="p-3 border rounded-md">
      <h3 className="font-medium mb-2">Metrics (last {days} days)</h3>
      <div className="text-xs text-gray-600 mb-3">Attempts: {metrics.length}</div>
      <div className="grid grid-cols-1 gap-2">
        {metrics
          .slice(0, 50)
          .map(
            (m: {
              id: string;
              fetch_timestamp: string;
              success: boolean;
              duration_ms?: number;
              articles_inserted?: number;
              articles_fetched?: number;
              error_message?: string;
            }) => (
              <div key={m.id} className="flex items-center justify-between text-sm border-b py-1">
                <div>{new Date(m.fetch_timestamp).toLocaleString()}</div>
                <div className={m.success ? "text-green-700" : "text-red-700"}>
                  {m.success ? "Success" : "Fail"}
                </div>
                <div>{m.duration_ms ?? 0} ms</div>
                <div>
                  +{m.articles_inserted ?? 0}/~{m.articles_fetched ?? 0}
                </div>
                <div className="truncate max-w-[40%] text-gray-500">{m.error_message || ""}</div>
              </div>
            )
          )}
      </div>
    </div>
  );
}
