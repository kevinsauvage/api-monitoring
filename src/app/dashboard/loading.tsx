import { CardSkeleton, ChartSkeleton } from "@/components/shared/feedback/LoadingSkeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      {/* Performance Metrics Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>

      {/* Overview Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>

      {/* Charts Section Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      {/* Uptime Chart Skeleton */}
      <ChartSkeleton />

      {/* Recent Activity Skeleton */}
      <CardSkeleton />
    </div>
  );
}
