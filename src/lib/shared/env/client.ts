import { z } from "zod";

const isTest =
  process.env.NODE_ENV === "test" || !!process.env["VITEST_WORKER_ID"];

const envSchemaPublic = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_LOG_LEVEL: z.string().default("info"),
});

const clientEnv = isTest
  ? process.env
  : envSchemaPublic.parse({
      NEXT_PUBLIC_APP_URL: process.env["NEXT_PUBLIC_APP_URL"],
      NEXT_PUBLIC_LOG_LEVEL: process.env["NEXT_PUBLIC_LOG_LEVEL"],
    });

export default clientEnv;
