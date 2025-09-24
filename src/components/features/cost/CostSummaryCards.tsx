"use client";

import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface CostSummaryCardsProps {
  totalCost: number;
  averageCost: number;
  costChange: { change: number; isPositive: boolean };
  totalMetrics: number;
}

export default function CostSummaryCards({
  totalCost,
  averageCost,
  costChange,
  totalMetrics,
}: CostSummaryCardsProps) {
  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const getCostStatus = (cost: number) => {
    if (cost === 0)
      return {
        status: "No Data",
        color: "text-gray-500",
        bgColor: "bg-gray-100",
      };
    if (cost < 10)
      return {
        status: "Low",
        color: "text-green-600",
        bgColor: "bg-green-100",
      };
    if (cost < 100)
      return {
        status: "Medium",
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
      };
    return { status: "High", color: "text-red-600", bgColor: "bg-red-100" };
  };

  const costStatus = getCostStatus(totalCost);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Cost */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Total Cost
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(totalCost)}
              </p>
              <div className="flex items-center mt-1">
                <Badge
                  variant="secondary"
                  className={`text-xs ${costStatus.color} ${costStatus.bgColor}`}
                >
                  {costStatus.status}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Average Cost */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Activity className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Average Cost
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(averageCost)}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                per metric
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost Change */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div
              className={`p-2 rounded-lg ${
                costChange.isPositive
                  ? "bg-red-100 dark:bg-red-900"
                  : "bg-green-100 dark:bg-green-900"
              }`}
            >
              {costChange.isPositive ? (
                <TrendingUp className="w-6 h-6 text-red-600 dark:text-red-400" />
              ) : (
                <TrendingDown className="w-6 h-6 text-green-600 dark:text-green-400" />
              )}
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Cost Change
              </p>
              <p
                className={`text-2xl font-bold ${
                  costChange.isPositive ? "text-red-600" : "text-green-600"
                }`}
              >
                {costChange.change.toFixed(1)}%
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                vs previous period
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Metrics */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Total Metrics
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {totalMetrics}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                cost records
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

