"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Target,
} from "lucide-react";

interface StatusData {
  status: "SUCCESS" | "FAILURE" | "TIMEOUT" | "ERROR";
  count: number;
  percentage: number;
}

interface ConnectionSuccessRateChartProps {
  data: StatusData[];
  connectionName: string;
}

const COLORS = {
  SUCCESS: "hsl(142, 76%, 36%)", // green-600
  FAILURE: "hsl(0, 84%, 60%)", // red-500
  TIMEOUT: "hsl(38, 92%, 50%)", // amber-500
  ERROR: "hsl(0, 84%, 60%)", // red-500
};

const STATUS_ICONS = {
  SUCCESS: CheckCircle,
  FAILURE: XCircle,
  TIMEOUT: Clock,
  ERROR: AlertTriangle,
};

export default function ConnectionSuccessRateChart({
  data,
  connectionName,
}: ConnectionSuccessRateChartProps) {
  const chartData = data.map((item) => ({
    name: item.status,
    value: item.count,
    percentage: item.percentage,
  }));

  const totalChecks = data.reduce((sum, item) => sum + item.count, 0);
  const successRate =
    data.find((item) => item.status === "SUCCESS")?.percentage ?? 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Success Rate
            </CardTitle>
            <CardDescription>
              {connectionName} health check results distribution
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              {successRate.toFixed(1)}%
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
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload?.length) {
                    const data = payload[0] as {
                      name: string;
                      value: number;
                      payload: { percentage: number };
                    };
                    return (
                      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                        <p className="text-sm font-medium">{data.name}</p>
                        <p className="text-sm">
                          <span className="text-blue-600">Count: </span>
                          {data.value}
                        </p>
                        <p className="text-sm">
                          <span className="text-blue-600">Percentage: </span>
                          {data.payload.percentage.toFixed(1)}%
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                content={({ payload }) => (
                  <div className="flex flex-wrap justify-center gap-4 mt-4">
                    {payload?.map((entry, index) => {
                      const Icon =
                        STATUS_ICONS[entry.value as keyof typeof STATUS_ICONS];
                      return (
                        <div
                          key={index}
                          className="flex items-center space-x-2"
                        >
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: entry.color }}
                          />
                          <Icon className="w-4 h-4" />
                          <span className="text-sm">{entry.value}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
