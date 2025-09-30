import { z } from "zod";

// Private environment variables
// These should never be exposed to the client-side
const envSchemaPrivate = z.object({
  NEXTAUTH_SECRET: z.string().min(1, "NEXTAUTH_SECRET is required"),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),
  CRON_SECRET: z.string().min(1),
  ENCRYPTION_KEY: z.string().min(1),
  BASIC_AUTH_ENABLED: z.string().min(1),
  BASIC_AUTH_USERNAME: z.string().min(1),
  BASIC_AUTH_PASSWORD: z.string().min(1),
});

const serverEnv = envSchemaPrivate.safeParse(process.env);

if (!serverEnv.success) {
  console.error(
    "❌ Invalid server environment variables:",
    serverEnv.error.format()
  );
}

// Now serverEnv.data is fully typed and safe to use

export default serverEnv.data;
