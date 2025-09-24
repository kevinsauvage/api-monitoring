"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { UptimeData } from "@/lib/shared/types";

export default function UptimeChart({ data }: { data: UptimeData }) {
  // Process data for the last 7 days
  const chartData = data
    .slice(0, 7) // Last 7 data points
    .map((item) => ({
      date: new Date(item.timestamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      uptime: item.uptime,
      checks: item.checks,
    }))
    .reverse();

  const averageUptime =
    data.length > 0
      ? data.reduce((sum, item) => sum + item.uptime, 0) / data.length
      : 0;

  const totalChecks = data.reduce((sum, item) => sum + item.checks, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Uptime Trend</CardTitle>
            <CardDescription>
              System uptime over the last 7 days
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              {averageUptime.toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground">
              {totalChecks} total checks
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="uptimeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(142, 76%, 36%)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(142, 76%, 36%)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                label={{ value: "%", angle: -90, position: "insideLeft" }}
                domain={[0, 100]}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload?.length) {
                    const payloadData = payload[0].payload as {
                      checks: number;
                    };
                    return (
                      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                        <p className="text-sm font-medium">{label}</p>
                        <p className="text-sm">
                          <span className="text-green-600">Uptime: </span>
                          {payload[0].value}%
                        </p>
                        <p className="text-sm">
                          <span className="text-blue-600">Checks: </span>
                          {payloadData.checks}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="uptime"
                stroke="hsl(142, 76%, 36%)"
                strokeWidth={2}
                fill="url(#uptimeGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
