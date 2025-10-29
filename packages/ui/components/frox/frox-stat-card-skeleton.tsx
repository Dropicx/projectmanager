"use client";

import * as React from "react";
import { FroxSkeleton } from "./frox-skeleton";

// ============================================================================
// FroxStatCard Skeleton Component
// ============================================================================

/**
 * Skeleton loading state for FroxStatCard
 * Matches the exact layout of FroxStatCard for seamless transition
 */
export const FroxStatCardSkeleton: React.FC = () => {
  return (
    <div className="bg-neutral-bg border border-neutral p-5 rounded-2xl dark:bg-dark-neutral-bg dark:border-dark-neutral-border">
      <div className="flex items-start justify-between mb-4">
        {/* Icon skeleton */}
        <FroxSkeleton className="h-12 w-12 rounded-lg" />

        {/* Dropdown menu skeleton (optional) */}
        <FroxSkeleton className="h-6 w-6 rounded" />
      </div>

      {/* Value skeleton */}
      <FroxSkeleton className="h-8 w-20 mb-2" />

      {/* Label skeleton */}
      <FroxSkeleton className="h-4 w-32 mb-3" />

      {/* Trend skeleton (optional) */}
      <div className="flex items-center gap-2">
        <FroxSkeleton className="h-4 w-4 rounded-full" />
        <FroxSkeleton className="h-3 w-24" />
      </div>
    </div>
  );
};

FroxStatCardSkeleton.displayName = "FroxStatCardSkeleton";
