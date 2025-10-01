import axios from "axios";

import type { ConnectionWithCredentials } from "@/lib/core/types";
import type { HealthCheckConfig } from "@/lib/shared/types";
import { getAuthHeaders } from "@/lib/shared/utils/api-validation";
import { log } from "@/lib/shared/utils/logger";

import type { CheckResult } from "@prisma/client";
import type { AxiosRequestConfig, AxiosResponse } from "axios";
export class HealthCheckExecutor {
  async executeHealthCheck(
    config: HealthCheckConfig,
    connection: ConnectionWithCredentials
  ): Promise<CheckResult> {
    const startTime = Date.now();
    let result: CheckResult;
    try {
      const fullUrl = this.buildUrl(
        connection.baseUrl,
        config.endpoint,
        config.queryParams
      );

      const requestConfig: AxiosRequestConfig = {
        method: config.method as "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
        url: fullUrl,
        timeout: config.timeout,
        headers: {
          ...config.headers,
          ...this.getAuthHeaders(connection),
        },
        validateStatus: () => true, // Don't throw on any status code
      };

      if (
        config.body &&
        ["POST", "PUT", "PATCH"].includes(config.method.toUpperCase())
      ) {
        requestConfig.data = config.body;
        if (requestConfig.headers) {
          requestConfig.headers["Content-Type"] = "application/json";
        }
      }

      const response: AxiosResponse = await axios(requestConfig);

      const measured = Date.now() - startTime;
      const responseTime = Math.max(1, measured);
      log.debug("Health check response", {
        statusCode: response.status,
        responseTime,
      });

      const status = this.determineStatus(
        response,
        config.expectedStatus,
        responseTime,
        config.timeout
      );

      result = {
        id: `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        healthCheckId: config.id,
        status,
        responseTime,
        statusCode: response.status,
        errorMessage:
          status !== "SUCCESS" ? this.getErrorMessage(response, status) : null,
        metadata: {
          url: fullUrl,
          method: config.method,
          requestHeaders: requestConfig.headers,
          responseHeaders: response.headers,
          responseSize: JSON.stringify(response.data).length,
          userAgent: "API-Pulse-Monitor/1.0",
        },
        timestamp: new Date(),
      };
    } catch (error) {
      log.error("Health check execution error", {
        error: error instanceof Error ? error.message : String(error),
      });
      const responseTime = Math.max(1, Date.now() - startTime);
      const err = error as { code?: string; message?: string; name?: string };
      const isTimeout =
        err.code === "ECONNABORTED" || err.message?.includes("timeout");

      result = {
        id: `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        healthCheckId: config.id,
        status: isTimeout ? "TIMEOUT" : "ERROR",
        responseTime,
        statusCode: null,
        errorMessage: err.message ?? "Unknown error",
        metadata: {
          errorType: err.name,
          errorCode: err.code,
        },
        timestamp: new Date(),
      };
    }

    return result;
  }

  private buildUrl(
    baseUrl: string,
    endpoint: string,
    queryParams?: Record<string, string>
  ): string {
    const cleanBaseUrl = baseUrl.replace(/\/$/, "");
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

    let fullUrl = `${cleanBaseUrl}${cleanEndpoint}`;

    // Add query parameters
    if (queryParams && Object.keys(queryParams).length > 0) {
      const searchParams = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, value]) => {
        searchParams.append(key, value);
      });
      fullUrl += `?${searchParams.toString()}`;
    }

    return fullUrl;
  }

  private getAuthHeaders(
    connection: Record<string, unknown>
  ): Record<string, string> {
    const credentials = {
      apiKey: connection["apiKey"] as string,
      secretKey: connection["secretKey"] as string,
    };

    return getAuthHeaders(connection["provider"] as string, credentials);
  }

  private determineStatus(
    response: AxiosResponse,
    expectedStatus: number,
    responseTime: number,
    timeout: number
  ): "SUCCESS" | "FAILURE" | "TIMEOUT" | "ERROR" {
    if (responseTime >= timeout) {
      return "TIMEOUT";
    }

    if (response.status === expectedStatus) {
      return "SUCCESS";
    }

    if (response.status >= 500) {
      return "ERROR";
    }

    return "FAILURE";
  }

  private getErrorMessage(response: AxiosResponse, status: string): string {
    switch (status) {
      case "TIMEOUT":
        return "Request timed out";
      case "ERROR":
        return `Server error: ${response.status} ${response.statusText}`;
      case "FAILURE":
        return `Unexpected status: ${response.status} ${response.statusText}`;
      default:
        return "Unknown error";
    }
  }
}

export const healthCheckExecutor = new HealthCheckExecutor();
