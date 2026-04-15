import { config as loadEnv } from "dotenv-flow";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default to the server package root (apps/server), so `.env` belongs next to package.json.
// This mirrors the common "server/.env" setup even when running from the monorepo root.
const serverRoot = path.resolve(__dirname, "..", "..");

const envRoot = process.env.BTS_ENV_ROOT
  ? path.resolve(process.env.BTS_ENV_ROOT)
  : serverRoot;
const nodeEnv = process.env.NODE_ENV ?? "development";

loadEnv({
  node_env: nodeEnv,
  path: envRoot,
});

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  HOST: z.string().min(1).default("0.0.0.0"),
  PORT: z.coerce.number().int().positive().default(5000),

  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  MONGODB_DB_NAME: z.string().min(1).default("blessedtourszim"),

  JWT_SECRET: z
    .string()
    .trim()
    .min(16, "JWT_SECRET must be at least 16 characters long"),

  COMMISSION_BPS: z.coerce.number().int().min(0).max(10_000).default(600),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  // eslint-disable-next-line no-console
  console.error("Invalid environment variables", result.error.flatten().fieldErrors);
  throw new Error("Failed to parse environment variables");
}

export const env = {
  ...result.data,
  nodeEnv: result.data.NODE_ENV,
  isDevelopment: result.data.NODE_ENV === "development",
  isTest: result.data.NODE_ENV === "test",
  isProduction: result.data.NODE_ENV === "production",
};
