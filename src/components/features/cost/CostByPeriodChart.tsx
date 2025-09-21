"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface CostByPeriodChartProps {
  data: Array<{ period: string; totalCost: number; count: number }>;
}

export default function CostByPeriodChart({ data }: CostByPeriodChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{
      payload: { period: string; totalCost: number | null; count: number };
    }>;
    label?: string;
  }) => {
    if (active && payload?.length) {
      const data = payload[0]?.payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            Period: {label}
          </p>
          <p className="text-sm text-blue-600 dark:text-blue-400">
            Cost: {formatCurrency(data.totalCost ?? 0)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {data.count} records
          </p>
        </div>
      );
    }
    return null;
  };

  if (!data?.length) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <p className="text-lg font-medium">No period data available</p>
          <p className="text-sm">Cost data will appear here once collected</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis
            dataKey="period"
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatCurrency}
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="totalCost"
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
            className="opacity-80 hover:opacity-100 transition-opacity"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
