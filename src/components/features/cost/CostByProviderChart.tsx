"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface CostByProviderChartProps {
  data: Array<{ provider: string; totalCost: number; count: number }>;
}

const COLORS = [
  "#3b82f6", // Blue
  "#10b981", // Green
  "#f59e0b", // Yellow
  "#ef4444", // Red
  "#8b5cf6", // Purple
  "#06b6d4", // Cyan
  "#84cc16", // Lime
  "#f97316", // Orange
];

export default function CostByProviderChart({
  data,
}: CostByProviderChartProps) {
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
  }: {
    active?: boolean;
    payload?: Array<{
      payload: { provider: string; totalCost: number; count: number };
    }>;
  }) => {
    if (active && payload?.length) {
      const data = payload[0]?.payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {data?.provider}
          </p>
          <p className="text-sm text-blue-600 dark:text-blue-400">
            Cost: {formatCurrency(data?.totalCost ?? 0)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {data?.count ?? 0} records
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({
    payload,
  }: {
    payload?: Array<{ value: string; color: string }>;
  }) => {
    return (
      <div className="flex flex-wrap gap-2 mt-4">
        {payload?.map((entry) => (
          <div key={entry.value} className="flex items-center text-sm">
            <div
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: entry?.color }}
            />
            <span className="text-gray-700 dark:text-gray-300">
              {entry?.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  if (!data?.length) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <p className="text-lg font-medium">No provider data available</p>
          <p className="text-sm">Cost data will appear here once collected</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({
              provider,
              totalCost,
            }: {
              provider: string;
              totalCost: number;
            }) => `${provider}: ${formatCurrency(totalCost)}`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="totalCost"
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
