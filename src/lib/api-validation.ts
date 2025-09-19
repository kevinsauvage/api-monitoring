import axios from "axios";
import { log } from "@/lib/logger";

function handleAxiosError(
  error: unknown,
  defaultMessage: string
): ValidationResult {
  if (error && typeof error === "object" && "response" in error) {
    const axiosError = error as {
      response?: {
        status?: number;
        data?: {
          error?: { message?: string };
          errors?: Array<{ message?: string }>;
          message?: string;
        };
      };
    };
    if (axiosError.response?.status === 401) {
      return { success: false, message: "Invalid credentials" };
    }
    if (axiosError.response?.data?.error?.message) {
      return {
        success: false,
        message: axiosError.response.data.error.message,
      };
    }
    if (axiosError.response?.data?.errors?.[0]?.message) {
      return {
        success: false,
        message: axiosError.response.data.errors[0].message,
      };
    }
    if (axiosError.response?.data?.message) {
      return { success: false, message: axiosError.response.data.message };
    }
  }
  if (error && typeof error === "object" && "message" in error) {
    const errorWithMessage = error as { message: string };
    return { success: false, message: errorWithMessage.message };
  }
  return { success: false, message: defaultMessage };
}

export interface ValidationResult {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}

export interface ConnectionConfig {
  provider: string;
  baseUrl: string;
  apiKey?: string;
  secretKey?: string;
  accountSid?: string;
  authToken?: string;
  token?: string;
}

export async function validateApiConnection(
  config: ConnectionConfig
): Promise<ValidationResult> {
  const { provider, baseUrl, apiKey, accountSid, authToken, token } = config;

  try {
    switch (provider.toLowerCase()) {
      case "stripe":
        return await validateStripeConnection(baseUrl, apiKey);
      case "twilio":
        return await validateTwilioConnection(baseUrl, accountSid, authToken);
      case "sendgrid":
        return await validateSendGridConnection(baseUrl, apiKey);
      case "github":
        return await validateGitHubConnection(baseUrl, token);
      case "slack":
        return await validateSlackConnection(baseUrl, token);
      default:
        return await validateGenericConnection(baseUrl, apiKey ?? token);
    }
  } catch (error) {
    log.error("Validation error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      success: false,
      message:
        "Connection validation failed. Please check your credentials and try again.",
    };
  }
}

async function validateStripeConnection(
  baseUrl: string,
  apiKey?: string
): Promise<ValidationResult> {
  if (!apiKey) {
    return { success: false, message: "API key is required for Stripe" };
  }

  try {
    const response = await axios.get(`${baseUrl}/v1/charges?limit=1`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      timeout: 10000,
    });

    return {
      success: true,
      message: "Stripe connection validated successfully",
      data: {
        accountId: response.headers["stripe-account"] ?? "Unknown",
        responseTime: response.headers["x-response-time"] ?? "Unknown",
      },
    };
  } catch (error: unknown) {
    return handleAxiosError(error, "Failed to connect to Stripe API");
  }
}

async function validateTwilioConnection(
  baseUrl: string,
  accountSid?: string,
  authToken?: string
): Promise<ValidationResult> {
  if (!accountSid || !authToken) {
    return {
      success: false,
      message: "Account SID and Auth Token are required for Twilio",
    };
  }

  try {
    const response = await axios.get(
      `${baseUrl}/2010-04-01/Accounts/${accountSid}.json`,
      {
        auth: {
          username: accountSid,
          password: authToken,
        },
        timeout: 10000,
      }
    );

    if (!response.data) {
      return { success: false, message: "No data returned from Twilio API" };
    }

    return {
      success: true,
      message: "Twilio connection validated successfully",
      data: {
        accountSid: response.data.sid,
        accountName: response.data.friendly_name,
        status: response.data.status,
      },
    };
  } catch (error: unknown) {
    return handleAxiosError(error, "Failed to connect to Twilio API");
  }
}

async function validateSendGridConnection(
  baseUrl: string,
  apiKey?: string
): Promise<ValidationResult> {
  if (!apiKey) {
    return { success: false, message: "API key is required for SendGrid" };
  }

  try {
    const response = await axios.get(`${baseUrl}/v3/user/account`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      timeout: 10000,
    });

    return {
      success: true,
      message: "SendGrid connection validated successfully",
      data: {
        accountType: response.data.type,
        reputation: response.data.reputation,
      },
    };
  } catch (error: unknown) {
    return handleAxiosError(error, "Failed to connect to SendGrid API");
  }
}

async function validateGitHubConnection(
  baseUrl: string,
  token?: string
): Promise<ValidationResult> {
  if (!token) {
    return { success: false, message: "Token is required for GitHub" };
  }

  try {
    const response = await axios.get(`${baseUrl}/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
      timeout: 10000,
    });

    return {
      success: true,
      message: "GitHub connection validated successfully",
      data: {
        username: response.data.login,
        name: response.data.name,
        publicRepos: response.data.public_repos,
      },
    };
  } catch (error: unknown) {
    return handleAxiosError(error, "Failed to connect to GitHub API");
  }
}

async function validateSlackConnection(
  baseUrl: string,
  token?: string
): Promise<ValidationResult> {
  if (!token) {
    return { success: false, message: "Token is required for Slack" };
  }

  try {
    const response = await axios.get(`${baseUrl}/auth.test`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 10000,
    });

    return {
      success: true,
      message: "Slack connection validated successfully",
      data: {
        team: response.data.team,
        user: response.data.user,
        url: response.data.url,
      },
    };
  } catch (error: unknown) {
    return handleAxiosError(error, "Failed to connect to Slack API");
  }
}

async function validateGenericConnection(
  baseUrl: string,
  apiKey?: string
): Promise<ValidationResult> {
  if (!apiKey) {
    return { success: false, message: "API key is required" };
  }

  try {
    // Try a simple GET request to the base URL
    const response = await axios.get(baseUrl, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      timeout: 10000,
    });

    return {
      success: true,
      message: "Connection validated successfully",
      data: {
        status: response.status,
        statusText: response.statusText,
      },
    };
  } catch (error: unknown) {
    return handleAxiosError(error, "Failed to connect to API");
  }
}

// Helper function to get provider-specific endpoints for health checks
export function getProviderEndpoints(provider: string): string[] {
  switch (provider.toLowerCase()) {
    case "stripe":
      return ["/v1/charges", "/v1/customers", "/v1/balance"];
    case "twilio":
      return ["/2010-04-01/Accounts", "/2010-04-01/Account/Usage"];
    case "sendgrid":
      return ["/v3/user/account", "/v3/user/profile"];
    case "github":
      return ["/user", "/user/repos"];
    case "slack":
      return ["/auth.test", "/conversations.list"];
    default:
      return ["/", "/health", "/status"];
  }
}

// Helper function to get provider-specific authentication headers
export function getAuthHeaders(
  provider: string,
  credentials: Record<string, string | undefined>
): Record<string, string> {
  switch (provider.toLowerCase()) {
    case "stripe":
      return {
        Authorization: `Bearer ${credentials.apiKey}`,
      };
    case "twilio":
      return {
        Authorization: `Basic ${Buffer.from(
          `${credentials.accountSid}:${credentials.authToken}`
        ).toString("base64")}`,
      };
    case "sendgrid":
      return {
        Authorization: `Bearer ${credentials.apiKey}`,
      };
    case "github":
      return {
        Authorization: `Bearer ${credentials.token}`,
        Accept: "application/vnd.github.v3+json",
      };
    case "slack":
      return {
        Authorization: `Bearer ${credentials.token}`,
      };
    default:
      return {
        Authorization: `Bearer ${credentials.apiKey ?? credentials.token}`,
      };
  }
}
