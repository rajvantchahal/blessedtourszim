# BlessedToursZim Monorepo

Turborepo + pnpm workspaces monorepo.

## Apps

- `apps/web`: Next.js web app
- `apps/docs`: Next.js docs app
- `apps/server`: Fastify API (TypeScript) + MongoDB + JWT

## Packages

- `packages/ui`: shared UI components
- `packages/shared`: shared types + role system
- `packages/db`: MongoDB helpers

## Prerequisites

- Node.js + pnpm
- MongoDB (local) — easiest with Docker OR any local Mongo you manage

## MongoDB (Compass setup)

MongoDB Compass is just a GUI client — the server still needs a MongoDB instance running.

### Option A (recommended): run MongoDB via Docker

From the repo root:

```sh
docker-compose up -d
```

If your system uses the newer Docker Compose plugin, use:

```sh
docker compose up -d
```

In MongoDB Compass, connect to:

```text
mongodb://localhost:27017
```

### Option B: your own local MongoDB

If you already have MongoDB running on your machine, just connect Compass to your local connection string (often `mongodb://localhost:27017`).

If you have MongoDB installed but not running, you can start it manually (no admin rights required) from the repo root:

```sh
mkdir -p .mongo-data

# If `mongod` is on your PATH
mongod --dbpath .mongo-data --bind_ip 127.0.0.1 --port 27017
```

## Server environment

Create `apps/server/.env` (IMPORTANT: place it inside `apps/server`, not repo root):

```sh
cp apps/server/.env.example apps/server/.env
```

Then set at least:

```text
MONGODB_URI=mongodb://127.0.0.1:27017/blessedtourszim
JWT_SECRET=replace-with-any-long-random-string
PORT=5000
```

By default the server loads env files from `apps/server`.

If you prefer keeping a single `.env` in the repo root, set `BTS_ENV_ROOT` to the repo root when starting the server.

## Run

Install deps:

```sh
pnpm install
```

Run everything:

```sh
pnpm dev
```

Or run only the API server:

```sh
pnpm --filter server dev
```

Or run only the web app:

```sh
pnpm --filter web dev
```

## Troubleshooting

### "EADDRINUSE: address already in use" (3000/5000)

This means you already have a previous dev server still running on that port.

- Stop it by going to that terminal and pressing `Ctrl+C`.
- Or on Windows, find & kill the process using PowerShell:

```powershell
# show which PID is listening on the port
Get-NetTCPConnection -LocalPort 3000 -State Listen | Select-Object LocalPort,OwningProcess

# kill it (replace PID)
Stop-Process -Id 12345 -Force
```
