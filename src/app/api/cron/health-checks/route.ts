import { NextResponse } from "next/server";

import { getCronService } from "@/lib/infrastructure/di";
import { log } from "@/lib/shared/utils/logger";

/**
 * Cron job endpoint for running health checks
 * This runs every minute to execute health checks that are due based on their individual intervals
 */
export async function GET() {
  try {
    log.info("Starting scheduled health checks");

    const cronService = getCronService();
    const now = new Date();

    // Get all active health checks that are due for execution
    const healthChecks = await cronService.getHealthChecksDueForExecution();

    // Filter out health checks for inactive connections
    const activeHealthChecks = healthChecks.filter(
      (hc) => hc.apiConnection.isActive
    );

    // Filter by actual interval - only execute checks that are truly due
    const readyToExecute = activeHealthChecks.filter((hc) => {
      if (!hc.lastExecutedAt) return true; // Never executed

      const timeSinceLastExecution =
        now.getTime() - hc.lastExecutedAt.getTime();
      return timeSinceLastExecution >= hc.interval * 1000;
    });

    log.info("Health checks execution status", {
      active: activeHealthChecks.length,
      ready: readyToExecute.length,
    });

    if (readyToExecute.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No health checks ready to execute",
        executed: 0,
        totalActive: activeHealthChecks.length,
      });
    }

    // Execute all ready health checks in parallel
    const results = await Promise.allSettled(
      readyToExecute.map(async (healthCheck) => {
        await cronService.executeHealthCheck(healthCheck);
        return { success: true };
      })
    );

    // Count results
    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    log.info("Health checks execution completed", {
      successful,
      failed,
    });

    return NextResponse.json({
      success: true,
      message: "Health checks executed successfully",
      executed: readyToExecute.length,
      successful,
      failed,
      totalActive: activeHealthChecks.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    log.error("Failed to execute scheduled health checks", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      {
        success: false,
        message: "Failed to execute health checks",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
