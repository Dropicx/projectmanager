"use client";

import React from "react";
import { Search, Grid3x3, List, Clock } from "lucide-react";
import { Input } from "./input";
import { Button } from "./button";
import { Badge } from "./badge";

export type ViewMode = "grid" | "list" | "timeline";

export interface FilterOption {
  id: string;
  label: string;
  count?: number;
  active?: boolean;
}

export interface FilterBarProps {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;

  quickFilters?: FilterOption[];
  onQuickFilterClick?: (filterId: string) => void;

  viewModes?: ViewMode[];
  currentView?: ViewMode;
  onViewChange?: (view: ViewMode) => void;

  actions?: React.ReactNode;

  className?: string;
}

const viewModeIcons: Record<ViewMode, React.ComponentType<{ className?: string }>> = {
  grid: Grid3x3,
  list: List,
  timeline: Clock,
};

const viewModeLabels: Record<ViewMode, string> = {
  grid: "Grid",
  list: "List",
  timeline: "Timeline",
};

export function FilterBar({
  searchPlaceholder = "Search...",
  searchValue = "",
  onSearchChange,
  quickFilters = [],
  onQuickFilterClick,
  viewModes = ["grid", "list"],
  currentView = "grid",
  onViewChange,
  actions,
  className = "",
}: FilterBarProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Top Row: Search and Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Actions */}
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {/* Bottom Row: Filters and View Modes */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Quick Filters */}
        {quickFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {quickFilters.map((filter) => (
              <Button
                key={filter.id}
                variant={filter.active ? "default" : "outline"}
                size="sm"
                onClick={() => onQuickFilterClick?.(filter.id)}
                className="h-8"
              >
                {filter.label}
                {filter.count !== undefined && (
                  <Badge
                    variant="secondary"
                    className="ml-1.5 h-5 px-1.5 text-xs"
                  >
                    {filter.count}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        )}

        {/* View Mode Switcher */}
        {viewModes.length > 1 && (
          <div className="flex items-center gap-1 rounded-lg border border-gray-200 dark:border-dark-neutral-border p-1 bg-white dark:bg-dark-neutral-bg">
            {viewModes.map((mode) => {
              const Icon = viewModeIcons[mode];
              const isActive = currentView === mode;
              return (
                <Button
                  key={mode}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onViewChange?.(mode)}
                  className="h-8 px-3"
                  title={viewModeLabels[mode]}
                >
                  <Icon className="h-4 w-4" />
                  <span className="ml-1.5 hidden sm:inline">
                    {viewModeLabels[mode]}
                  </span>
                </Button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
