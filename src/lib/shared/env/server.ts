import { z } from "zod";

// Private environment variables
// These should never be exposed to the client-side
// Note: Make dev-only Basic Auth variables optional so production builds on Vercel don't fail
// when they are not defined. We additionally validate them only if explicitly enabled.
const envSchemaPrivate = z.object({
  NEXTAUTH_SECRET: z.string().min(1, "NEXTAUTH_SECRET is required"),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),
  CRON_SECRET: z.string().min(1),
  ENCRYPTION_KEY: z.string().min(1),
  BASIC_AUTH_ENABLED: z.string().default("false"),
  BASIC_AUTH_USERNAME: z.string().optional(),
  BASIC_AUTH_PASSWORD: z.string().optional(),
});

const serverEnv = envSchemaPrivate.parse(process.env);
export default serverEnv;
