"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import {
  LineChart,
  Line,
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
import type { SerializedCheckResultWithDetails } from "@/lib/core/serializers";
import { formatTimeForChart } from "@/lib/shared/utils/utils";

export default function ResponseTimeChart({
  data,
}: {
  data: SerializedCheckResultWithDetails[];
}) {
  // Process data for the last 24 hours
  const chartData = data
    .slice(0, 24) // Last 24 data points
    .map((item) => ({
      time: formatTimeForChart(item.timestamp),
      responseTime: item.responseTime,
      status: item.status,
    }))
    .reverse();

  const averageResponseTime =
    data.length > 0
      ? data.reduce((sum, item) => sum + item.responseTime, 0) / data.length
      : 0;

  const trend =
    data.length >= 2
      ? data[0].responseTime - data[data.length - 1].responseTime
      : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Response Time Trend</CardTitle>
            <CardDescription>
              Average response time over the last 24 hours
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {averageResponseTime.toFixed(0)}ms
            </div>
            <div
              className={`flex items-center text-sm ${
                trend < 0
                  ? "text-green-600"
                  : trend > 0
                    ? "text-red-600"
                    : "text-gray-600"
              }`}
            >
              {trend < 0 ? (
                <TrendingDown className="w-4 h-4 mr-1" />
              ) : trend > 0 ? (
                <TrendingUp className="w-4 h-4 mr-1" />
              ) : null}
              {Math.abs(trend).toFixed(0)}ms
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                label={{ value: "ms", angle: -90, position: "insideLeft" }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                        <p className="text-sm font-medium">{label}</p>
                        <p className="text-sm">
                          <span className="text-blue-600">Response Time: </span>
                          {payload[0]?.value}ms
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="responseTime"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                activeDot={{
                  r: 6,
                  stroke: "hsl(var(--primary))",
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
