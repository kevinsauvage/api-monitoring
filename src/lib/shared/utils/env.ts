import { z } from "zod";

const envSchemaPrivate = z.object({
  NEXTAUTH_SECRET: z.string().min(1, "NEXTAUTH_SECRET is required"),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),
  CRON_SECRET: z.string().min(1),
  ENCRYPTION_KEY: z.string().min(1),
});

const envSchemaPublic = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_LOG_LEVEL: z.string().optional(),
});

export const envPrivate = () => {
  return envSchemaPrivate.parse(process.env);
};

export const envPublic = () => {
  return envSchemaPublic.parse(process.env);
};

export type EnvPrivate = z.infer<typeof envSchemaPrivate>;
export type EnvPublic = z.infer<typeof envSchemaPublic>;
