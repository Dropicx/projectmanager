"use client";

import * as React from "react";
import { cn } from "../../lib/utils";

// ============================================================================
// Base Frox Skeleton Component
// ============================================================================

export interface FroxSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Custom className */
  className?: string;
}

/**
 * Base skeleton component using Frox color system
 * Uses gray-200 for light mode and gray-dark-200 for dark mode
 */
export const FroxSkeleton = React.forwardRef<HTMLDivElement, FroxSkeletonProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "animate-pulse rounded-md bg-gray-200 dark:bg-gray-dark-200",
          className
        )}
        {...props}
      />
    );
  }
);

FroxSkeleton.displayName = "FroxSkeleton";
