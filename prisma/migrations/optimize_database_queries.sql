-- Enhanced database optimization for API monitoring platform
-- This migration adds comprehensive indexes and optimizations

-- ==============================================
-- COMPOSITE INDEXES FOR COMPLEX QUERIES
-- ==============================================

-- Optimize user-based health check queries with pagination
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_check_result_user_pagination" 
ON "CheckResult"("healthCheckId", "timestamp" DESC, "status") 
INCLUDE ("responseTime", "statusCode", "errorMessage");

-- Optimize dashboard queries with user filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_check_result_dashboard_optimized"
ON "CheckResult"("healthCheckId", "timestamp" DESC, "status", "responseTime")
INCLUDE ("statusCode", "errorMessage");

-- Optimize search queries across multiple fields
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_check_result_search_optimized"
ON "CheckResult"("healthCheckId", "timestamp" DESC)
WHERE "errorMessage" IS NOT NULL;

-- ==============================================
-- PARTIAL INDEXES FOR ACTIVE RECORDS
-- ==============================================

-- Optimize queries for active health checks only
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_health_check_active_optimized"
ON "HealthCheck"("apiConnectionId", "isActive", "lastExecutedAt")
WHERE "isActive" = true;

-- Optimize queries for active API connections only
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_api_connection_active_optimized"
ON "ApiConnection"("userId", "isActive", "createdAt")
WHERE "isActive" = true;

-- ==============================================
-- COVERING INDEXES FOR FREQUENT QUERIES
-- ==============================================

-- Covering index for health check execution queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_health_check_execution_covering"
ON "HealthCheck"("isActive", "lastExecutedAt", "apiConnectionId", "interval")
WHERE "isActive" = true;

-- Covering index for user dashboard queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_api_connection_user_covering"
ON "ApiConnection"("userId", "isActive", "createdAt", "name", "provider")
WHERE "isActive" = true;

-- ==============================================
-- SPECIALIZED INDEXES FOR ANALYTICS
-- ==============================================

-- Optimize time-series queries for metrics
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_check_result_metrics_time_series"
ON "CheckResult"("timestamp" DESC, "status", "responseTime")
WHERE "timestamp" >= NOW() - INTERVAL '90 days';

-- Optimize cost metrics queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_cost_metrics_optimized"
ON "CostMetric"("apiConnectionId", "timestamp" DESC, "period")
INCLUDE ("amount", "currency");

-- Optimize rate limit metrics queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_rate_limit_metrics_optimized"
ON "RateLimitMetric"("apiConnectionId", "timestamp" DESC, "endpoint")
INCLUDE ("limit", "remaining", "resetTime");

-- ==============================================
-- TEXT SEARCH OPTIMIZATION
-- ==============================================

-- GIN index for full-text search on error messages
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_check_result_error_message_gin"
ON "CheckResult" USING gin(to_tsvector('english', "errorMessage"))
WHERE "errorMessage" IS NOT NULL;

-- GIN index for full-text search on health check endpoints
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_health_check_endpoint_gin"
ON "HealthCheck" USING gin(to_tsvector('english', "endpoint"));

-- ==============================================
-- STATISTICS AND ANALYTICS
-- ==============================================

-- Update table statistics for better query planning
ANALYZE "CheckResult";
ANALYZE "HealthCheck";
ANALYZE "ApiConnection";
ANALYZE "CostMetric";
ANALYZE "RateLimitMetric";

-- ==============================================
-- QUERY OPTIMIZATION SETTINGS
-- ==============================================

-- Set work_mem for complex queries (adjust based on your server)
-- This should be set at the database level, not in migration
-- ALTER SYSTEM SET work_mem = '256MB';
-- ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
-- ALTER SYSTEM SET track_activity_query_size = 2048;
