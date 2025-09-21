import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import {
  validateApiConnection,
  getProviderEndpoints,
  getAuthHeaders,
  type ValidationResult,
  type ConnectionConfig,
} from "../api-validation";

// Mock axios
vi.mock("axios");
const mockedAxios = vi.mocked(axios);

// Mock logger
vi.mock("../logger", () => ({
  log: {
    error: vi.fn(),
  },
}));

describe("API Validation", () => {
  let mockLog: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockLog = await import("../logger");
  });

  describe("validateApiConnection", () => {
    it("should validate Stripe connection successfully", async () => {
      const mockResponse = {
        status: 200,
        headers: {
          "stripe-account": "acct_123",
          "x-response-time": "150ms",
        },
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const config: ConnectionConfig = {
        provider: "stripe",
        baseUrl: "https://api.stripe.com",
        apiKey: "sk_test_123",
      };

      const result = await validateApiConnection(config);

      expect(result).toEqual({
        success: true,
        message: "Stripe connection validated successfully",
        data: {
          accountId: "acct_123",
          responseTime: "150ms",
        },
      });
      expect(mockedAxios.get).toHaveBeenCalledWith(
        "https://api.stripe.com/v1/charges?limit=1",
        {
          headers: {
            Authorization: "Bearer sk_test_123",
          },
          timeout: 10000,
        }
      );
    });

    it("should handle Stripe connection without API key", async () => {
      const config: ConnectionConfig = {
        provider: "stripe",
        baseUrl: "https://api.stripe.com",
      };

      const result = await validateApiConnection(config);

      expect(result).toEqual({
        success: false,
        message: "API key is required for Stripe",
      });
    });

    it("should validate Twilio connection successfully", async () => {
      const mockResponse = {
        status: 200,
        data: {
          sid: "AC1234567890",
          friendly_name: "Test Account",
          status: "active",
        },
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const config: ConnectionConfig = {
        provider: "twilio",
        baseUrl: "https://api.twilio.com",
        accountSid: "AC1234567890",
        authToken: "auth_token_123",
      };

      const result = await validateApiConnection(config);

      expect(result).toEqual({
        success: true,
        message: "Twilio connection validated successfully",
        data: {
          accountSid: "AC1234567890",
          accountName: "Test Account",
          status: "active",
        },
      });
      expect(mockedAxios.get).toHaveBeenCalledWith(
        "https://api.twilio.com/2010-04-01/Accounts/AC1234567890.json",
        {
          auth: {
            username: "AC1234567890",
            password: "auth_token_123",
          },
          timeout: 10000,
        }
      );
    });

    it("should handle Twilio connection without credentials", async () => {
      const config: ConnectionConfig = {
        provider: "twilio",
        baseUrl: "https://api.twilio.com",
      };

      const result = await validateApiConnection(config);

      expect(result).toEqual({
        success: false,
        message: "Account SID and Auth Token are required for Twilio",
      });
    });

    it("should validate SendGrid connection successfully", async () => {
      const mockResponse = {
        status: 200,
        data: {
          type: "free",
          reputation: 95,
        },
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const config: ConnectionConfig = {
        provider: "sendgrid",
        baseUrl: "https://api.sendgrid.com",
        apiKey: "SG.1234567890",
      };

      const result = await validateApiConnection(config);

      expect(result).toEqual({
        success: true,
        message: "SendGrid connection validated successfully",
        data: {
          accountType: "free",
          reputation: 95,
        },
      });
    });

    it("should validate GitHub connection successfully", async () => {
      const mockResponse = {
        status: 200,
        data: {
          login: "testuser",
          name: "Test User",
          public_repos: 42,
        },
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const config: ConnectionConfig = {
        provider: "github",
        baseUrl: "https://api.github.com",
        token: "ghp_1234567890",
      };

      const result = await validateApiConnection(config);

      expect(result).toEqual({
        success: true,
        message: "GitHub connection validated successfully",
        data: {
          username: "testuser",
          name: "Test User",
          publicRepos: 42,
        },
      });
    });

    it("should validate Slack connection successfully", async () => {
      const mockResponse = {
        status: 200,
        data: {
          team: "Test Team",
          user: "testuser",
          url: "https://testteam.slack.com",
        },
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const config: ConnectionConfig = {
        provider: "slack",
        baseUrl: "https://slack.com/api",
        token: "xoxb-1234567890",
      };

      const result = await validateApiConnection(config);

      expect(result).toEqual({
        success: true,
        message: "Slack connection validated successfully",
        data: {
          team: "Test Team",
          user: "testuser",
          url: "https://testteam.slack.com",
        },
      });
    });

    it("should validate generic connection successfully", async () => {
      const mockResponse = {
        status: 200,
        statusText: "OK",
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const config: ConnectionConfig = {
        provider: "custom",
        baseUrl: "https://api.custom.com",
        apiKey: "custom_key_123",
      };

      const result = await validateApiConnection(config);

      expect(result).toEqual({
        success: true,
        message: "Connection validated successfully",
        data: {
          status: 200,
          statusText: "OK",
        },
      });
    });

    it("should handle axios errors with 401 status", async () => {
      const axiosError = {
        response: {
          status: 401,
          data: {
            error: { message: "Unauthorized" },
          },
        },
      };
      mockedAxios.get.mockRejectedValue(axiosError);

      const config: ConnectionConfig = {
        provider: "stripe",
        baseUrl: "https://api.stripe.com",
        apiKey: "invalid_key",
      };

      const result = await validateApiConnection(config);

      expect(result).toEqual({
        success: false,
        message: "Invalid credentials",
      });
    });

    it("should handle axios errors with error message", async () => {
      const axiosError = {
        response: {
          status: 400,
          data: {
            error: { message: "Invalid API key" },
          },
        },
      };
      mockedAxios.get.mockRejectedValue(axiosError);

      const config: ConnectionConfig = {
        provider: "stripe",
        baseUrl: "https://api.stripe.com",
        apiKey: "invalid_key",
      };

      const result = await validateApiConnection(config);

      expect(result).toEqual({
        success: false,
        message: "Invalid API key",
      });
    });

    it("should handle axios errors with errors array", async () => {
      const axiosError = {
        response: {
          status: 400,
          data: {
            errors: [{ message: "Validation failed" }],
          },
        },
      };
      mockedAxios.get.mockRejectedValue(axiosError);

      const config: ConnectionConfig = {
        provider: "stripe",
        baseUrl: "https://api.stripe.com",
        apiKey: "invalid_key",
      };

      const result = await validateApiConnection(config);

      expect(result).toEqual({
        success: false,
        message: "Validation failed",
      });
    });

    it("should handle axios errors with general message", async () => {
      const axiosError = {
        response: {
          status: 500,
          data: {
            message: "Internal server error",
          },
        },
      };
      mockedAxios.get.mockRejectedValue(axiosError);

      const config: ConnectionConfig = {
        provider: "stripe",
        baseUrl: "https://api.stripe.com",
        apiKey: "invalid_key",
      };

      const result = await validateApiConnection(config);

      expect(result).toEqual({
        success: false,
        message: "Internal server error",
      });
    });

    it("should handle generic errors", async () => {
      const genericError = new Error("Network error");
      mockedAxios.get.mockRejectedValue(genericError);

      const config: ConnectionConfig = {
        provider: "stripe",
        baseUrl: "https://api.stripe.com",
        apiKey: "invalid_key",
      };

      const result = await validateApiConnection(config);

      expect(result).toEqual({
        success: false,
        message: "Network error",
      });
    });

    it("should handle unknown errors", async () => {
      mockedAxios.get.mockRejectedValue("Unknown error");

      const config: ConnectionConfig = {
        provider: "stripe",
        baseUrl: "https://api.stripe.com",
        apiKey: "invalid_key",
      };

      const result = await validateApiConnection(config);

      expect(result).toEqual({
        success: false,
        message: "Failed to connect to Stripe API",
      });
    });

    it("should handle case-insensitive provider names", async () => {
      const mockResponse = {
        status: 200,
        headers: {
          "stripe-account": "acct_123",
          "x-response-time": "150ms",
        },
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const config: ConnectionConfig = {
        provider: "STRIPE",
        baseUrl: "https://api.stripe.com",
        apiKey: "sk_test_123",
      };

      const result = await validateApiConnection(config);

      expect(result.success).toBe(true);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        "https://api.stripe.com/v1/charges?limit=1",
        {
          headers: {
            Authorization: "Bearer sk_test_123",
          },
          timeout: 10000,
        }
      );
    });
  });

  describe("getProviderEndpoints", () => {
    it("should return Stripe endpoints", () => {
      const endpoints = getProviderEndpoints("stripe");
      expect(endpoints).toEqual([
        "/v1/charges",
        "/v1/customers",
        "/v1/balance_transactions",
      ]);
    });

    it("should return Twilio endpoints", () => {
      const endpoints = getProviderEndpoints("twilio");
      expect(endpoints).toEqual([
        "/2010-04-01/Accounts",
        "/2010-04-01/Account/Usage",
      ]);
    });

    it("should return SendGrid endpoints", () => {
      const endpoints = getProviderEndpoints("sendgrid");
      expect(endpoints).toEqual(["/v3/user/account", "/v3/user/profile"]);
    });

    it("should return GitHub endpoints", () => {
      const endpoints = getProviderEndpoints("github");
      expect(endpoints).toEqual(["/user", "/user/repos"]);
    });

    it("should return Slack endpoints", () => {
      const endpoints = getProviderEndpoints("slack");
      expect(endpoints).toEqual(["/auth.test", "/conversations.list"]);
    });

    it("should return default endpoints for unknown provider", () => {
      const endpoints = getProviderEndpoints("unknown");
      expect(endpoints).toEqual(["/", "/health", "/status"]);
    });

    it("should handle case-insensitive provider names", () => {
      const endpoints = getProviderEndpoints("STRIPE");
      expect(endpoints).toEqual([
        "/v1/charges",
        "/v1/customers",
        "/v1/balance_transactions",
      ]);
    });
  });

  describe("getAuthHeaders", () => {
    it("should return Stripe auth headers", () => {
      const headers = getAuthHeaders("stripe", { apiKey: "sk_test_123" });
      expect(headers).toEqual({
        Authorization: "Bearer sk_test_123",
      });
    });

    it("should return Twilio auth headers", () => {
      const headers = getAuthHeaders("twilio", {
        accountSid: "AC123",
        authToken: "token123",
      });
      expect(headers).toEqual({
        Authorization: "Basic QUMxMjM6dG9rZW4xMjM=",
      });
    });

    it("should return SendGrid auth headers", () => {
      const headers = getAuthHeaders("sendgrid", { apiKey: "SG123" });
      expect(headers).toEqual({
        Authorization: "Bearer SG123",
      });
    });

    it("should return GitHub auth headers", () => {
      const headers = getAuthHeaders("github", { token: "ghp_123" });
      expect(headers).toEqual({
        Authorization: "Bearer ghp_123",
        Accept: "application/vnd.github.v3+json",
      });
    });

    it("should return Slack auth headers", () => {
      const headers = getAuthHeaders("slack", { token: "xoxb_123" });
      expect(headers).toEqual({
        Authorization: "Bearer xoxb_123",
      });
    });

    it("should return default auth headers", () => {
      const headers = getAuthHeaders("unknown", { apiKey: "key123" });
      expect(headers).toEqual({
        Authorization: "Bearer key123",
      });
    });

    it("should prefer token over apiKey for default", () => {
      const headers = getAuthHeaders("unknown", {
        apiKey: "key123",
        token: "token123",
      });
      expect(headers).toEqual({
        Authorization: "Bearer key123",
      });
    });

    it("should handle case-insensitive provider names", () => {
      const headers = getAuthHeaders("STRIPE", { apiKey: "sk_test_123" });
      expect(headers).toEqual({
        Authorization: "Bearer sk_test_123",
      });
    });
  });
});
