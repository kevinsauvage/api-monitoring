import type { CheckResultWithDetails } from "@/lib/core/repositories";

export function getStatusCounts(recentResults: CheckResultWithDetails[]) {
  return recentResults.reduce<Record<string, number>>((acc, result) => {
    acc[result.status] = (acc[result.status] ?? 0) + 1;
    return acc;
  }, {});
}

export function getResponseTimeData(recentResults: CheckResultWithDetails[]) {
  return recentResults.map((result) => ({
    timestamp: result.timestamp.toISOString(),
    responseTime: result.responseTime,
    status: result.status,
  }));
}

export function getStatusData(recentResults: CheckResultWithDetails[]) {
  const statusCounts = getStatusCounts(recentResults);
  const totalResults = recentResults.length;

  return Object.entries(statusCounts).map(([status, count]) => ({
    status: status as "SUCCESS" | "FAILURE" | "TIMEOUT" | "ERROR",
    count,
    percentage: totalResults > 0 ? (count / totalResults) * 100 : 0,
  }));
}

export function getSuccessRate(
  recentResults: CheckResultWithDetails[]
): number {
  if (recentResults.length === 0) return 0;

  const successCount = recentResults.filter(
    (result) => result.status === "SUCCESS"
  ).length;

  return (successCount / recentResults.length) * 100;
}

export function getAverageResponseTime(
  recentResults: CheckResultWithDetails[]
): number {
  if (recentResults.length === 0) return 0;

  const totalResponseTime = recentResults.reduce(
    (sum, result) => sum + result.responseTime,
    0
  );

  return totalResponseTime / recentResults.length;
}

export function getUptimeData(recentResults: CheckResultWithDetails[]) {
  const now = new Date();
  const uptimeData = [];

  // Generate data for the last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    // Filter results for this day
    const dayResults = recentResults.filter((result) => {
      const resultDate = new Date(result.timestamp);
      return resultDate >= date && resultDate < nextDay;
    });

    const totalChecks = dayResults.length;
    const successfulChecks = dayResults.filter(
      (r) => r.status === "SUCCESS"
    ).length;
    const uptime =
      totalChecks > 0 ? (successfulChecks / totalChecks) * 100 : 100;

    uptimeData.push({
      timestamp: date.toISOString(),
      uptime: Math.round(uptime * 100) / 100, // Round to 2 decimal places
      checks: totalChecks,
    });
  }

  return uptimeData;
}
