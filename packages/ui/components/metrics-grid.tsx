import {
  FroxStatCard,
  type FroxStatCardProps,
} from "./frox/frox-stat-card";

export interface MetricsGridProps {
  metrics: FroxStatCardProps[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export function MetricsGrid({
  metrics,
  columns = 4,
  className = "",
}: MetricsGridProps) {
  const gridColsClass =
    columns === 2
      ? "md:grid-cols-2"
      : columns === 3
        ? "md:grid-cols-2 lg:grid-cols-3"
        : "md:grid-cols-2 xl:grid-cols-4";

  return (
    <div className={`grid gap-4 ${gridColsClass} ${className}`}>
      {metrics.map((metric, index) => (
        <FroxStatCard key={index} {...metric} />
      ))}
    </div>
  );
}
