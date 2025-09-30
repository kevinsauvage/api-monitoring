import { z } from "zod";

const envSchemaPrivate = z.object({
  NEXTAUTH_SECRET: z.string().min(1, "NEXTAUTH_SECRET is required"),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  CRON_SECRET: z.string().min(1),
  NODE_ENV: z.string().min(1),
  ENCRYPTION_KEY: z.string().min(1),
  LOG_LEVEL: z.string().optional(),
});

const envSchemaPublic = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url(),
});

// Parse once at module load. If invalid, this will throw during startup
export const envPrivate = () => envSchemaPrivate.parse(process.env);

export const envPublic = () => envSchemaPublic.parse(process.env);

export type EnvPrivate = z.infer<typeof envSchemaPrivate>;
export type EnvPublic = z.infer<typeof envSchemaPublic>;
