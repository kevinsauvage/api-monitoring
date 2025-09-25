"use client";

import { useState, useEffect } from "react";

import { AlertTriangle, Clock, TrendingDown, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AlertConditionBuilderProps {
  alertType: string;
  threshold: number;
  onConditionChange: (condition: string) => void;
  onThresholdChange: (threshold: number) => void;
}

const CONDITION_TEMPLATES = {
  ERROR_RATE: {
    title: "Error Rate Alert",
    description: "Monitor the percentage of failed requests",
    icon: AlertTriangle,
    color: "text-red-600",
    bgColor: "bg-red-100 dark:bg-red-900",
    operators: [
      { value: "greater_than", label: "is greater than", symbol: ">" },
      { value: "greater_equal", label: "is greater than or equal to", symbol: ">=" },
    ],
    unit: "%",
    examples: [
      { condition: "Error rate > 5%", description: "Alert when more than 5% of requests fail" },
      { condition: "Error rate >= 10%", description: "Alert when 10% or more requests fail" },
    ],
  },
  RESPONSE_TIME: {
    title: "Response Time Alert",
    description: "Monitor API response times",
    icon: Clock,
    color: "text-orange-600",
    bgColor: "bg-orange-100 dark:bg-orange-900",
    operators: [
      { value: "greater_than", label: "is greater than", symbol: ">" },
      { value: "greater_equal", label: "is greater than or equal to", symbol: ">=" },
    ],
    unit: "ms",
    examples: [
      { condition: "Response time > 2000ms", description: "Alert when responses take longer than 2 seconds" },
      { condition: "Response time >= 5000ms", description: "Alert when responses take 5+ seconds" },
    ],
  },
  UPTIME: {
    title: "Uptime Alert",
    description: "Monitor service availability",
    icon: TrendingDown,
    color: "text-green-600",
    bgColor: "bg-green-100 dark:bg-green-900",
    operators: [
      { value: "less_than", label: "is less than", symbol: "<" },
      { value: "less_equal", label: "is less than or equal to", symbol: "<=" },
    ],
    unit: "%",
    examples: [
      { condition: "Uptime < 99%", description: "Alert when uptime drops below 99%" },
      { condition: "Uptime <= 95%", description: "Alert when uptime is 95% or lower" },
    ],
  },
  RATE_LIMIT: {
    title: "Rate Limit Alert",
    description: "Monitor API rate limiting",
    icon: TrendingUp,
    color: "text-purple-600",
    bgColor: "bg-purple-100 dark:bg-purple-900",
    operators: [
      { value: "greater_than", label: "is greater than", symbol: ">" },
      { value: "greater_equal", label: "is greater than or equal to", symbol: ">=" },
    ],
    unit: "requests/min",
    examples: [
      { condition: "Rate limit > 1000", description: "Alert when exceeding 1000 requests per minute" },
      { condition: "Rate limit >= 500", description: "Alert when approaching rate limits" },
    ],
  },
  CUSTOM: {
    title: "Custom Alert",
    description: "Define your own monitoring condition",
    icon: AlertTriangle,
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-900",
    operators: [],
    unit: "",
    examples: [],
  },
};

export default function AlertConditionBuilder({
  alertType,
  threshold,
  onConditionChange,
  onThresholdChange,
}: AlertConditionBuilderProps) {
  const [operator, setOperator] = useState<string>("greater_than");
  const [timeWindow, setTimeWindow] = useState<string>("5");

  const template = CONDITION_TEMPLATES[alertType as keyof typeof CONDITION_TEMPLATES];
  const Icon = template.icon;

  useEffect(() => {
    if (template.operators.length > 0) {
      const operatorSymbol = template.operators.find(op => op.value === operator)?.symbol || ">";
      const condition = `${template.title.toLowerCase().replace(" alert", "")} ${operatorSymbol} ${threshold}${template.unit}`;
      onConditionChange(condition);
    }
  }, [alertType, operator, threshold, onConditionChange, template]);

  if (alertType === "CUSTOM") {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className={`p-2 rounded-lg ${template.bgColor}`}>
            <Icon className={`h-5 w-5 ${template.color}`} />
          </div>
          <div>
            <h4 className="font-medium">{template.title}</h4>
            <p className="text-sm text-muted-foreground">{template.description}</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <FormLabel>Custom Condition</FormLabel>
          <Input
            placeholder="e.g., custom_metric > 100, specific_error_count >= 5"
            onChange={(e) => onConditionChange(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Define your own monitoring condition using any metric or expression
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className={`p-2 rounded-lg ${template.bgColor}`}>
          <Icon className={`h-5 w-5 ${template.color}`} />
        </div>
        <div>
          <h4 className="font-medium">{template.title}</h4>
          <p className="text-sm text-muted-foreground">{template.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <FormLabel>Operator</FormLabel>
          <Select value={operator} onValueChange={setOperator}>
            <FormControl>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {template.operators.map((op) => (
                <SelectItem key={op.value} value={op.value}>
                  {op.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <FormLabel>Threshold Value</FormLabel>
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              value={threshold}
              onChange={(e) => onThresholdChange(parseFloat(e.target.value) || 0)}
              step="0.01"
              min="0"
            />
            <span className="text-sm text-muted-foreground">{template.unit}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <FormLabel>Time Window (minutes)</FormLabel>
        <Select value={timeWindow} onValueChange={setTimeWindow}>
          <FormControl>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            <SelectItem value="1">1 minute</SelectItem>
            <SelectItem value="5">5 minutes</SelectItem>
            <SelectItem value="15">15 minutes</SelectItem>
            <SelectItem value="30">30 minutes</SelectItem>
            <SelectItem value="60">1 hour</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          How long the condition must be true before triggering
        </p>
      </div>

      {template.examples.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Examples</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {template.examples.map((example, index) => (
                <div key={index} className="text-sm">
                  <code className="bg-muted px-2 py-1 rounded text-xs">
                    {example.condition}
                  </code>
                  <p className="text-muted-foreground mt-1">{example.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
