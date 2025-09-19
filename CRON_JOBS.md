# 🕐 Next.js Cron Jobs for API Monitoring

## Overview

This application uses Next.js built-in cron job functionality to automatically run health checks every 5 minutes. This is much more efficient and reliable than custom background job systems.

## Configuration

### 1. Next.js Config (`next.config.ts`)

```typescript
const nextConfig: NextConfig = {
  experimental: {
    cron: {
      // Run health checks every 5 minutes
      "*/5 * * * *": "/api/cron/health-checks",
    },
  },
};
```

### 2. Cron Job Endpoint (`/api/cron/health-checks`)

The cron job automatically calls this endpoint every 5 minutes to:

- Fetch all active health checks from the database
- Execute them in parallel
- Store results in the database
- Log execution statistics

## How It Works

1. **Automatic Execution**: Next.js automatically calls `/api/cron/health-checks` every 5 minutes
2. **Database Query**: Fetches all active health checks and their API connections
3. **Parallel Execution**: Runs all health checks simultaneously for better performance
4. **Result Storage**: Stores all results in the database with timestamps and metadata
5. **Error Handling**: Continues execution even if some health checks fail

## Manual Triggers

### For Testing

```bash
# Trigger health checks manually
curl -X POST http://localhost:3000/api/monitoring/run-checks
```

### For All Users (Admin)

```bash
# Trigger all health checks (cron job endpoint)
curl -X GET http://localhost:3000/api/cron/health-checks
```

## Benefits of This Approach

✅ **Native Next.js Support**: Uses built-in functionality, no external dependencies
✅ **Serverless Compatible**: Works perfectly with Vercel, Netlify, and other platforms
✅ **Automatic Scaling**: Handles multiple instances automatically
✅ **Reliable**: Next.js manages the scheduling and execution
✅ **Simple**: No complex background job management needed
✅ **Debuggable**: Easy to test and monitor

## Monitoring

The cron job logs execution details:

- Number of health checks found
- Execution results (successful/failed)
- Timestamps and error details

Check your application logs to monitor cron job execution.

## Customization

To change the schedule, modify the cron expression in `next.config.ts`:

```typescript
cron: {
  // Every minute
  "* * * * *": "/api/cron/health-checks",

  // Every hour
  "0 * * * *": "/api/cron/health-checks",

  // Every 10 minutes
  "*/10 * * * *": "/api/cron/health-checks",
}
```

## Production Deployment

This approach works seamlessly in production environments:

- **Vercel**: Automatically handles cron jobs
- **Railway**: Supports Next.js cron jobs
- **Docker**: Works in containerized environments
- **Self-hosted**: Runs on any Node.js server

No additional configuration needed for deployment!
