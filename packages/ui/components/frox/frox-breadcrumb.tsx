"use client";

import * as React from "react";
import { Home, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";

// ============================================================================
// Types
// ============================================================================

export interface FroxBreadcrumbItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
}

export interface FroxBreadcrumbProps {
  /** Breadcrumb items */
  items: FroxBreadcrumbItem[];
  /** Show home icon for first item */
  showHomeIcon?: boolean;
  /** Separator component */
  separator?: React.ReactNode;
  /** Custom className */
  className?: string;
  /** Size variant */
  size?: "sm" | "md";
}

// ============================================================================
// Main Component
// ============================================================================

export const FroxBreadcrumb = React.forwardRef<HTMLDivElement, FroxBreadcrumbProps>(
  (
    {
      items,
      showHomeIcon = true,
      separator,
      className,
      size = "sm",
    },
    ref
  ) => {
    const textSize = size === "sm" ? "text-xs" : "text-sm";

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-x-[11px]",
          textSize,
          className
        )}
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isFirst = index === 0;

          return (
            <React.Fragment key={item.id}>
              {/* Breadcrumb Item */}
              <div className="flex items-center gap-x-1">
                {/* Icon (home icon for first item if enabled) */}
                {isFirst && showHomeIcon ? (
                  <Home className="h-4 w-4 text-gray-500 dark:text-gray-dark-500" />
                ) : item.icon ? (
                  <item.icon className="h-4 w-4 text-gray-500 dark:text-gray-dark-500" />
                ) : null}

                {/* Label */}
                {item.href || item.onClick ? (
                  <button
                    type="button"
                    onClick={item.onClick}
                    className={cn(
                      "capitalize transition-colors hover:opacity-75",
                      isLast
                        ? "text-color-brands font-medium"
                        : "text-gray-500 dark:text-gray-dark-500"
                    )}
                  >
                    {item.label}
                  </button>
                ) : (
                  <span
                    className={cn(
                      "capitalize",
                      isLast
                        ? "text-color-brands font-medium"
                        : "text-gray-500 dark:text-gray-dark-500"
                    )}
                  >
                    {item.label}
                  </span>
                )}
              </div>

              {/* Separator */}
              {!isLast && (
                <div className="flex items-center">
                  {separator || (
                    <ChevronRight className="h-3 w-3 text-gray-400 dark:text-gray-dark-400" />
                  )}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  }
);

FroxBreadcrumb.displayName = "FroxBreadcrumb";
