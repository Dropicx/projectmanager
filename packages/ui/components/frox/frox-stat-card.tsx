"use client";

import * as React from "react";
import { TrendingUp, TrendingDown, MoreVertical } from "lucide-react";
import { cn } from "../../lib/utils";

// ============================================================================
// Types
// ============================================================================

export interface FroxStatCardProps {
  /** Main value/metric to display */
  value: string | number;
  /** Label/description of the metric */
  label: string;
  /** Icon component */
  icon?: React.ComponentType<{ className?: string }>;
  /** Icon image src */
  iconSrc?: string;
  /** Icon background color */
  iconBgColor?: "yellow" | "orange" | "pink" | "green" | "blue" | "violet" | "red" | "sky";
  /** Trend direction */
  trend?: "up" | "down";
  /** Trend value (e.g., "34.7%") */
  trendValue?: string;
  /** Chart component or element */
  chart?: React.ReactNode;
  /** Dropdown menu actions */
  dropdownActions?: Array<{
    id: string;
    label: string;
    onClick: () => void;
    variant?: "default" | "danger";
  }>;
  /** Custom className */
  className?: string;
}

// ============================================================================
// Main Component
// ============================================================================

export const FroxStatCard = React.forwardRef<HTMLDivElement, FroxStatCardProps>(
  (
    {
      value,
      label,
      icon: Icon,
      iconSrc,
      iconBgColor = "green",
      trend,
      trendValue,
      chart,
      dropdownActions,
      className,
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col gap-y-4 bg-neutral-bg border border-neutral-accent p-5 rounded-2xl dark:bg-dark-neutral-bg dark:border-dark-neutral-border",
          className
        )}
      >
        {/* Top Row: Icon + Value + Chart + Dropdown */}
        <div className="flex items-center justify-between">
          {/* Icon + Value */}
          <div className="flex gap-x-2 items-center">
            {/* Icon */}
            <div
              className={cn(
                "p-2 rounded-lg",
                iconBgColor === "yellow" && "bg-yellow",
                iconBgColor === "orange" && "bg-orange",
                iconBgColor === "pink" && "bg-pink",
                iconBgColor === "green" && "bg-green",
                iconBgColor === "blue" && "bg-blue",
                iconBgColor === "violet" && "bg-violet",
                iconBgColor === "red" && "bg-red",
                iconBgColor === "sky" && "bg-sky"
              )}
            >
              {Icon && <Icon className="h-5 w-5 text-white" />}
              {iconSrc && <img src={iconSrc} alt="" className="h-5 w-5" />}
            </div>

            {/* Value */}
            <span className="text-gray-1100 font-bold dark:text-gray-dark-1100 text-[16px] leading-[16px]">
              {value}
            </span>
          </div>

          {/* Chart (if provided) */}
          {chart && (
            <div className="translate-x-4">
              {chart}
            </div>
          )}

          {/* Dropdown Menu */}
          {dropdownActions && dropdownActions.length > 0 && (
            <FroxStatCardDropdown actions={dropdownActions} />
          )}
        </div>

        {/* Bottom Row: Label + Trend */}
        <div className="flex items-center justify-between">
          {/* Label */}
          <span className="text-gray-500 text-xs dark:text-gray-dark-500">
            {label}
          </span>

          {/* Trend Indicator */}
          {trend && trendValue && (
            <FroxTrendIndicator
              direction={trend}
              value={trendValue}
            />
          )}
        </div>
      </div>
    );
  }
);

FroxStatCard.displayName = "FroxStatCard";

// ============================================================================
// Trend Indicator Component
// ============================================================================

export interface FroxTrendIndicatorProps {
  direction: "up" | "down";
  value: string;
  className?: string;
}

export const FroxTrendIndicator = React.forwardRef<
  HTMLDivElement,
  FroxTrendIndicatorProps
>(({ direction, value, className }, ref) => {
  const isUp = direction === "up";

  return (
    <div
      ref={ref}
      className={cn("flex items-center gap-x-[7px]", className)}
    >
      {isUp ? (
        <TrendingUp className="h-4 w-4 text-green" />
      ) : (
        <TrendingDown className="h-4 w-4 text-red" />
      )}
      <span
        className={cn(
          "font-medium text-[16px] leading-[16px]",
          isUp ? "text-green" : "text-red"
        )}
      >
        {value}
      </span>
    </div>
  );
});

FroxTrendIndicator.displayName = "FroxTrendIndicator";

// ============================================================================
// Stat Card Dropdown Component
// ============================================================================

interface FroxStatCardDropdownProps {
  actions: Array<{
    id: string;
    label: string;
    onClick: () => void;
    variant?: "default" | "danger";
  }>;
}

const FroxStatCardDropdown: React.FC<FroxStatCardDropdownProps> = ({ actions }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="dropdown dropdown-end translate-x-4 z-10 self-start relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer flex items-center justify-between py-2 px-4 hover:bg-gray-50 dark:hover:bg-gray-dark-50 rounded transition-colors"
      >
        <MoreVertical className="h-5 w-5 text-gray-400 dark:text-gray-dark-400" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Overlay */}
          <button
            type="button"
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
          />

          {/* Dropdown Content */}
          <div className="dropdown-content absolute right-0 z-20">
            <div className="relative menu rounded-box dropdown-shadow min-w-[126px] bg-neutral-bg mt-[10px] pt-[14px] pb-[7px] px-4 border border-neutral-border dark:text-gray-dark-500 dark:border-dark-neutral-border dark:bg-dark-neutral-bg">
              {/* Arrow Pointer */}
              <div className="border-solid border-b-8 border-x-transparent border-x-8 border-t-0 absolute w-[14px] top-[-7px] border-b-transparent right-[18px]" />

              {/* Menu Items */}
              <ul>
                {actions.map((action, index) => (
                  <React.Fragment key={action.id}>
                    <li className="text-normal mb-[7px]">
                      <button
                        type="button"
                        onClick={() => {
                          action.onClick();
                          setIsOpen(false);
                        }}
                        className="flex items-center bg-transparent p-0 gap-[7px] w-full text-left hover:opacity-75 transition-opacity"
                      >
                        <span
                          className={cn(
                            "text-[11px] leading-4",
                            action.variant === "danger"
                              ? "text-red"
                              : "text-gray-500 hover:text-gray-700 dark:text-gray-dark-500 dark:hover:text-gray-dark-700"
                          )}
                        >
                          {action.label}
                        </span>
                      </button>
                    </li>
                    {/* Separator before last item if it's a danger action */}
                    {action.variant === "danger" && index === actions.length - 1 && (
                      <div className="w-full bg-neutral h-[1px] my-[7px] dark:bg-dark-neutral-border" />
                    )}
                  </React.Fragment>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
