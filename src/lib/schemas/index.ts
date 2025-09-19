import { z } from "zod";

// Common validation schemas
export const commonSchemas = {
  email: z.string().email("Please enter a valid email address"),
  url: z.string().url("Please enter a valid URL"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  name: z.string().min(1, "Name is required"),
  endpoint: z
    .string()
    .min(1, "Endpoint is required")
    .regex(
      /^\/[a-zA-Z0-9\/\-_]*$/,
      "Endpoint must start with / and contain only letters, numbers, hyphens, and underscores"
    ),
  httpMethod: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"], {
    errorMap: () => ({ message: "Please select a valid HTTP method" }),
  }),
  statusCode: z
    .number()
    .int("Status code must be an integer")
    .min(100, "Status code must be between 100 and 599")
    .max(599, "Status code must be between 100 and 599"),
  timeout: z
    .number()
    .int("Timeout must be an integer")
    .min(1000, "Timeout must be at least 1000ms")
    .max(30000, "Timeout must be at most 30000ms"),
  interval: z
    .number()
    .int("Interval must be an integer")
    .min(30, "Interval must be at least 30 seconds")
    .max(3600, "Interval must be at most 3600 seconds"),
  jsonString: z.string().refine(
    (val) => {
      try {
        JSON.parse(val);
        return true;
      } catch {
        return false;
      }
    },
    { message: "Please enter valid JSON" }
  ),
  // ID validation schemas
  connectionId: z
    .string()
    .min(1, "Connection ID is required")
    .regex(/^[a-zA-Z0-9_-]+$/, "Connection ID contains invalid characters"),
  healthCheckId: z
    .string()
    .min(1, "Health check ID is required")
    .regex(/^[a-zA-Z0-9_-]+$/, "Health check ID contains invalid characters"),
  boolean: z.boolean(),
};

// Connection schemas
export const connectionSchemas = {
  validation: z.object({
    provider: z.string().min(1, "Provider is required"),
    baseUrl: commonSchemas.url,
    apiKey: z.string().optional(),
    secretKey: z.string().optional(),
    accountSid: z.string().optional(),
    authToken: z.string().optional(),
    token: z.string().optional(),
  }),

  create: z.object({
    name: z.string().min(1, "Connection name is required"),
    provider: z.string().min(1, "Provider is required"),
    baseUrl: commonSchemas.url,
    apiKey: z.string().optional(),
    secretKey: z.string().optional(),
    accountSid: z.string().optional(),
    authToken: z.string().optional(),
    token: z.string().optional(),
  }),
  // ID-based operations
  toggle: z.object({
    connectionId: commonSchemas.connectionId,
    isActive: commonSchemas.boolean,
  }),
  delete: z.object({
    connectionId: commonSchemas.connectionId,
  }),
};

// Auth schemas
export const authSchemas = {
  registration: z
    .object({
      name: commonSchemas.name,
      email: commonSchemas.email,
      password: commonSchemas.password,
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }),
};

// Health check schemas
export const healthCheckSchemas = {
  create: z.object({
    apiConnectionId: z.string().min(1, "Connection ID is required"),
    endpoint: commonSchemas.endpoint,
    method: commonSchemas.httpMethod,
    expectedStatus: commonSchemas.statusCode,
    timeout: commonSchemas.timeout,
    interval: commonSchemas.interval,
    headers: z.record(z.string()).optional(),
    body: z.string().optional(),
    queryParams: z.record(z.string()).optional(),
  }),
  // ID-based operations
  delete: z.object({
    healthCheckId: commonSchemas.healthCheckId,
  }),
  toggle: z.object({
    healthCheckId: commonSchemas.healthCheckId,
    isActive: commonSchemas.boolean,
  }),
  trigger: z.object({
    healthCheckId: commonSchemas.healthCheckId,
  }),
};

// Export type inference helpers
export type ConnectionValidationInput = z.infer<
  typeof connectionSchemas.validation
>;
export type ConnectionCreateInput = z.infer<typeof connectionSchemas.create>;
export type ConnectionToggleInput = z.infer<typeof connectionSchemas.toggle>;
export type ConnectionDeleteInput = z.infer<typeof connectionSchemas.delete>;
export type RegistrationInput = z.infer<typeof authSchemas.registration>;
export type HealthCheckCreateInput = z.infer<typeof healthCheckSchemas.create>;
export type HealthCheckDeleteInput = z.infer<typeof healthCheckSchemas.delete>;
export type HealthCheckToggleInput = z.infer<typeof healthCheckSchemas.toggle>;
export type HealthCheckTriggerInput = z.infer<
  typeof healthCheckSchemas.trigger
>;
