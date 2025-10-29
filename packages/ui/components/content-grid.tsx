"use client";

import React from "react";
import { type ViewMode } from "./filter-bar";

export interface ContentGridProps<T> {
  items: T[];
  viewMode?: ViewMode;
  renderCard: (item: T, index: number) => React.ReactNode;
  gridColumns?: 2 | 3 | 4;
  className?: string;
  emptyState?: React.ReactNode;
}

export function ContentGrid<T>({
  items,
  viewMode = "grid",
  renderCard,
  gridColumns = 3,
  className = "",
  emptyState,
}: ContentGridProps<T>) {
  if (items.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  const gridColsClass =
    gridColumns === 2
      ? "md:grid-cols-2"
      : gridColumns === 3
        ? "md:grid-cols-2 lg:grid-cols-3"
        : "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

  // Grid View
  if (viewMode === "grid") {
    return (
      <div className={`grid gap-4 ${gridColsClass} ${className}`}>
        {items.map((item, index) => renderCard(item, index))}
      </div>
    );
  }

  // List View
  if (viewMode === "list") {
    return (
      <div className={`space-y-3 ${className}`}>
        {items.map((item, index) => renderCard(item, index))}
      </div>
    );
  }

  // Timeline View
  if (viewMode === "timeline") {
    return (
      <div className={`relative space-y-6 ${className}`}>
        {/* Timeline axis */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-dark-gray-300" />

        {items.map((item, index) => (
          <div key={index} className="relative pl-12">
            {/* Timeline dot */}
            <div className="absolute left-2.5 top-6 h-3 w-3 rounded-full border-2 border-color-brands bg-white dark:bg-dark-neutral-bg" />
            {renderCard(item, index)}
          </div>
        ))}
      </div>
    );
  }

  return null;
}
