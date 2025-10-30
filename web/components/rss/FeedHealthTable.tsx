"use client";

import Link from "next/link";
import { FeedActions } from "./FeedActions";

type FeedHealth = {
  feed_key: string;
  health_status: "healthy" | "degraded" | "failing" | "disabled";
  last_successful_fetch: string | null;
  consecutive_failures: number;
  success_rate_24h: number | null;
  success_rate_7d: number | null;
  last_error: string | null;
};

export function FeedHealthTable({ items }: { items: FeedHealth[] }) {
  return (
    <div className="overflow-x-auto border rounded-md">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="text-left p-3 font-medium">Feed</th>
            <th className="text-left p-3 font-medium">Status</th>
            <th className="text-left p-3 font-medium">Last Success</th>
            <th className="text-left p-3 font-medium">Failures</th>
            <th className="text-left p-3 font-medium">24h%</th>
            <th className="text-left p-3 font-medium">7d%</th>
            <th className="text-left p-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <Row key={it.feed_key} item={it} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Row({ item }: { item: FeedHealth }) {
  const statusTone: Record<FeedHealth["health_status"], string> = {
    healthy: "text-green-700",
    degraded: "text-yellow-700",
    failing: "text-orange-700",
    disabled: "text-red-700",
  };
  const last = item.last_successful_fetch
    ? new Date(item.last_successful_fetch).toLocaleString()
    : "—";
  return (
    <tr className="border-t">
      <td className="p-3">
        <Link
          href={`/admin/rss/${encodeURIComponent(item.feed_key)}`}
          className="text-blue-600 hover:underline"
        >
          {item.feed_key}
        </Link>
      </td>
      <td className={`p-3 font-medium ${statusTone[item.health_status]}`}>{item.health_status}</td>
      <td className="p-3">{last}</td>
      <td className="p-3">{item.consecutive_failures || 0}</td>
      <td className="p-3">{item.success_rate_24h ?? "—"}</td>
      <td className="p-3">{item.success_rate_7d ?? "—"}</td>
      <td className="p-3">
        <FeedActions feedKey={item.feed_key} currentStatus={item.health_status} />
      </td>
    </tr>
  );
}
