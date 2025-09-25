import { z } from "zod";

export const alertConditionSchema = z.object({
  condition: z.enum(
    ["error_rate", "response_time", "uptime", "rate_limit", "custom_metric"],
    {
      errorMap: () => ({
        message:
          "Condition must be one of: error_rate, response_time, uptime, rate_limit, custom_metric",
      }),
    }
  ),
  operator: z.enum([">", ">=", "<", "<=", "==", "!="], {
    errorMap: () => ({
      message: "Operator must be one of: >, >=, <, <=, ==, !=",
    }),
  }),
  threshold: z.number().min(0, "Threshold must be a positive number"),
  unit: z.enum(
    ["%", "ms", "requests/min", "count", "seconds", "minutes", "hours"],
    {
      errorMap: () => ({
        message:
          "Unit must be one of: %, ms, requests/min, count, seconds, minutes, hours",
      }),
    }
  ),
  timeWindow: z
    .number()
    .min(1, "Time window must be at least 1 minute")
    .max(1440, "Time window cannot exceed 1440 minutes (24 hours)"),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
  severity: z
    .enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"])
    .optional()
    .default("MEDIUM"),
  tags: z
    .array(z.string().max(50, "Each tag cannot exceed 50 characters"))
    .max(10, "Cannot have more than 10 tags")
    .optional(),
});

export const validateAlertCondition = (data: unknown) => {
  try {
    return { success: true, data: alertConditionSchema.parse(data) };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
          code: err.code,
        })),
      };
    }
    return {
      success: false,
      errors: [
        { path: "root", message: "Invalid data format", code: "invalid_type" },
      ],
    };
  }
};

export type AlertCondition = z.infer<typeof alertConditionSchema>;
