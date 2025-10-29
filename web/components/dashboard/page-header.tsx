"use client";

import { FroxBreadcrumb, type FroxBreadcrumbItem } from "@consulting-platform/ui";
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: FroxBreadcrumbItem[];
  actions?: ReactNode;
  children?: ReactNode;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  children,
}: PageHeaderProps) {
  return (
    <div className="space-y-4 mb-6">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <FroxBreadcrumb items={breadcrumbs} showHomeIcon={true} />
      )}

      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-header-1 font-bold text-gray-1100 dark:text-gray-dark-1100 tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-normal text-gray-500 dark:text-gray-dark-500">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>

      {children}
    </div>
  );
}
