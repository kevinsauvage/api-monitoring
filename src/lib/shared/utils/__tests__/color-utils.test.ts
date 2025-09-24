import { describe, it, expect } from "vitest";
import { ColorUtils } from "../color-utils";
import type { CheckStatus } from "@prisma/client";

describe("ColorUtils", () => {
  describe("getStatusColor", () => {
    it("should return correct color for SUCCESS", () => {
      const color = ColorUtils.getStatusColor("SUCCESS");
      expect(color).toBe(
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      );
    });

    it("should return correct color for FAILURE", () => {
      const color = ColorUtils.getStatusColor("FAILURE");
      expect(color).toBe(
        "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      );
    });

    it("should return correct color for ERROR", () => {
      const color = ColorUtils.getStatusColor("ERROR");
      expect(color).toBe(
        "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      );
    });

    it("should return correct color for TIMEOUT", () => {
      const color = ColorUtils.getStatusColor("TIMEOUT");
      expect(color).toBe(
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      );
    });

    it("should return default color for unknown status", () => {
      const color = ColorUtils.getStatusColor("UNKNOWN" as CheckStatus);
      expect(color).toBe(
        "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
      );
    });

    it("should return default color for undefined status", () => {
      const color = ColorUtils.getStatusColor(undefined);
      expect(color).toBe(
        "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
      );
    });
  });

  describe("getStatusColorExtended", () => {
    it("should return extended color for SUCCESS", () => {
      const color = ColorUtils.getStatusColorExtended("SUCCESS");
      expect(color).toBe(
        "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700"
      );
    });

    it("should return extended color for FAILURE", () => {
      const color = ColorUtils.getStatusColorExtended("FAILURE");
      expect(color).toBe(
        "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-700"
      );
    });

    it("should return default color for unknown status", () => {
      const color = ColorUtils.getStatusColorExtended("UNKNOWN" as CheckStatus);
      expect(color).toBe(
        "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950 dark:text-slate-300 dark:border-slate-700"
      );
    });
  });

  describe("getStatusTextColor", () => {
    it("should return text color for SUCCESS", () => {
      const color = ColorUtils.getStatusTextColor("SUCCESS");
      expect(color).toBe("text-green-600");
    });

    it("should return text color for FAILURE", () => {
      const color = ColorUtils.getStatusTextColor("FAILURE");
      expect(color).toBe("text-red-600");
    });

    it("should return default text color for unknown status", () => {
      const color = ColorUtils.getStatusTextColor("UNKNOWN" as CheckStatus);
      expect(color).toBe("text-gray-600");
    });
  });

  describe("getMethodColor", () => {
    it("should return correct color for GET", () => {
      const color = ColorUtils.getMethodColor("GET");
      expect(color).toBe(
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      );
    });

    it("should return correct color for POST", () => {
      const color = ColorUtils.getMethodColor("POST");
      expect(color).toBe(
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      );
    });

    it("should return correct color for PUT", () => {
      const color = ColorUtils.getMethodColor("PUT");
      expect(color).toBe(
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      );
    });

    it("should return correct color for DELETE", () => {
      const color = ColorUtils.getMethodColor("DELETE");
      expect(color).toBe(
        "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      );
    });

    it("should return correct color for PATCH", () => {
      const color = ColorUtils.getMethodColor("PATCH");
      expect(color).toBe(
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      );
    });

    it("should handle case-insensitive method names", () => {
      const color = ColorUtils.getMethodColor("get");
      expect(color).toBe(
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      );
    });

    it("should return default color for unknown method", () => {
      const color = ColorUtils.getMethodColor("UNKNOWN");
      expect(color).toBe(
        "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
      );
    });
  });

  describe("getProviderColor", () => {
    it("should return correct color for Stripe", () => {
      const color = ColorUtils.getProviderColor("stripe");
      expect(color).toBe(
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      );
    });

    it("should return correct color for Twilio", () => {
      const color = ColorUtils.getProviderColor("twilio");
      expect(color).toBe(
        "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      );
    });

    it("should return correct color for SendGrid", () => {
      const color = ColorUtils.getProviderColor("sendgrid");
      expect(color).toBe(
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      );
    });

    it("should return correct color for GitHub", () => {
      const color = ColorUtils.getProviderColor("github");
      expect(color).toBe(
        "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
      );
    });

    it("should return correct color for Slack", () => {
      const color = ColorUtils.getProviderColor("slack");
      expect(color).toBe(
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      );
    });

    it("should handle case-insensitive provider names", () => {
      const color = ColorUtils.getProviderColor("STRIPE");
      expect(color).toBe(
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      );
    });

    it("should return default color for unknown provider", () => {
      const color = ColorUtils.getProviderColor("unknown");
      expect(color).toBe(
        "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
      );
    });
  });

  describe("getUptimeColor", () => {
    it("should return excellent color for high uptime", () => {
      const color = ColorUtils.getUptimeColor(99.9);
      expect(color).toBe("text-green-600 dark:text-green-400");
    });

    it("should return good color for medium uptime", () => {
      const color = ColorUtils.getUptimeColor(95.0);
      expect(color).toBe("text-yellow-600 dark:text-yellow-400");
    });

    it("should return poor color for low uptime", () => {
      const color = ColorUtils.getUptimeColor(80.0);
      expect(color).toBe("text-red-600 dark:text-red-400");
    });

    it("should handle exact threshold values", () => {
      expect(ColorUtils.getUptimeColor(99.0)).toBe(
        "text-green-600 dark:text-green-400"
      );
      expect(ColorUtils.getUptimeColor(95.0)).toBe(
        "text-yellow-600 dark:text-yellow-400"
      );
      expect(ColorUtils.getUptimeColor(90.0)).toBe(
        "text-red-600 dark:text-red-400"
      );
    });
  });

  describe("getResponseTimeColor", () => {
    it("should return fast color for low response time", () => {
      const color = ColorUtils.getResponseTimeColor(100);
      expect(color).toBe("text-green-600 dark:text-green-400");
    });

    it("should return medium color for medium response time", () => {
      const color = ColorUtils.getResponseTimeColor(1000);
      expect(color).toBe("text-yellow-600 dark:text-yellow-400");
    });

    it("should return slow color for high response time", () => {
      const color = ColorUtils.getResponseTimeColor(5000);
      expect(color).toBe("text-red-600 dark:text-red-400");
    });

    it("should handle exact threshold values", () => {
      expect(ColorUtils.getResponseTimeColor(500)).toBe(
        "text-yellow-600 dark:text-yellow-400"
      );
      expect(ColorUtils.getResponseTimeColor(2000)).toBe(
        "text-red-600 dark:text-red-400"
      );
      expect(ColorUtils.getResponseTimeColor(3000)).toBe(
        "text-red-600 dark:text-red-400"
      );
    });
  });

  describe("getActiveStatusColor", () => {
    it("should return active color for true", () => {
      const color = ColorUtils.getActiveStatusColor(true);
      expect(color).toBe(
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      );
    });

    it("should return inactive color for false", () => {
      const color = ColorUtils.getActiveStatusColor(false);
      expect(color).toBe(
        "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
      );
    });
  });
});
