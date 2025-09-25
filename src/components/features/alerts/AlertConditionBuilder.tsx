"use client";

import { useState, useEffect } from "react";

import {
  AlertTriangle,
  Clock,
  TrendingDown,
  TrendingUp,
  Code,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormLabel } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  validateAlertCondition,
  type AlertCondition,
} from "@/lib/shared/schemas/alert-condition.schema";

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
    jsonTemplate: {
      condition: "error_rate" as const,
      operator: ">" as const,
      threshold: 5,
      unit: "%" as const,
      timeWindow: 5,
      description: "Alert when error rate exceeds threshold",
      severity: "MEDIUM" as const,
      tags: ["monitoring", "errors"],
    },
    examples: [
      {
        json: {
          condition: "error_rate" as const,
          operator: ">" as const,
          threshold: 5,
          unit: "%" as const,
          timeWindow: 5,
          description: "Alert when error rate > 5% for 5 minutes",
          severity: "HIGH" as const,
          tags: ["critical", "errors"],
        },
        description: "Alert when error rate > 5% for 5 minutes",
      },
      {
        json: {
          condition: "error_rate" as const,
          operator: ">=" as const,
          threshold: 10,
          unit: "%" as const,
          timeWindow: 1,
          description: "Alert when error rate >= 10% for 1 minute",
          severity: "CRITICAL" as const,
          tags: ["urgent", "errors"],
        },
        description: "Alert when error rate >= 10% for 1 minute",
      },
    ],
  },
  RESPONSE_TIME: {
    title: "Response Time Alert",
    description: "Monitor API response times",
    icon: Clock,
    color: "text-orange-600",
    bgColor: "bg-orange-100 dark:bg-orange-900",
    jsonTemplate: {
      condition: "response_time" as const,
      operator: ">" as const,
      threshold: 2000,
      unit: "ms" as const,
      timeWindow: 5,
      description: "Alert when response time exceeds threshold",
      severity: "MEDIUM" as const,
      tags: ["performance", "latency"],
    },
    examples: [
      {
        json: {
          condition: "response_time" as const,
          operator: ">" as const,
          threshold: 2000,
          unit: "ms" as const,
          timeWindow: 5,
          description: "Alert when response time > 2 seconds for 5 minutes",
          severity: "HIGH" as const,
          tags: ["performance", "slow"],
        },
        description: "Alert when response time > 2 seconds for 5 minutes",
      },
      {
        json: {
          condition: "response_time" as const,
          operator: ">=" as const,
          threshold: 5000,
          unit: "ms" as const,
          timeWindow: 1,
          description: "Alert when response time >= 5 seconds for 1 minute",
          severity: "CRITICAL" as const,
          tags: ["performance", "timeout"],
        },
        description: "Alert when response time >= 5 seconds for 1 minute",
      },
    ],
  },
  UPTIME: {
    title: "Uptime Alert",
    description: "Monitor service availability",
    icon: TrendingDown,
    color: "text-green-600",
    bgColor: "bg-green-100 dark:bg-green-900",
    jsonTemplate: {
      condition: "uptime" as const,
      operator: "<" as const,
      threshold: 99,
      unit: "%" as const,
      timeWindow: 5,
      description: "Alert when uptime drops below threshold",
      severity: "HIGH" as const,
      tags: ["availability", "uptime"],
    },
    examples: [
      {
        json: {
          condition: "uptime" as const,
          operator: "<" as const,
          threshold: 99,
          unit: "%" as const,
          timeWindow: 5,
          description: "Alert when uptime < 99% for 5 minutes",
          severity: "HIGH" as const,
          tags: ["availability", "downtime"],
        },
        description: "Alert when uptime &lt; 99% for 5 minutes",
      },
      {
        json: {
          condition: "uptime" as const,
          operator: "<=" as const,
          threshold: 95,
          unit: "%" as const,
          timeWindow: 1,
          description: "Alert when uptime <= 95% for 1 minute",
          severity: "CRITICAL" as const,
          tags: ["availability", "critical"],
        },
        description: "Alert when uptime &lt;= 95% for 1 minute",
      },
    ],
  },
  RATE_LIMIT: {
    title: "Rate Limit Alert",
    description: "Monitor API rate limiting",
    icon: TrendingUp,
    color: "text-purple-600",
    bgColor: "bg-purple-100 dark:bg-purple-900",
    jsonTemplate: {
      condition: "rate_limit" as const,
      operator: ">" as const,
      threshold: 1000,
      unit: "requests/min" as const,
      timeWindow: 5,
      description: "Alert when rate limit exceeds threshold",
      severity: "MEDIUM" as const,
      tags: ["rate-limit", "throttling"],
    },
    examples: [
      {
        json: {
          condition: "rate_limit" as const,
          operator: ">" as const,
          threshold: 1000,
          unit: "requests/min" as const,
          timeWindow: 5,
          description:
            "Alert when rate limit > 1000 requests/min for 5 minutes",
          severity: "HIGH" as const,
          tags: ["rate-limit", "high-usage"],
        },
        description: "Alert when rate limit > 1000 requests/min for 5 minutes",
      },
      {
        json: {
          condition: "rate_limit" as const,
          operator: ">=" as const,
          threshold: 500,
          unit: "requests/min" as const,
          timeWindow: 1,
          description: "Alert when rate limit >= 500 requests/min for 1 minute",
          severity: "MEDIUM" as const,
          tags: ["rate-limit", "monitoring"],
        },
        description: "Alert when rate limit >= 500 requests/min for 1 minute",
      },
    ],
  },
  CUSTOM: {
    title: "Custom Alert",
    description: "Define your own monitoring condition",
    icon: Code,
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-900",
    jsonTemplate: {
      condition: "custom_metric" as const,
      operator: ">" as const,
      threshold: 100,
      unit: "count" as const,
      timeWindow: 5,
      description: "Custom monitoring condition",
      severity: "MEDIUM" as const,
      tags: ["custom", "monitoring"],
    },
    examples: [
      {
        json: {
          condition: "custom_metric" as const,
          operator: ">" as const,
          threshold: 80,
          unit: "%" as const,
          timeWindow: 5,
          description: "Alert when memory usage > 80% for 5 minutes",
          severity: "HIGH" as const,
          tags: ["memory", "system"],
        },
        description: "Alert when memory usage > 80% for 5 minutes",
      },
      {
        json: {
          condition: "custom_metric" as const,
          operator: ">=" as const,
          threshold: 10,
          unit: "count" as const,
          timeWindow: 1,
          description: "Alert when error count >= 10 for 1 minute",
          severity: "CRITICAL" as const,
          tags: ["errors", "count"],
        },
        description: "Alert when error count >= 10 for 1 minute",
      },
    ],
  },
};

export default function AlertConditionBuilder({
  alertType,
  threshold: _threshold,
  onConditionChange,
  onThresholdChange,
}: AlertConditionBuilderProps) {
  const [jsonContent, setJsonContent] = useState<string>("");
  const [isValidJson, setIsValidJson] = useState<boolean>(true);
  const [jsonError, setJsonError] = useState<string>("");
  const [isExamplesOpen, setIsExamplesOpen] = useState<boolean>(false);
  const [copiedExample, setCopiedExample] = useState<number | null>(null);

  const template =
    CONDITION_TEMPLATES[alertType as keyof typeof CONDITION_TEMPLATES];
  const Icon = template.icon;

  // Initialize JSON content when alert type changes
  useEffect(() => {
    const jsonString = JSON.stringify(template.jsonTemplate, null, 2);
    setJsonContent(jsonString);
    onConditionChange(jsonString);
  }, [alertType, onConditionChange, template.jsonTemplate]);

  // Validate JSON content
  const validateJson = (content: string) => {
    try {
      const parsed = JSON.parse(content) as unknown;
      const result = validateAlertCondition(parsed);

      if (result.success) {
        setIsValidJson(true);
        setJsonError("");
        return result.data;
      } else {
        setIsValidJson(false);
        const errorMessages =
          result.errors
            ?.map((err) => `${err.path}: ${err.message}`)
            .join("\n") ?? "Unknown validation error";
        setJsonError(errorMessages);
        return null;
      }
    } catch (error) {
      setIsValidJson(false);
      setJsonError(
        error instanceof Error ? error.message : "Invalid JSON syntax"
      );
      return null;
    }
  };

  const handleJsonChange = (content: string) => {
    setJsonContent(content);
    // Clear any previous validation errors when user is typing
    if (!isValidJson) {
      setIsValidJson(true);
      setJsonError("");
    }
  };

  const handleJsonBlur = () => {
    // Only validate when user leaves the textarea
    if (jsonContent.trim()) {
      const parsed = validateJson(jsonContent);
      if (parsed) {
        onConditionChange(jsonContent);
        // Update threshold if it's in the JSON
        if (typeof parsed.threshold === "number") {
          onThresholdChange(parsed.threshold);
        }
      }
    }
  };

  const loadExample = (example: {
    json: AlertCondition;
    description: string;
  }) => {
    const jsonString = JSON.stringify(example.json, null, 2);
    setJsonContent(jsonString);
  };

  const copyExample = async (example: AlertCondition, index: number) => {
    const jsonString = JSON.stringify(example, null, 2);
    await navigator.clipboard.writeText(jsonString);
    setCopiedExample(index);
    setTimeout(() => setCopiedExample(null), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`p-2 rounded-lg ${template.bgColor}`}>
            <Icon className={`h-5 w-5 ${template.color}`} />
          </div>
          <div>
            <h4 className="font-medium">{template.title}</h4>
            <p className="text-sm text-muted-foreground">
              {template.description}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <FormLabel>JSON Condition</FormLabel>
        <Textarea
          value={jsonContent}
          onChange={(e) => handleJsonChange(e.target.value)}
          onBlur={handleJsonBlur}
          onMouseLeave={handleJsonBlur}
          className="min-h-[200px] font-mono text-sm"
          placeholder="Enter JSON condition..."
        />
        {!isValidJson && jsonError && (
          <div className="space-y-1">
            <p className="text-sm font-medium text-red-600">
              Validation Error:
            </p>
            <pre className="text-xs text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded border overflow-x-auto">
              {jsonError}
            </pre>
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          Define your alert condition using JSON format with schema validation
        </p>
      </div>

      {template.examples.length > 0 && (
        <Card>
          <CardHeader
            className="grid-rows-1 py-3 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => setIsExamplesOpen(!isExamplesOpen)}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                {isExamplesOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                Examples ({template.examples.length})
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Click to {isExamplesOpen ? "hide" : "show"} examples
              </p>
            </div>
          </CardHeader>
          {isExamplesOpen && (
            <CardContent className="pt-0">
              <div className="space-y-4">
                {template.examples.map((example, index) => (
                  <div
                    key={index}
                    className="space-y-3 border rounded-lg p-4 bg-muted/30"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground mb-1">
                          {example.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {example.json.tags.map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary"
                            >
                              {tag}
                            </span>
                          ))}
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-secondary text-secondary-foreground">
                            {example.json.severity}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          onClick={() => void copyExample(example.json, index)}
                          className="h-8 px-3"
                        >
                          {copiedExample === index ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          type="button"
                          onClick={() => loadExample(example)}
                          className="h-8 px-3"
                        >
                          Use
                        </Button>
                      </div>
                    </div>
                    <details className="group">
                      <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors">
                        View JSON
                      </summary>
                      <pre className="mt-2 bg-muted p-3 rounded text-xs overflow-x-auto border">
                        <code>{JSON.stringify(example.json, null, 2)}</code>
                      </pre>
                    </details>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}
