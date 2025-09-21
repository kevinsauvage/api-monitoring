"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { JsonValue } from "@prisma/client/runtime/library";
import { formatDistanceToNow } from "date-fns";

interface RecentCostMetricsProps {
  costMetrics: Array<{
    id: string;
    amount: number;
    currency: string;
    period: string;
    timestamp: Date;
    metadata: JsonValue;
    apiConnection: {
      name: string;
      provider: string;
    };
  }>;
}

export default function RecentCostMetrics({
  costMetrics,
}: RecentCostMetricsProps) {
  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const getProviderIcon = (provider: string) => {
    const icons: Record<string, string> = {
      stripe: "💳",
      twilio: "📱",
      sendgrid: "📧",
      github: "🐙",
      slack: "💬",
      custom: "🔗",
    };
    return icons[provider] || "🔗";
  };

  const getProviderColor = (provider: string) => {
    const colors: Record<string, string> = {
      stripe: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      twilio: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      sendgrid:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      github: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
      slack:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      custom:
        "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    };
    return (
      colors[provider] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    );
  };

  if (!costMetrics?.length) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <p className="text-lg font-medium">No cost metrics available</p>
          <p className="text-sm">Cost data will appear here once collected</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Recent Cost Metrics</h3>
        <Badge variant="secondary">{costMetrics.length} records</Badge>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Provider</TableHead>
              <TableHead>Connection</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {costMetrics.slice(0, 10).map((metric) => (
              <TableRow key={metric.id}>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">
                      {getProviderIcon(metric.apiConnection.provider)}
                    </span>
                    <Badge
                      variant="secondary"
                      className={getProviderColor(
                        metric.apiConnection.provider
                      )}
                    >
                      {metric.apiConnection.provider}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  {metric.apiConnection.name}
                </TableCell>
                <TableCell className="font-mono">
                  {formatCurrency(metric.amount, metric.currency)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{metric.period}</Badge>
                </TableCell>
                <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDistanceToNow(new Date(metric.timestamp), {
                    addSuffix: true,
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {costMetrics.length > 10 && (
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          Showing 10 of {costMetrics.length} records
        </div>
      )}
    </div>
  );
}
