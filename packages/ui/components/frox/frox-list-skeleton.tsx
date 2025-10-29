"use client";

import * as React from "react";
import { FroxSkeleton } from "./frox-skeleton";

// ============================================================================
// FroxList Skeleton Component
// ============================================================================

export interface FroxListSkeletonProps {
  /** Number of list items to show */
  items?: number;
  /** Show thumbnail/image */
  showThumbnail?: boolean;
  /** Custom className */
  className?: string;
}

/**
 * Skeleton loading state for list view layouts
 * Used when content is displayed in list/row format
 */
export const FroxListSkeleton: React.FC<FroxListSkeletonProps> = ({
  items = 3,
  showThumbnail = false,
  className = "",
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: items }).map((_, index) => (
        <div
          key={index}
          className="bg-white border border-gray-200 dark:border-dark-neutral-border rounded-2xl p-4 dark:bg-dark-neutral-bg"
        >
          <div className="flex items-start gap-4">
            {/* Thumbnail skeleton */}
            {showThumbnail && (
              <FroxSkeleton className="w-24 h-24 flex-shrink-0 rounded-lg" />
            )}

            {/* Icon skeleton (if no thumbnail) */}
            {!showThumbnail && (
              <FroxSkeleton className="h-10 w-10 flex-shrink-0 rounded-lg" />
            )}

            {/* Content */}
            <div className="flex-1 space-y-2">
              {/* Title and badge */}
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <FroxSkeleton className="h-5 w-3/4" />
                  <FroxSkeleton className="h-4 w-full" />
                </div>
                <FroxSkeleton className="h-6 w-16 ml-4 rounded-full" />
              </div>

              {/* Meta information */}
              <div className="flex items-center gap-4">
                <FroxSkeleton className="h-3 w-20" />
                <FroxSkeleton className="h-3 w-24" />
                <FroxSkeleton className="h-3 w-28" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

FroxListSkeleton.displayName = "FroxListSkeleton";
