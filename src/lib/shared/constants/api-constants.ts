/**
 * API-related constants
 */

export const HTTP_METHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
  PATCH: "PATCH",
} as const;

export const HTTP_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  RATE_LIMITED: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const API_ENDPOINTS = {
  STRIPE_BALANCE_TRANSACTIONS: "https://api.stripe.com/v1/balance_transactions",
  TWILIO_USAGE_RECORDS:
    "https://api.twilio.com/2010-04-01/Accounts/{accountSid}/Usage/Records.json",
} as const;

export const API_RATE_LIMITS = {
  DEFAULT_BATCH_SIZE: 5,
  DEFAULT_DELAY_MS: 1000,
  MAX_RETRIES: 3,
} as const;

export const API_TIMEOUTS = {
  DEFAULT: 5000,
  HEALTH_CHECK: 30000,
  COST_TRACKING: 10000,
} as const;
