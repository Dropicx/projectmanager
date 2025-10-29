"use client";

import * as React from "react";
import { FroxSkeleton } from "./frox-skeleton";

// ============================================================================
// FroxCard Skeleton Component
// ============================================================================

export interface FroxCardSkeletonProps {
  /** Show image placeholder */
  showImage?: boolean;
  /** Number of action buttons to show */
  actionButtons?: number;
  /** Custom className */
  className?: string;
}

/**
 * Skeleton loading state for generic content cards
 * Used in Projects, News, Knowledge pages
 */
export const FroxCardSkeleton: React.FC<FroxCardSkeletonProps> = ({
  showImage = false,
  actionButtons = 0,
  className = "",
}) => {
  return (
    <div className={`bg-white border border-gray-200 dark:border-dark-neutral-border rounded-2xl overflow-hidden dark:bg-dark-neutral-bg ${className}`}>
      {/* Image skeleton */}
      {showImage && <FroxSkeleton className="h-48 w-full rounded-none" />}

      {/* Card content */}
      <div className="p-6">
        {/* Header with icon and badge */}
        <div className="flex items-start justify-between mb-4">
          <FroxSkeleton className="h-10 w-10 rounded-lg" />
          <FroxSkeleton className="h-6 w-16 rounded-full" />
        </div>

        {/* Title */}
        <FroxSkeleton className="h-6 w-3/4 mb-2" />

        {/* Description */}
        <FroxSkeleton className="h-4 w-full mb-1" />
        <FroxSkeleton className="h-4 w-5/6 mb-4" />

        {/* Meta information */}
        <div className="flex items-center gap-4 mb-4">
          <FroxSkeleton className="h-4 w-24" />
          <FroxSkeleton className="h-4 w-32" />
        </div>

        {/* Action buttons */}
        {actionButtons > 0 && (
          <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-dark-neutral-border">
            {Array.from({ length: actionButtons }).map((_, i) => (
              <FroxSkeleton key={i} className="h-9 flex-1 rounded-lg" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

FroxCardSkeleton.displayName = "FroxCardSkeleton";
