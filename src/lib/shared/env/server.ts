import { z } from "zod";

const isTest =
  process.env.NODE_ENV === "test" || !!process.env["VITEST_WORKER_ID"];

const envSchemaPrivate = z.object({
  NEXTAUTH_SECRET: z.string().min(1, "NEXTAUTH_SECRET is required"),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),
  CRON_SECRET: z.string().min(1),
  ENCRYPTION_KEY: z.string().min(32).max(32),
  BASIC_AUTH_ENABLED: z.string().default("false"),
  BASIC_AUTH_USERNAME: z.string().optional(),
  BASIC_AUTH_PASSWORD: z.string().optional(),
});

const serverEnv = isTest ? process.env : envSchemaPrivate.parse(process.env);
export default serverEnv;
