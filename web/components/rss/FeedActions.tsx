"use client";

import { useState } from "react";
import { trpc } from "../../app/providers/trpc-provider";

export function FeedActions({
  feedKey,
  currentStatus,
}: {
  feedKey: string;
  currentStatus: "healthy" | "degraded" | "failing" | "disabled";
}) {
  const utils = trpc.useUtils();
  const [busy, setBusy] = useState(false);

  const updateStatus = trpc.news.updateFeedStatus.useMutation({
    onSuccess: async () => {
      await utils.news.getFeedHealth.invalidate();
    },
  });
  const syncFeed = trpc.news.syncRssFeed.useMutation({
    onSuccess: async () => {
      await utils.news.getFeedHealth.invalidate();
    },
  });

  const isDisabled = currentStatus === "disabled";

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        className="px-2 py-1 text-xs rounded border hover:bg-gray-50 disabled:opacity-50"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            await updateStatus.mutateAsync({
              feedKey,
              status: isDisabled ? "healthy" : "disabled",
            });
          } finally {
            setBusy(false);
          }
        }}
      >
        {isDisabled ? "Enable" : "Disable"}
      </button>

      <button
        type="button"
        className="px-2 py-1 text-xs rounded border hover:bg-gray-50 disabled:opacity-50"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            await syncFeed.mutateAsync({ category: feedKey });
          } finally {
            setBusy(false);
          }
        }}
      >
        Sync Now
      </button>
    </div>
  );
}
