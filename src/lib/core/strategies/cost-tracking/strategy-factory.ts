/**
 * Factory for creating cost tracking strategies
 */

import type { CostTrackingStrategy } from "./base-strategy";
import { StripeCostTrackingStrategy } from "./stripe-strategy";
import { TwilioCostTrackingStrategy } from "./twilio-strategy";
import { NoCostTrackingStrategy } from "./no-tracking-strategy";

export class CostTrackingStrategyFactory {
  static createStrategy(provider: string): CostTrackingStrategy {
    switch (provider) {
      case "stripe":
        return new StripeCostTrackingStrategy();
      case "twilio":
        return new TwilioCostTrackingStrategy();
      case "sendgrid":
      case "github":
      case "slack":
        return new NoCostTrackingStrategy(provider);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  static getSupportedProviders(): string[] {
    return ["stripe", "twilio", "sendgrid", "github", "slack"];
  }

  static isProviderSupported(provider: string): boolean {
    return this.getSupportedProviders().includes(provider);
  }
}
