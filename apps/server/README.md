# server

Fastify API server.

## Environment

- Copy `apps/server/.env.example` to `apps/server/.env` and set `MONGODB_URI`.
- Also set `JWT_SECRET` (any long random string for local dev).

## Scripts

- `pnpm dev` (from repo root) runs all apps/packages via Turborepo
- `pnpm --filter server dev` runs just this server

## Endpoints

- `GET /health`
- `GET /api/hello`
- `GET /api/db-status` (pings MongoDB)

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `GET /me` (JWT)

### Vendor onboarding

- `POST /vendor/applications` (JWT)
- `GET /vendor/applications/mine` (JWT)

### Vendor listings

- `POST /vendor/hotels` (JWT + HOTEL_OWNER/HOTEL_MANAGER)
- `GET /vendor/hotels/mine` (JWT + HOTEL_OWNER/HOTEL_MANAGER)
- `POST /vendor/activities` (JWT + ACTIVITY_OWNER/ACTIVITY_MANAGER)
- `GET /vendor/activities/mine` (JWT + ACTIVITY_OWNER/ACTIVITY_MANAGER)

### Admin

- `GET /admin/vendor-applications` (JWT + SUPER_ADMIN/OPERATIONS_ADMIN)
- `PATCH /admin/vendor-applications/:id/approve` (JWT + SUPER_ADMIN/OPERATIONS_ADMIN)
- `PATCH /admin/vendor-applications/:id/reject` (JWT + SUPER_ADMIN/OPERATIONS_ADMIN)
- `GET /admin/hotels` (JWT + SUPER_ADMIN/OPERATIONS_ADMIN)
- `PATCH /admin/hotels/:id/verify` (JWT + SUPER_ADMIN/OPERATIONS_ADMIN)
- `GET /admin/activities` (JWT + SUPER_ADMIN/OPERATIONS_ADMIN)
- `PATCH /admin/activities/:id/verify` (JWT + SUPER_ADMIN/OPERATIONS_ADMIN)

### Search + bookings

- `GET /search` (geo + text)
- `POST /bookings` (JWT)
