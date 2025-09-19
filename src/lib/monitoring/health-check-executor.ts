import type { AxiosRequestConfig, AxiosResponse } from "axios";
import axios from "axios";
import { getAuthHeaders } from "@/lib/api-validation";
import { log } from "@/lib/logger";
import type {
  HealthCheckConfig,
  HealthCheckResult,
  ConnectionWithCredentials,
} from "@/lib/types";

export class HealthCheckExecutor {
  private static instance: HealthCheckExecutor;

  public static getInstance(): HealthCheckExecutor {
    if (!HealthCheckExecutor.instance) {
      HealthCheckExecutor.instance = new HealthCheckExecutor();
    }
    return HealthCheckExecutor.instance;
  }

  /**
   * Execute a single health check
   */
  async executeHealthCheck(
    config: HealthCheckConfig,
    connection: ConnectionWithCredentials
  ): Promise<HealthCheckResult> {
    const startTime = Date.now();
    let result: HealthCheckResult;

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
      log.debug("Health check response", {
        statusCode: response.status,
        responseTime: Date.now() - startTime,
      });
      const responseTime = Date.now() - startTime;

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
          status !== "SUCCESS"
            ? this.getErrorMessage(response, status)
            : undefined,
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
      const responseTime = Date.now() - startTime;
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

  /**
   * Build full URL with query parameters
   */
  private buildUrl(
    baseUrl: string,
    endpoint: string,
    queryParams?: Record<string, string>
  ): string {
    // Ensure baseUrl doesn't end with slash and endpoint starts with slash
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

  /**
   * Get authentication headers for the API connection
   */
  private getAuthHeaders(
    connection: Record<string, unknown>
  ): Record<string, string> {
    const credentials = {
      apiKey: connection.apiKey as string,
      secretKey: connection.secretKey as string,
    };

    return getAuthHeaders(connection.provider as string, credentials);
  }

  /**
   * Determine the status of a health check based on response
   */
  private determineStatus(
    response: AxiosResponse,
    expectedStatus: number,
    responseTime: number,
    timeout: number
  ): "SUCCESS" | "FAILURE" | "TIMEOUT" | "ERROR" {
    // Check for timeout
    if (responseTime >= timeout) {
      return "TIMEOUT";
    }

    // Check for expected status code
    if (response.status === expectedStatus) {
      return "SUCCESS";
    }

    // Check for server errors (5xx)
    if (response.status >= 500) {
      return "ERROR";
    }

    // Everything else is a failure
    return "FAILURE";
  }

  /**
   * Get error message for failed health checks
   */
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

export const healthCheckExecutor = HealthCheckExecutor.getInstance();
