import Fastify from "fastify";
import fastifyJwt from "@fastify/jwt";
import fastifyCors from "@fastify/cors";
import bcrypt from "bcryptjs";
import { closeMongo, getDb, pingMongo, toObjectId } from "@repo/db";
import { type Role, Roles, hello, isRole } from "@repo/shared";

import { env } from "./config/env.js";

const port = env.PORT;
const host = env.HOST;
const mongoUri = env.MONGODB_URI;
const dbName = env.MONGODB_DB_NAME;
const jwtSecret = env.JWT_SECRET;
const commissionBps = env.COMMISSION_BPS;

const app = Fastify({
  logger: true,
});

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const connectDbWithRetry = async () => {
  const maxRetries = 5;
  const baseDelay = 2000;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      app.log.info({ attempt, maxRetries }, "Connecting to MongoDB...");
      const database = await getDb({ uri: mongoUri, dbName });
      app.log.info("✅ MongoDB connected successfully");
      return database;
    } catch (error) {
      lastError = error;

      if (attempt < maxRetries) {
        const waitTime = baseDelay * attempt;
        app.log.warn(
          { attempt, maxRetries, waitTime, error },
          `MongoDB connection failed, retrying in ${waitTime}ms...`
        );
        await delay(waitTime);
      }
    }
  }

  app.log.error({ error: lastError }, "❌ Failed to connect to MongoDB after all retries");
  throw lastError;
};

await app.register(fastifyJwt, {
  secret: jwtSecret,
});

await app.register(fastifyCors, {
  origin: true,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

const db = await connectDbWithRetry();
const users = db.collection("users");
const vendorApplications = db.collection("vendorApplications");
const hotels = db.collection("hotels");
const activities = db.collection("activities");
const bookings = db.collection("bookings");
await users.createIndex({ email: 1 }, { unique: true });
await vendorApplications.createIndex({ status: 1, createdAt: -1 });
await vendorApplications.createIndex({ userId: 1, createdAt: -1 });
await hotels.createIndex({ location: "2dsphere" });
await activities.createIndex({ location: "2dsphere" });
await bookings.createIndex({ userId: 1, createdAt: -1 });

app.addHook("onClose", async () => {
  await closeMongo();
});

async function authenticate(request: import("fastify").FastifyRequest, reply: import("fastify").FastifyReply) {
  try {
    await request.jwtVerify();
  } catch {
    return reply.code(401).send({ ok: false, error: "Unauthorized" });
  }
}

function requireRole(required: Role) {
  return async (request: import("fastify").FastifyRequest, reply: import("fastify").FastifyReply) => {
    await authenticate(request, reply);
    if (reply.sent) return;

    const roles = request.user.roles ?? [];
    if (!roles.includes(required)) {
      return reply.code(403).send({ ok: false, error: "Forbidden" });
    }
  };
}

function requireAnyRole(required: readonly Role[]) {
  return async (request: import("fastify").FastifyRequest, reply: import("fastify").FastifyReply) => {
    await authenticate(request, reply);
    if (reply.sent) return;

    const roles = request.user.roles ?? [];
    if (!required.some((r) => roles.includes(r))) {
      return reply.code(403).send({ ok: false, error: "Forbidden" });
    }
  };
}

function asStringArray(value: unknown) {
  if (!Array.isArray(value)) return null;
  const out: string[] = [];
  for (const v of value) {
    if (typeof v !== "string") return null;
    out.push(v);
  }
  return out;
}

function asNumber(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") return Number(value);
  return NaN;
}

function geoPointFromLatLng(lat: unknown, lng: unknown) {
  const latitude = asNumber(lat);
  const longitude = asNumber(lng);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (latitude < -90 || latitude > 90) return null;
  if (longitude < -180 || longitude > 180) return null;
  return { type: "Point", coordinates: [longitude, latitude] as const };
}

app.get("/health", async () => ({ ok: true }));
app.get("/api/hello", async () => ({ message: hello("server") }));

app.get("/api/db-status", async (_req, reply) => {
  await pingMongo({ uri: mongoUri });
  return { ok: true };
});

// Step 1: Vendor onboarding (register already exists). This is the application + docs upload metadata.
app.post("/vendor/applications", { preHandler: authenticate }, async (request, reply) => {
  const body = request.body as {
    type?: unknown;
    documents?: unknown;
    notes?: unknown;
  };

  const type = body.type === "HOTEL" || body.type === "ACTIVITY" ? body.type : null;
  const documentsRaw = Array.isArray(body.documents) ? body.documents : null;
  const notes = typeof body.notes === "string" ? body.notes : undefined;

  if (!type || !documentsRaw) {
    return reply.code(400).send({ ok: false, error: "type and documents are required" });
  }

  const documents: { name: string; url: string }[] = [];
  for (const d of documentsRaw) {
    const doc = d as { name?: unknown; url?: unknown };
    if (typeof doc?.name !== "string" || typeof doc?.url !== "string") {
      return reply.code(400).send({ ok: false, error: "documents must be {name,url}[]" });
    }
    documents.push({ name: doc.name, url: doc.url });
  }

  const now = new Date();
  const appDoc = {
    userId: request.user.sub,
    type,
    status: "PENDING",
    documents,
    notes,
    createdAt: now,
    updatedAt: now,
  };

  const result = await vendorApplications.insertOne(appDoc);
  return { ok: true, applicationId: result.insertedId.toString(), status: "PENDING" };
});

app.get(
  "/vendor/applications/mine",
  { preHandler: authenticate },
  async (request) => {
    const list = await vendorApplications
      .find({ userId: request.user.sub })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    return {
      ok: true,
      applications: list.map((a) => ({
        id: a._id.toString(),
        type: a.type,
        status: a.status,
        documents: a.documents,
        notes: a.notes,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
      })),
    };
  }
);

// Admin: approvals (Super Admin + Ops Admin)
app.get(
  "/admin/vendor-applications",
  { preHandler: requireAnyRole([Roles.SUPER_ADMIN, Roles.OPERATIONS_ADMIN]) },
  async (request) => {
    const query = request.query as { status?: string };
    const status = query.status;
    const filter =
      status === "PENDING" || status === "APPROVED" || status === "REJECTED" ? { status } : {};

    const list = await vendorApplications
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    return {
      ok: true,
      applications: list.map((a) => ({
        id: a._id.toString(),
        userId: a.userId,
        type: a.type,
        status: a.status,
        documents: a.documents,
        notes: a.notes,
        decidedByUserId: a.decidedByUserId,
        decidedAt: a.decidedAt,
        createdAt: a.createdAt,
      })),
    };
  }
);

app.patch(
  "/admin/vendor-applications/:id/approve",
  { preHandler: requireAnyRole([Roles.SUPER_ADMIN, Roles.OPERATIONS_ADMIN]) },
  async (request, reply) => {
    const params = request.params as { id?: string };
    if (!params.id) return reply.code(400).send({ ok: false, error: "id is required" });

    const now = new Date();
    const application = await vendorApplications.findOne({ _id: toObjectId(params.id) });
    if (!application) return reply.code(404).send({ ok: false, error: "Application not found" });
    if (application.status !== "PENDING") {
      return reply.code(409).send({ ok: false, error: "Application already decided" });
    }

    await vendorApplications.updateOne(
      { _id: application._id },
      {
        $set: {
          status: "APPROVED",
          decidedByUserId: request.user.sub,
          decidedAt: now,
          updatedAt: now,
        },
      }
    );

    const roleToAdd = application.type === "HOTEL" ? Roles.HOTEL_OWNER : Roles.ACTIVITY_OWNER;
    await users.updateOne(
      { _id: toObjectId(application.userId) },
      {
        $addToSet: { roles: roleToAdd },
        $set: { vendorVerified: true, updatedAt: now },
      }
    );

    return { ok: true };
  }
);

app.patch(
  "/admin/vendor-applications/:id/reject",
  { preHandler: requireAnyRole([Roles.SUPER_ADMIN, Roles.OPERATIONS_ADMIN]) },
  async (request, reply) => {
    const params = request.params as { id?: string };
    const body = request.body as { reason?: unknown };
    if (!params.id) return reply.code(400).send({ ok: false, error: "id is required" });
    const reason = typeof body.reason === "string" ? body.reason : undefined;

    const now = new Date();
    const result = await vendorApplications.updateOne(
      { _id: toObjectId(params.id), status: "PENDING" },
      {
        $set: {
          status: "REJECTED",
          notes: reason,
          decidedByUserId: request.user.sub,
          decidedAt: now,
          updatedAt: now,
        },
      }
    );

    if (result.matchedCount === 0) {
      return reply.code(404).send({ ok: false, error: "Application not found (or already decided)" });
    }

    return { ok: true };
  }
);

// Step 2: Smart search (Hotels + nearby activities within radiusKm).
app.get("/search", async (request) => {
  const q = request.query as {
    query?: string;
    lat?: string;
    lng?: string;
    radiusKm?: string;
  };

  const query = typeof q.query === "string" ? q.query.trim() : "";
  const lat = Number.parseFloat(q.lat ?? "");
  const lng = Number.parseFloat(q.lng ?? "");
  const radiusKm = Number.parseFloat(q.radiusKm ?? "30");

  const hasGeo = Number.isFinite(lat) && Number.isFinite(lng);
  const radiusRadians = radiusKm / 6378.1;

  const textFilter = query
    ? {
        $or: [
          { name: { $regex: query, $options: "i" } },
          { locationName: { $regex: query, $options: "i" } },
          { tags: { $elemMatch: { $regex: query, $options: "i" } } },
        ],
      }
    : {};

  const geoFilter = hasGeo
    ? {
        location: {
          $geoWithin: {
            $centerSphere: [[lng, lat], radiusRadians],
          },
        },
      }
    : {};

  const [hotelResults, activityResults] = await Promise.all([
    hotels
      .find({ ...textFilter, ...geoFilter })
      .limit(50)
      .toArray(),
    activities
      .find({ ...textFilter, ...geoFilter })
      .limit(50)
      .toArray(),
  ]);

  return {
    ok: true,
    hotels: hotelResults.map((h) => ({ id: h._id.toString(), ...h, _id: undefined })),
    activities: activityResults.map((a) => ({ id: a._id.toString(), ...a, _id: undefined })),
  };
});

// Vendor: create and view own listings
app.post(
  "/vendor/hotels",
  { preHandler: requireAnyRole([Roles.HOTEL_OWNER, Roles.HOTEL_MANAGER]) },
  async (request, reply) => {
    const body = request.body as {
      name?: unknown;
      locationName?: unknown;
      lat?: unknown;
      lng?: unknown;
      tags?: unknown;
      rooms?: unknown;
    };

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const locationName = typeof body.locationName === "string" ? body.locationName.trim() : "";
    const tags = asStringArray(body.tags) ?? [];
    const location = geoPointFromLatLng(body.lat, body.lng);

    if (!name || !locationName || !location) {
      return reply
        .code(400)
        .send({ ok: false, error: "name, locationName, lat, lng are required" });
    }

    const roomsRaw = Array.isArray(body.rooms) ? body.rooms : [];
    const rooms: { type: string; total: number; booked: number; basePrice: number }[] = [];
    for (const r of roomsRaw) {
      const room = r as { type?: unknown; total?: unknown; booked?: unknown; basePrice?: unknown };
      const t = typeof room.type === "string" ? room.type.trim() : "";
      const total = asNumber(room.total);
      const booked = Number.isFinite(asNumber(room.booked)) ? asNumber(room.booked) : 0;
      const basePrice = asNumber(room.basePrice);

      if (!t || !Number.isFinite(total) || !Number.isFinite(basePrice)) {
        return reply.code(400).send({ ok: false, error: "Invalid rooms[]" });
      }

      rooms.push({
        type: t,
        total: Math.max(0, Math.trunc(total)),
        booked: Math.max(0, Math.trunc(booked)),
        basePrice: Math.max(0, basePrice),
      });
    }

    const now = new Date();
    const result = await hotels.insertOne({
      ownerUserId: request.user.sub,
      name,
      locationName,
      location,
      verified: false,
      rooms,
      tags,
      createdAt: now,
      updatedAt: now,
    });

    return { ok: true, hotelId: result.insertedId.toString(), verified: false };
  }
);

app.get(
  "/vendor/hotels/mine",
  { preHandler: requireAnyRole([Roles.HOTEL_OWNER, Roles.HOTEL_MANAGER]) },
  async (request) => {
    const list = await hotels
      .find({ ownerUserId: request.user.sub })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();
    return {
      ok: true,
      hotels: list.map((h) => ({ id: h._id.toString(), ...h, _id: undefined })),
    };
  }
);

app.post(
  "/vendor/activities",
  { preHandler: requireAnyRole([Roles.ACTIVITY_OWNER, Roles.ACTIVITY_MANAGER]) },
  async (request, reply) => {
    const body = request.body as {
      name?: unknown;
      locationName?: unknown;
      lat?: unknown;
      lng?: unknown;
      tags?: unknown;
      slotTimes?: unknown;
      capacity?: unknown;
      price?: unknown;
    };

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const locationName = typeof body.locationName === "string" ? body.locationName.trim() : "";
    const tags = asStringArray(body.tags) ?? [];
    const slotTimes = asStringArray(body.slotTimes) ?? [];
    const capacity = asNumber(body.capacity);
    const price = asNumber(body.price);
    const location = geoPointFromLatLng(body.lat, body.lng);

    if (!name || !locationName || !location || !Number.isFinite(capacity) || !Number.isFinite(price)) {
      return reply
        .code(400)
        .send({ ok: false, error: "name, locationName, lat, lng, capacity, price are required" });
    }

    const now = new Date();
    const result = await activities.insertOne({
      ownerUserId: request.user.sub,
      name,
      locationName,
      location,
      verified: false,
      slotTimes,
      capacity: Math.max(0, Math.trunc(capacity)),
      booked: 0,
      price: Math.max(0, price),
      tags,
      createdAt: now,
      updatedAt: now,
    });

    return { ok: true, activityId: result.insertedId.toString(), verified: false };
  }
);

app.get(
  "/vendor/activities/mine",
  { preHandler: requireAnyRole([Roles.ACTIVITY_OWNER, Roles.ACTIVITY_MANAGER]) },
  async (request) => {
    const list = await activities
      .find({ ownerUserId: request.user.sub })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();
    return {
      ok: true,
      activities: list.map((a) => ({ id: a._id.toString(), ...a, _id: undefined })),
    };
  }
);

// Admin: verify listings (separate from vendor verification)
app.get(
  "/admin/hotels",
  { preHandler: requireAnyRole([Roles.SUPER_ADMIN, Roles.OPERATIONS_ADMIN]) },
  async (request) => {
    const query = request.query as { verified?: string };
    const verified = query.verified === "true" ? true : query.verified === "false" ? false : undefined;
    const filter = typeof verified === "boolean" ? { verified } : {};
    const list = await hotels.find(filter).sort({ createdAt: -1 }).limit(100).toArray();
    return { ok: true, hotels: list.map((h) => ({ id: h._id.toString(), ...h, _id: undefined })) };
  }
);

app.patch(
  "/admin/hotels/:id/verify",
  { preHandler: requireAnyRole([Roles.SUPER_ADMIN, Roles.OPERATIONS_ADMIN]) },
  async (request, reply) => {
    const params = request.params as { id?: string };
    if (!params.id) return reply.code(400).send({ ok: false, error: "id is required" });
    const now = new Date();
    const result = await hotels.updateOne(
      { _id: toObjectId(params.id) },
      { $set: { verified: true, updatedAt: now } }
    );
    if (result.matchedCount === 0) return reply.code(404).send({ ok: false, error: "Hotel not found" });
    return { ok: true };
  }
);

app.get(
  "/admin/activities",
  { preHandler: requireAnyRole([Roles.SUPER_ADMIN, Roles.OPERATIONS_ADMIN]) },
  async (request) => {
    const query = request.query as { verified?: string };
    const verified = query.verified === "true" ? true : query.verified === "false" ? false : undefined;
    const filter = typeof verified === "boolean" ? { verified } : {};
    const list = await activities.find(filter).sort({ createdAt: -1 }).limit(100).toArray();
    return {
      ok: true,
      activities: list.map((a) => ({ id: a._id.toString(), ...a, _id: undefined })),
    };
  }
);

app.patch(
  "/admin/activities/:id/verify",
  { preHandler: requireAnyRole([Roles.SUPER_ADMIN, Roles.OPERATIONS_ADMIN]) },
  async (request, reply) => {
    const params = request.params as { id?: string };
    if (!params.id) return reply.code(400).send({ ok: false, error: "id is required" });
    const now = new Date();
    const result = await activities.updateOne(
      { _id: toObjectId(params.id) },
      { $set: { verified: true, updatedAt: now } }
    );
    if (result.matchedCount === 0) return reply.code(404).send({ ok: false, error: "Activity not found" });
    return { ok: true };
  }
);

// Step 4/5: Booking + payment split (record only; payment gateway integration comes later).
app.post("/bookings", { preHandler: authenticate }, async (request, reply) => {
  const body = request.body as {
    type?: unknown;
    hotelId?: unknown;
    activityIds?: unknown;
    totalAmount?: unknown;
  };

  const type = body.type === "HOTEL" || body.type === "ACTIVITY" || body.type === "BUNDLE" ? body.type : null;
  const hotelId = typeof body.hotelId === "string" ? body.hotelId : undefined;
  const activityIds = Array.isArray(body.activityIds) ? body.activityIds.filter((x) => typeof x === "string") : undefined;
  const totalAmount = typeof body.totalAmount === "number" ? body.totalAmount : null;

  if (!type || !totalAmount || totalAmount <= 0) {
    return reply.code(400).send({ ok: false, error: "type and totalAmount are required" });
  }

  const platformAmount = Math.round((totalAmount * commissionBps) / 10000);
  const remaining = totalAmount - platformAmount;

  const hotelAmount = type === "HOTEL" || type === "BUNDLE" ? Math.round(remaining * 0.75) : 0;
  const activityAmount = remaining - hotelAmount;

  const now = new Date();
  const bookingDoc = {
    userId: request.user.sub,
    type,
    hotelId,
    activityIds,
    totalAmount,
    currency: "INR",
    split: { hotelAmount, activityAmount, platformAmount },
    status: "PENDING",
    createdAt: now,
    updatedAt: now,
  };

  const result = await bookings.insertOne(bookingDoc);
  return {
    ok: true,
    bookingId: result.insertedId.toString(),
    split: bookingDoc.split,
    status: bookingDoc.status,
  };
});

app.post("/auth/register", async (request, reply) => {
  const body = request.body as { email?: unknown; password?: unknown; affiliate?: unknown };
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const affiliate = body.affiliate === true;

  if (!email || !password) {
    return reply.code(400).send({ ok: false, error: "email and password are required" });
  }

  const roles: Role[] = [Roles.CUSTOMER];
  if (affiliate) roles.push(Roles.AFFILIATE_PARTNER);

  const passwordHash = bcrypt.hashSync(password, 12);
  const now = new Date();

  try {
    const result = await users.insertOne({
      email,
      passwordHash,
      roles,
      createdAt: now,
      updatedAt: now,
    });

    const token = app.jwt.sign({ sub: result.insertedId.toString(), roles });
    return { ok: true, token, user: { id: result.insertedId.toString(), email, roles } };
  } catch {
    return reply.code(409).send({ ok: false, error: "User already exists" });
  }
});

app.post("/auth/login", async (request, reply) => {
  const body = request.body as { email?: unknown; password?: unknown };
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return reply.code(400).send({ ok: false, error: "email and password are required" });
  }

  const user = await users.findOne({ email });
  if (!user || typeof user.passwordHash !== "string") {
    return reply.code(401).send({ ok: false, error: "Invalid credentials" });
  }

  const ok = bcrypt.compareSync(password, user.passwordHash);
  if (!ok) {
    return reply.code(401).send({ ok: false, error: "Invalid credentials" });
  }

  const roles = (Array.isArray(user.roles) ? user.roles : []) as Role[];
  const token = app.jwt.sign({ sub: user._id.toString(), roles });
  return { ok: true, token, user: { id: user._id.toString(), email: user.email, roles } };
});

app.get("/me", { preHandler: authenticate }, async (request) => {
  return { ok: true, user: request.user };
});

app.patch(
  "/admin/users/:id/roles",
  { preHandler: requireRole(Roles.SUPER_ADMIN) },
  async (request, reply) => {
    const params = request.params as { id?: string };
    const body = request.body as { roles?: unknown };

    const nextRoles = Array.isArray(body.roles) ? body.roles : null;
    if (!params.id || !nextRoles) {
      return reply.code(400).send({ ok: false, error: "id and roles are required" });
    }

    const validated: Role[] = [];
    for (const r of nextRoles) {
      if (typeof r !== "string" || !isRole(r)) {
        return reply.code(400).send({ ok: false, error: `Invalid role: ${String(r)}` });
      }
      validated.push(r);
    }

    const result = await users.updateOne(
      { _id: toObjectId(params.id) },
      { $set: { roles: validated, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return reply.code(404).send({ ok: false, error: "User not found" });
    }

    return { ok: true, roles: validated };
  }
);

await app.listen({ port, host });
