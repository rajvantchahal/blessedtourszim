# server

Fastify API server.

## Environment

- Copy `apps/server/.env.example` to `apps/server/.env` and set `MONGODB_URI`.

## Scripts

- `pnpm dev` (from repo root) runs all apps/packages via Turborepo
- `pnpm --filter server dev` runs just this server

## Endpoints

- `GET /health`
- `GET /api/hello`
- `GET /api/db-status` (pings MongoDB)
