import { z } from "zod";

// Public environment variables
// These are exposed to the client-side
const envSchemaPublic = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_LOG_LEVEL: z.string(),
});

const clientEnv = envSchemaPublic.safeParse({
  NEXT_PUBLIC_APP_URL: process.env["NEXT_PUBLIC_APP_URL"],
  NEXT_PUBLIC_LOG_LEVEL: process.env["NEXT_PUBLIC_LOG_LEVEL"],
});

if (!clientEnv.success) {
  console.error(
    "❌ Invalid client environment variables:",
    clientEnv.error.format()
  );
}

export default clientEnv.data;
