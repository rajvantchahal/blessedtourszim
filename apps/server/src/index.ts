import Fastify from "fastify";
import { pingMongo } from "@repo/db";
import { hello } from "@repo/shared";

const port = Number.parseInt(process.env.PORT ?? "4000", 10);
const host = process.env.HOST ?? "0.0.0.0";

const app = Fastify({
  logger: true,
});

app.get("/health", async () => ({ ok: true }));
app.get("/api/hello", async () => ({ message: hello("server") }));

app.get("/api/db-status", async (_req, reply) => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    return reply.code(500).send({ ok: false, error: "MONGODB_URI is not set" });
  }

  await pingMongo({ uri });
  return { ok: true };
});

await app.listen({ port, host });
