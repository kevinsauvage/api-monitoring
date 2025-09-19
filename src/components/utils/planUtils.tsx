import React from "react";
import { Star, Zap, Crown } from "lucide-react";
import type { Subscription } from "@prisma/client";

export function getPlanIcon(plan: Subscription) {
  switch (plan) {
    case "HOBBY":
      return <Star className="h-4 w-4" />;
    case "STARTUP":
      return <Zap className="h-4 w-4" />;
    case "BUSINESS":
      return <Crown className="h-4 w-4" />;
    default:
      return <Star className="h-4 w-4" />;
  }
}

export function getPlanColor(plan: Subscription) {
  switch (plan) {
    case "HOBBY":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "STARTUP":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    case "BUSINESS":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
    default:
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
  }
}
