import { z } from "zod";

// Public environment variables
// These are exposed to the client-side
const envSchemaPublic = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_LOG_LEVEL: z.string().default("info"),
});

const clientEnv = envSchemaPublic.parse({
  NEXT_PUBLIC_APP_URL: process.env["NEXT_PUBLIC_APP_URL"],
  NEXT_PUBLIC_LOG_LEVEL: process.env["NEXT_PUBLIC_LOG_LEVEL"],
});

export default clientEnv;
