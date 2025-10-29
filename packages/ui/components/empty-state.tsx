import React from "react";
import { LucideIcon } from "lucide-react";

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}
    >
      {Icon && (
        <div className="mb-4 rounded-full bg-gray-100 dark:bg-dark-gray-200 p-6">
          <Icon className="h-12 w-12 text-gray-400 dark:text-gray-dark-400" />
        </div>
      )}
      <h3 className="text-header-6 font-semibold text-gray-900 dark:text-gray-dark-900 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-normal text-gray-600 dark:text-gray-dark-600 max-w-md mb-6">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
