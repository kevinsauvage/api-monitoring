-- Simple database optimization - essential indexes only

-- Index for user-based health check queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_check_result_user_timestamp" 
ON "CheckResult"("healthCheckId", "timestamp" DESC);

-- Index for status filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_check_result_status" 
ON "CheckResult"("status");

-- Index for active health checks
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_health_check_active" 
ON "HealthCheck"("isActive") WHERE "isActive" = true;

-- Index for active API connections
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_api_connection_active" 
ON "ApiConnection"("isActive") WHERE "isActive" = true;

-- Update table statistics
ANALYZE "CheckResult";
ANALYZE "HealthCheck";
ANALYZE "ApiConnection";
