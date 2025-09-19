-- Add performance indexes for better query performance

-- Index for user-based queries
CREATE INDEX IF NOT EXISTS "idx_api_connection_user_id" ON "ApiConnection"("userId");
CREATE INDEX IF NOT EXISTS "idx_health_check_user_id" ON "HealthCheck"("apiConnectionId");
CREATE INDEX IF NOT EXISTS "idx_check_result_health_check_id" ON "CheckResult"("healthCheckId");

-- Index for active connections
CREATE INDEX IF NOT EXISTS "idx_api_connection_active" ON "ApiConnection"("isActive") WHERE "isActive" = true;

-- Index for active health checks
CREATE INDEX IF NOT EXISTS "idx_health_check_active" ON "HealthCheck"("isActive") WHERE "isActive" = true;

-- Index for timestamp-based queries (most common for monitoring)
CREATE INDEX IF NOT EXISTS "idx_check_result_timestamp" ON "CheckResult"("timestamp" DESC);
CREATE INDEX IF NOT EXISTS "idx_check_result_timestamp_status" ON "CheckResult"("timestamp" DESC, "status");

-- Index for connection-based result queries
CREATE INDEX IF NOT EXISTS "idx_check_result_connection_timestamp" ON "CheckResult"("healthCheckId", "timestamp" DESC);

-- Index for status-based queries
CREATE INDEX IF NOT EXISTS "idx_check_result_status" ON "CheckResult"("status");

-- Index for response time queries
CREATE INDEX IF NOT EXISTS "idx_check_result_response_time" ON "CheckResult"("responseTime");

-- Composite index for dashboard queries
CREATE INDEX IF NOT EXISTS "idx_check_result_dashboard" ON "CheckResult"("healthCheckId", "timestamp" DESC, "status", "responseTime");

-- Index for health check execution scheduling
CREATE INDEX IF NOT EXISTS "idx_health_check_execution" ON "HealthCheck"("isActive", "lastExecutedAt") WHERE "isActive" = true;
