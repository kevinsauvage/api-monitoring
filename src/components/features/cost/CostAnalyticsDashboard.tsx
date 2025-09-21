"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, PieChart, BarChart3, Calendar } from "lucide-react";
import CostTrendChart from "./CostTrendChart";
import CostByProviderChart from "./CostByProviderChart";
import CostByPeriodChart from "./CostByPeriodChart";
import RecentCostMetrics from "./RecentCostMetrics";
import CostTrackingButton from "./CostTrackingButton";
import CostSummaryCards from "./CostSummaryCards";
import type { JsonValue } from "@prisma/client/runtime/library";

interface CostAnalyticsDashboardProps {
  costAnalytics: {
    totalCost: number;
    averageCost: number;
    costByProvider: Array<{
      provider: string;
      totalCost: number;
      count: number;
    }>;
    costByPeriod: Array<{ period: string; totalCost: number; count: number }>;
    costTrend: Array<{ date: string; totalCost: number }>;
  };
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

export default function CostAnalyticsDashboard({
  costAnalytics,
  costMetrics,
}: CostAnalyticsDashboardProps) {
  const getCostChange = () => {
    if (costAnalytics.costTrend.length < 2)
      return { change: 0, isPositive: false };

    const latest = costAnalytics.costTrend[costAnalytics.costTrend.length - 1];
    const previous =
      costAnalytics.costTrend[costAnalytics.costTrend.length - 2];

    const change =
      ((latest.totalCost - previous.totalCost) / previous.totalCost) * 100;
    return { change: Math.abs(change), isPositive: change >= 0 };
  };

  const costChange = getCostChange();

  return (
    <div className="space-y-6">
      <CostSummaryCards
        totalCost={costAnalytics.totalCost}
        averageCost={costAnalytics.averageCost}
        costChange={costChange}
        totalMetrics={costMetrics.length}
      />

      <CostTrackingButton />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Cost Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CostTrendChart data={costAnalytics.costTrend} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="w-5 h-5 mr-2" />
                  Cost by Provider
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CostByProviderChart data={costAnalytics.costByProvider} />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Cost by Period
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CostByPeriodChart data={costAnalytics.costByPeriod} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Cost Trend Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CostTrendChart data={costAnalytics.costTrend} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="providers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="w-5 h-5 mr-2" />
                Cost Distribution by Provider
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CostByProviderChart data={costAnalytics.costByProvider} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Recent Cost Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RecentCostMetrics costMetrics={costMetrics} />
            </CardContent>
          </Card>

          <CostTrackingButton />
        </TabsContent>
      </Tabs>
    </div>
  );
}
