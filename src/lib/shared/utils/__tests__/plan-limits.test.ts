import { describe, it, expect } from "vitest";
import {
  PLAN_LIMITS,
  getPlanLimits,
  getIntervalOptions,
  getDefaultInterval,
} from "../plan-limits";

describe("Plan Limits", () => {
  describe("PLAN_LIMITS", () => {
    it("should have limits for all subscription types", () => {
      expect(PLAN_LIMITS.HOBBY).toBeDefined();
      expect(PLAN_LIMITS.STARTUP).toBeDefined();
      expect(PLAN_LIMITS.BUSINESS).toBeDefined();
    });

    it("should have correct HOBBY plan limits", () => {
      const hobby = PLAN_LIMITS.HOBBY;
      expect(hobby.name).toBe("Hobby");
      expect(hobby.minInterval).toBe(300);
      expect(hobby.maxHealthChecks).toBe(5);
      expect(hobby.maxConnections).toBe(3);
      expect(hobby.features).toContain("5 health checks");
      expect(hobby.features).toContain("3 API connections");
    });

    it("should have correct STARTUP plan limits", () => {
      const startup = PLAN_LIMITS.STARTUP;
      expect(startup.name).toBe("Startup");
      expect(startup.minInterval).toBe(60);
      expect(startup.maxHealthChecks).toBe(25);
      expect(startup.maxConnections).toBe(10);
      expect(startup.features).toContain("25 health checks");
      expect(startup.features).toContain("10 API connections");
    });

    it("should have correct BUSINESS plan limits", () => {
      const business = PLAN_LIMITS.BUSINESS;
      expect(business.name).toBe("Business");
      expect(business.minInterval).toBe(30);
      expect(business.maxHealthChecks).toBe(100);
      expect(business.maxConnections).toBe(50);
      expect(business.features).toContain("100 health checks");
      expect(business.features).toContain("50 API connections");
    });
  });

  describe("getPlanLimits", () => {
    it("should return HOBBY limits for HOBBY subscription", () => {
      const limits = getPlanLimits("HOBBY");
      expect(limits.name).toBe("Hobby");
      expect(limits.minInterval).toBe(300);
      expect(limits.maxHealthChecks).toBe(5);
    });

    it("should return STARTUP limits for STARTUP subscription", () => {
      const limits = getPlanLimits("STARTUP");
      expect(limits.name).toBe("Startup");
      expect(limits.minInterval).toBe(60);
      expect(limits.maxHealthChecks).toBe(25);
    });

    it("should return BUSINESS limits for BUSINESS subscription", () => {
      const limits = getPlanLimits("BUSINESS");
      expect(limits.name).toBe("Business");
      expect(limits.minInterval).toBe(30);
      expect(limits.maxHealthChecks).toBe(100);
    });
  });

  describe("getIntervalOptions", () => {
    it("should return correct options for HOBBY subscription", () => {
      const options = getIntervalOptions("HOBBY");

      // 30 seconds should be disabled for HOBBY
      const thirtySeconds = options.find((opt) => opt.value === 30);
      expect(thirtySeconds?.disabled).toBe(true);

      // 1 minute should be disabled for HOBBY
      const oneMinute = options.find((opt) => opt.value === 60);
      expect(oneMinute?.disabled).toBe(true);

      // 5 minutes should be enabled for HOBBY
      const fiveMinutes = options.find((opt) => opt.value === 300);
      expect(fiveMinutes?.disabled).toBe(false);
    });

    it("should return correct options for STARTUP subscription", () => {
      const options = getIntervalOptions("STARTUP");

      // 30 seconds should be disabled for STARTUP
      const thirtySeconds = options.find((opt) => opt.value === 30);
      expect(thirtySeconds?.disabled).toBe(true);

      // 1 minute should be enabled for STARTUP
      const oneMinute = options.find((opt) => opt.value === 60);
      expect(oneMinute?.disabled).toBe(false);

      // 5 minutes should be enabled for STARTUP
      const fiveMinutes = options.find((opt) => opt.value === 300);
      expect(fiveMinutes?.disabled).toBe(false);
    });

    it("should return correct options for BUSINESS subscription", () => {
      const options = getIntervalOptions("BUSINESS");

      // 30 seconds should be enabled for BUSINESS
      const thirtySeconds = options.find((opt) => opt.value === 30);
      expect(thirtySeconds?.disabled).toBe(false);

      // 1 minute should be enabled for BUSINESS
      const oneMinute = options.find((opt) => opt.value === 60);
      expect(oneMinute?.disabled).toBe(false);

      // 5 minutes should be enabled for BUSINESS
      const fiveMinutes = options.find((opt) => opt.value === 300);
      expect(fiveMinutes?.disabled).toBe(false);
    });

    it("should have all expected interval options", () => {
      const options = getIntervalOptions("BUSINESS");
      const values = options.map((opt) => opt.value);

      expect(values).toContain(30);
      expect(values).toContain(60);
      expect(values).toContain(300);
      expect(values).toContain(900);
      expect(values).toContain(1800);
      expect(values).toContain(3600);
      expect(values).toContain(7200);
      expect(values).toContain(86400);
    });
  });

  describe("getDefaultInterval", () => {
    it("should return correct default interval for HOBBY", () => {
      const interval = getDefaultInterval("HOBBY");
      expect(interval).toBe(300);
    });

    it("should return correct default interval for STARTUP", () => {
      const interval = getDefaultInterval("STARTUP");
      expect(interval).toBe(60);
    });

    it("should return correct default interval for BUSINESS", () => {
      const interval = getDefaultInterval("BUSINESS");
      expect(interval).toBe(30);
    });
  });
});
