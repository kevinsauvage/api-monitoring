import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import {
  getStatusColor,
  getStatusColorExtended,
  getStatusTextColor,
  getStatusIcon,
  getStatusIconWithColor,
  getMethodColor,
  getProviderColor,
  getUptimeColor,
  getResponseTimeColor,
  getActiveStatusColor,
  isFastResponseTime,
  isSlowResponseTime,
  getResponseTimeCategory,
} from "../status-utils";
import { CheckStatus } from "@prisma/client";

describe("Status Utils", () => {
  describe("getStatusColor", () => {
    it("should return correct color for SUCCESS", () => {
      const color = getStatusColor("SUCCESS");
      expect(color).toBe(
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      );
    });

    it("should return correct color for FAILURE", () => {
      const color = getStatusColor("FAILURE");
      expect(color).toBe(
        "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      );
    });

    it("should return correct color for ERROR", () => {
      const color = getStatusColor("ERROR");
      expect(color).toBe(
        "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      );
    });

    it("should return correct color for TIMEOUT", () => {
      const color = getStatusColor("TIMEOUT");
      expect(color).toBe(
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      );
    });

    it("should handle CheckStatus enum", () => {
      const color = getStatusColor(CheckStatus.SUCCESS);
      expect(color).toBe(
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      );
    });
  });

  describe("getStatusColorExtended", () => {
    it("should return extended color for SUCCESS", () => {
      const color = getStatusColorExtended("SUCCESS");
      expect(color).toBe(
        "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700"
      );
    });

    it("should return extended color for FAILURE", () => {
      const color = getStatusColorExtended("FAILURE");
      expect(color).toBe(
        "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-700"
      );
    });
  });

  describe("getStatusTextColor", () => {
    it("should return text color for SUCCESS", () => {
      const color = getStatusTextColor("SUCCESS");
      expect(color).toBe("text-green-600");
    });

    it("should return text color for FAILURE", () => {
      const color = getStatusTextColor("FAILURE");
      expect(color).toBe("text-red-600");
    });
  });

  describe("getStatusIcon", () => {
    it("should return CheckCircle for SUCCESS", () => {
      const icon = getStatusIcon("SUCCESS");
      const { container } = render(icon);
      expect(container.querySelector("svg")).toBeTruthy();
    });

    it("should return XCircle for FAILURE", () => {
      const icon = getStatusIcon("FAILURE");
      const { container } = render(icon);
      expect(container.querySelector("svg")).toBeTruthy();
    });

    it("should return XCircle for ERROR", () => {
      const icon = getStatusIcon("ERROR");
      const { container } = render(icon);
      expect(container.querySelector("svg")).toBeTruthy();
    });

    it("should return Clock for TIMEOUT", () => {
      const icon = getStatusIcon("TIMEOUT");
      const { container } = render(icon);
      expect(container.querySelector("svg")).toBeTruthy();
    });

    it("should return AlertTriangle for unknown status", () => {
      const icon = getStatusIcon("UNKNOWN");
      const { container } = render(icon);
      expect(container.querySelector("svg")).toBeTruthy();
    });
  });

  describe("getStatusIconWithColor", () => {
    it("should return icon with color for SUCCESS", () => {
      const iconWithColor = getStatusIconWithColor("SUCCESS");
      const { container } = render(iconWithColor);
      expect(container.querySelector("svg")).toBeTruthy();
      expect(container.querySelector(".text-green-600")).toBeTruthy();
    });

    it("should return icon with color for FAILURE", () => {
      const iconWithColor = getStatusIconWithColor("FAILURE");
      const { container } = render(iconWithColor);
      expect(container.querySelector("svg")).toBeTruthy();
      expect(container.querySelector(".text-red-600")).toBeTruthy();
    });
  });

  describe("getMethodColor", () => {
    it("should return color for GET method", () => {
      const color = getMethodColor("GET");
      expect(color).toBe(
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      );
    });

    it("should return color for POST method", () => {
      const color = getMethodColor("POST");
      expect(color).toBe(
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      );
    });

    it("should return color for PUT method", () => {
      const color = getMethodColor("PUT");
      expect(color).toBe(
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      );
    });

    it("should return color for DELETE method", () => {
      const color = getMethodColor("DELETE");
      expect(color).toBe(
        "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      );
    });

    it("should return color for PATCH method", () => {
      const color = getMethodColor("PATCH");
      expect(color).toBe(
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      );
    });

    it("should handle case-insensitive method names", () => {
      const color = getMethodColor("get");
      expect(color).toBe(
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      );
    });
  });

  describe("getProviderColor", () => {
    it("should return color for Stripe", () => {
      const color = getProviderColor("stripe");
      expect(color).toBe(
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      );
    });

    it("should return color for Twilio", () => {
      const color = getProviderColor("twilio");
      expect(color).toBe(
        "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      );
    });

    it("should return color for SendGrid", () => {
      const color = getProviderColor("sendgrid");
      expect(color).toBe(
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      );
    });

    it("should return color for GitHub", () => {
      const color = getProviderColor("github");
      expect(color).toBe(
        "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
      );
    });

    it("should return color for Slack", () => {
      const color = getProviderColor("slack");
      expect(color).toBe(
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      );
    });

    it("should handle case-insensitive provider names", () => {
      const color = getProviderColor("STRIPE");
      expect(color).toBe(
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      );
    });
  });

  describe("getUptimeColor", () => {
    it("should return excellent color for high uptime", () => {
      const color = getUptimeColor(99.9);
      expect(color).toBe("text-green-600 dark:text-green-400");
    });

    it("should return good color for medium uptime", () => {
      const color = getUptimeColor(97.0);
      expect(color).toBe("text-yellow-600 dark:text-yellow-400");
    });

    it("should return poor color for low uptime", () => {
      const color = getUptimeColor(90.0);
      expect(color).toBe("text-red-600 dark:text-red-400");
    });

    it("should handle exact threshold values", () => {
      expect(getUptimeColor(99.0)).toBe("text-green-600 dark:text-green-400");
      expect(getUptimeColor(95.0)).toBe("text-yellow-600 dark:text-yellow-400");
    });
  });

  describe("getResponseTimeColor", () => {
    it("should return fast color for low response time", () => {
      const color = getResponseTimeColor(300);
      expect(color).toBe("text-green-600 dark:text-green-400");
    });

    it("should return medium color for medium response time", () => {
      const color = getResponseTimeColor(1000);
      expect(color).toBe("text-yellow-600 dark:text-yellow-400");
    });

    it("should return slow color for high response time", () => {
      const color = getResponseTimeColor(3000);
      expect(color).toBe("text-red-600 dark:text-red-400");
    });

    it("should handle exact threshold values", () => {
      expect(getResponseTimeColor(500)).toBe(
        "text-yellow-600 dark:text-yellow-400"
      );
      expect(getResponseTimeColor(2000)).toBe("text-red-600 dark:text-red-400");
    });
  });

  describe("getActiveStatusColor", () => {
    it("should return active color for true", () => {
      const color = getActiveStatusColor(true);
      expect(color).toBe(
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      );
    });

    it("should return inactive color for false", () => {
      const color = getActiveStatusColor(false);
      expect(color).toBe(
        "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
      );
    });
  });

  describe("isFastResponseTime", () => {
    it("should return true for fast response time", () => {
      expect(isFastResponseTime(300)).toBe(true);
    });

    it("should return false for slow response time", () => {
      expect(isFastResponseTime(1000)).toBe(false);
    });

    it("should return false for exact threshold", () => {
      expect(isFastResponseTime(500)).toBe(false);
    });
  });

  describe("isSlowResponseTime", () => {
    it("should return true for slow response time", () => {
      expect(isSlowResponseTime(3000)).toBe(true);
    });

    it("should return false for fast response time", () => {
      expect(isSlowResponseTime(1000)).toBe(false);
    });

    it("should return true for exact threshold", () => {
      expect(isSlowResponseTime(2000)).toBe(true);
    });
  });

  describe("getResponseTimeCategory", () => {
    it("should return fast for low response time", () => {
      expect(getResponseTimeCategory(300)).toBe("fast");
    });

    it("should return medium for medium response time", () => {
      expect(getResponseTimeCategory(1000)).toBe("medium");
    });

    it("should return slow for high response time", () => {
      expect(getResponseTimeCategory(3000)).toBe("slow");
    });

    it("should handle exact threshold values", () => {
      expect(getResponseTimeCategory(500)).toBe("medium");
      expect(getResponseTimeCategory(2000)).toBe("slow");
    });
  });
});
