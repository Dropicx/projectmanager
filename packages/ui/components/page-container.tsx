import React from "react";
import {
  FroxBreadcrumb,
  type FroxBreadcrumbItem,
} from "./frox/frox-breadcrumb";

export interface PageContainerProps {
  breadcrumbs?: FroxBreadcrumbItem[];
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({
  breadcrumbs,
  title,
  description,
  actions,
  children,
  className = "",
}: PageContainerProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Section */}
      <div className="space-y-4">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <FroxBreadcrumb items={breadcrumbs} showHomeIcon />
        )}

        {/* Title and Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-header-2 font-bold text-gray-1100 dark:text-gray-dark-1100">
              {title}
            </h1>
            {description && (
              <p className="text-subtitle text-gray-500 dark:text-gray-dark-500">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2 shrink-0">{actions}</div>
          )}
        </div>
      </div>

      {/* Content */}
      {children}
    </div>
  );
}
