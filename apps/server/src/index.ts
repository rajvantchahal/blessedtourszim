import Fastify from "fastify";
import fastifyJwt from "@fastify/jwt";
import fastifyCors from "@fastify/cors";
import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "node:crypto";
import { closeMongo, getDb, pingMongo, toObjectId } from "@repo/db";
import {
  type Permission,
  type Role,
  Permissions,
  Roles,
  getPermissionsForRole,
  hello,
  isPermission,
  isRole,
} from "@repo/shared";

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
const passwordResets = db.collection("passwordResets");
const rolePermissionOverrides = db.collection("rolePermissionOverrides");
const auditLogs = db.collection("auditLogs");
const approvals = db.collection("approvals");
const sessions = db.collection("sessions");
const emailVerifications = db.collection("emailVerifications");
const phoneOtps = db.collection("phoneOtps");
const twoFactorChallenges = db.collection("twoFactorChallenges");
const loginAttempts = db.collection("loginAttempts");
const securityEvents = db.collection("securityEvents");
const wishlists = db.collection("wishlists");
const reviews = db.collection("reviews");
const loyalty = db.collection("loyalty");
const coupons = db.collection("coupons");
const paymentMethods = db.collection("paymentMethods");
const notificationSettings = db.collection("notificationSettings");
const tripDrafts = db.collection("tripDrafts");
const hotelsRooms = db.collection("hotelsRooms");
const hotelsDrafts = db.collection("hotelsDrafts");
const hotelsGallery = db.collection("hotelsGallery");
const hotelsManagers = db.collection("hotelsManagers");
const hotelsPricing = db.collection("hotelsPricing");
const hotelsBlackout = db.collection("hotelsBlackout");
await users.createIndex({ email: 1 }, { unique: true });
await vendorApplications.createIndex({ status: 1, createdAt: -1 });
await vendorApplications.createIndex({ userId: 1, createdAt: -1 });
await hotels.createIndex({ location: "2dsphere" });
await activities.createIndex({ location: "2dsphere" });
await bookings.createIndex({ userId: 1, createdAt: -1 });
await passwordResets.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
await passwordResets.createIndex({ userId: 1, createdAt: -1 });
await rolePermissionOverrides.createIndex({ role: 1 }, { unique: true });
await auditLogs.createIndex({ createdAt: -1 });
await auditLogs.createIndex({ targetUserId: 1, createdAt: -1 });
await approvals.createIndex({ status: 1, createdAt: -1 });
await approvals.createIndex({ requestedByUserId: 1, createdAt: -1 });
await sessions.createIndex({ userId: 1, createdAt: -1 });
await sessions.createIndex({ sessionId: 1 }, { unique: true });
await sessions.createIndex({ revokedAt: 1, createdAt: -1 });
await emailVerifications.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
await emailVerifications.createIndex({ userId: 1, createdAt: -1 });
await phoneOtps.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
await phoneOtps.createIndex({ userId: 1, createdAt: -1 });
await twoFactorChallenges.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
await twoFactorChallenges.createIndex({ createdAt: -1 });
await loginAttempts.createIndex({ email: 1 }, { unique: true });
await loginAttempts.createIndex({ lockUntil: 1 });
await securityEvents.createIndex({ userId: 1, createdAt: -1 });
await securityEvents.createIndex({ createdAt: -1 });
await wishlists.createIndex({ userId: 1 });
await reviews.createIndex({ userId: 1, createdAt: -1 });
await loyalty.createIndex({ userId: 1 });
await coupons.createIndex({ userId: 1 });
await paymentMethods.createIndex({ userId: 1 });
await notificationSettings.createIndex({ userId: 1 });
await tripDrafts.createIndex({ userId: 1, updatedAt: -1 });
await hotelsRooms.createIndex({ hotelId: 1 });
await hotelsDrafts.createIndex({ ownerId: 1, status: 1 });
await hotelsGallery.createIndex({ hotelId: 1 });
await hotelsManagers.createIndex({ hotelId: 1 });
await hotelsPricing.createIndex({ hotelId: 1 });
await hotelsBlackout.createIndex({ hotelId: 1 });

function sha256(input: string) {
  return createHash("sha256").update(input).digest("hex");
}

function getRequestMeta(request: import("fastify").FastifyRequest) {
  const ua = request.headers["user-agent"];
  return {
    ip: request.ip,
    userAgent: typeof ua === "string" ? ua : undefined,
  };
}

function base32Encode(bytes: Uint8Array) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = 0;
  let value = 0;
  let output = "";
  for (const b of bytes) {
    value = (value << 8) | b;
    bits += 8;
    while (bits >= 5) {
      output += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) output += alphabet[(value << (5 - bits)) & 31];
  return output;
}

function base32Decode(input: string) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const clean = input.toUpperCase().replace(/=+$/g, "").replace(/[^A-Z2-7]/g, "");
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const ch of clean) {
    const idx = alphabet.indexOf(ch);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return new Uint8Array(out);
}

async function totpCode(args: { secretBase32: string; step?: number; digits?: number; t?: number }) {
  const step = args.step ?? 30;
  const digits = args.digits ?? 6;
  const counter = Math.floor((args.t ?? Date.now()) / 1000 / step);
  const key = base32Decode(args.secretBase32);

  const msg = Buffer.alloc(8);
  msg.writeBigUInt64BE(BigInt(counter), 0);

  const { createHmac } = await import("node:crypto");
  const digest = createHmac("sha1", Buffer.from(key)).update(msg).digest();
  const lastByte = digest[digest.length - 1] ?? 0;
  const offset = lastByte & 0x0f;
  const bin = digest.readUInt32BE(offset) & 0x7fffffff;
  const otp = bin % 10 ** digits;
  return otp.toString().padStart(digits, "0");
}

async function verifyTotp(args: { secretBase32: string; code: string }) {
  const input = args.code.trim();
  if (!/^[0-9]{6}$/.test(input)) return false;
  const now = Date.now();
  const windows = [-1, 0, 1];
  for (const w of windows) {
    const t = now + w * 30_000;
    const c = await totpCode({ secretBase32: args.secretBase32, t });
    if (c === input) return true;
  }
  return false;
}

function makeNumericCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function writeSecurityEvent(args: {
  type: string;
  userId?: string;
  email?: string;
  summary: string;
  request: import("fastify").FastifyRequest;
  meta?: unknown;
}) {
  const now = new Date();
  await securityEvents.insertOne({
    type: args.type,
    userId: args.userId,
    email: args.email,
    summary: args.summary,
    meta: args.meta,
    ...getRequestMeta(args.request),
    createdAt: now,
  });
}

app.addHook("onClose", async () => {
  await closeMongo();
});

async function authenticate(request: import("fastify").FastifyRequest, reply: import("fastify").FastifyReply) {
  try {
    await request.jwtVerify();
  } catch {
    return reply.code(401).send({ ok: false, error: "Unauthorized" });
  }

  // Enforce server-side session revocation if sid is present.
  if (request.user.sid) {
    const sid = request.user.sid;
    const s = await sessions.findOne({ $or: [{ sessionId: sid }, { sid }] });
    if (!s || s.revokedAt) {
      return reply.code(401).send({ ok: false, error: "Unauthorized" });
    }
    await sessions.updateOne(
      { _id: s._id },
      { $set: { lastSeenAt: new Date(), ...getRequestMeta(request) } }
    );
  }

  const userId = request.user.sub;
  const user = await users.findOne(
    { _id: toObjectId(userId) },
    {
      projection: {
        roles: 1,
        permissionsGrant: 1,
        permissionsDeny: 1,
        vendorOwnerUserId: 1,
        emailVerified: 1,
        phoneVerified: 1,
        twoFactorEnabled: 1,
      },
    }
  );
  if (!user) {
    return reply.code(401).send({ ok: false, error: "Unauthorized" });
  }

  const validatedRoles: Role[] = [];
  if (Array.isArray(user.roles)) {
    for (const r of user.roles) {
      if (typeof r === "string" && isRole(r)) validatedRoles.push(r);
    }
  }
  request.user.roles = validatedRoles;

  const overrides = await rolePermissionOverrides
    .find({ role: { $in: validatedRoles } })
    .project({ role: 1, permissions: 1 })
    .toArray();
  const overrideByRole = new Map<string, Permission[]>();
  for (const o of overrides) {
    const role = (o as { role?: unknown }).role;
    const permissionsRaw = (o as { permissions?: unknown }).permissions;
    if (typeof role !== "string" || !isRole(role)) continue;
    if (!Array.isArray(permissionsRaw)) continue;
    const list: Permission[] = [];
    for (const p of permissionsRaw) {
      if (typeof p === "string" && isPermission(p)) list.push(p);
    }
    overrideByRole.set(role, list);
  }

  const grant: Permission[] = [];
  if (Array.isArray(user.permissionsGrant)) {
    for (const p of user.permissionsGrant) {
      if (typeof p === "string" && isPermission(p)) grant.push(p);
    }
  }

  const deny: Permission[] = [];
  if (Array.isArray(user.permissionsDeny)) {
    for (const p of user.permissionsDeny) {
      if (typeof p === "string" && isPermission(p)) deny.push(p);
    }
  }

  const basePermissions = new Set<Permission>();
  for (const role of validatedRoles) {
    const rolePerms = overrideByRole.get(role) ?? [...getPermissionsForRole(role)];
    for (const p of rolePerms) basePermissions.add(p);
  }
  for (const p of grant) basePermissions.add(p);
  for (const p of deny) basePermissions.delete(p);

  request.authz = {
    userId,
    roles: validatedRoles,
    permissions: [...basePermissions],
    vendorOwnerUserId: typeof (user as any).vendorOwnerUserId === "string" ? (user as any).vendorOwnerUserId : undefined,
  };
}

async function writeAuditLog(args: {
  event: string;
  actorUserId: string;
  targetUserId?: string;
  summary: string;
  before?: unknown;
  after?: unknown;
  request: import("fastify").FastifyRequest;
}) {
  const now = new Date();
  await auditLogs.insertOne({
    event: args.event,
    actorUserId: args.actorUserId,
    targetUserId: args.targetUserId,
    summary: args.summary,
    before: args.before,
    after: args.after,
    ...getRequestMeta(args.request),
    createdAt: now,
  });
}

async function createApproval(args: {
  type: string;
  requestedByUserId: string;
  targetUserId?: string;
  summary: string;
  payload: unknown;
  request: import("fastify").FastifyRequest;
}) {
  const now = new Date();
  const result = await approvals.insertOne({
    type: args.type,
    status: "PENDING",
    requestedByUserId: args.requestedByUserId,
    targetUserId: args.targetUserId,
    summary: args.summary,
    payload: args.payload,
    ...getRequestMeta(args.request),
    createdAt: now,
    updatedAt: now,
  });
  return result.insertedId.toString();
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

function requirePermission(required: Permission) {
  return async (request: import("fastify").FastifyRequest, reply: import("fastify").FastifyReply) => {
    await authenticate(request, reply);
    if (reply.sent) return;

    const permissions = request.authz?.permissions ?? [];
    if (!permissions.includes(required)) {
      return reply.code(403).send({ ok: false, error: "Forbidden" });
    }
  };
}

function requireAnyPermission(required: readonly Permission[]) {
  return async (request: import("fastify").FastifyRequest, reply: import("fastify").FastifyReply) => {
    await authenticate(request, reply);
    if (reply.sent) return;

    const permissions = request.authz?.permissions ?? [];
    if (!required.some((p) => permissions.includes(p))) {
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

function getEffectiveVendorOwnerUserId(args: {
  request: import("fastify").FastifyRequest;
  vendorType: "HOTEL" | "ACTIVITY";
}): string | null {
  const roles = args.request.user.roles ?? [];
  const isOwner =
    args.vendorType === "HOTEL" ? roles.includes(Roles.HOTEL_OWNER) : roles.includes(Roles.ACTIVITY_OWNER);
  const isManager =
    args.vendorType === "HOTEL"
      ? roles.includes(Roles.HOTEL_MANAGER)
      : roles.includes(Roles.ACTIVITY_MANAGER);

  if (isOwner) return args.request.user.sub;
  if (!isManager) return null;

  const ownerUserId = args.request.authz?.vendorOwnerUserId;
  if (typeof ownerUserId !== "string" || !ownerUserId) return null;
  return ownerUserId;
}

// --- Hotel Listing Management Endpoints (scaffold, mock data) ---
// List hotels owned/managed by user
app.get("/hotels", { preHandler: authenticate }, async (_request) => {
  // TODO: filter by owner/manager
  return {
    ok: true,
    hotels: [
      {
        id: "hotel1",
        name: "Sunset Resort",
        status: "APPROVED",
        city: "Harare",
        approvalStatus: "APPROVED",
      },
      {
        id: "hotel2",
        name: "Victoria Falls Hotel",
        status: "PENDING",
        city: "Victoria Falls",
        approvalStatus: "PENDING",
      },
    ],
  };
});

// Create hotel draft
app.post("/hotels", { preHandler: authenticate }, async (_request) => {
  // TODO: save draft
  return { ok: true, hotelId: "draft1", status: "DRAFT" };
});

// Get hotel detail
app.get("/hotels/:id", { preHandler: authenticate }, async (request) => {
  const params = request.params as { id?: string };
  // TODO: fetch real hotel
  return {
    ok: true,
    hotel: {
      id: params?.id ?? "",
      name: "Sunset Resort",
      status: "DRAFT",
      city: "Harare",
      description: "A beautiful resort.",
      address: "123 Main St",
      location: { type: "Point", coordinates: [31.05, -17.82] },
      amenities: ["wifi", "pool", "breakfast"],
      gallery: [],
      rooms: [],
      policies: {},
      approvalStatus: "DRAFT",
    },
  };
});

// Update hotel draft
app.patch("/hotels/:id", { preHandler: authenticate }, async (_request) => {
  // TODO: update draft
  return { ok: true };
});

// Submit for approval
app.post("/hotels/:id/submit", { preHandler: authenticate }, async (_request) => {
  // TODO: submit for approval
  return { ok: true, status: "PENDING" };
});

// Preview hotel
app.get("/hotels/:id/preview", { preHandler: authenticate }, async (request) => {
  const params = request.params as { id?: string };
  // TODO: preview
  return {
    ok: true,
    hotel: {
      id: params?.id ?? "",
      name: "Sunset Resort (Preview)",
      city: "Harare",
      description: "A beautiful resort.",
      gallery: [],
      rooms: [],
    },
  };
});

// Rooms
app.get("/hotels/:id/rooms", { preHandler: authenticate }, async (_request) => {
  // TODO: fetch rooms
  return { ok: true, rooms: [] };
});
app.post("/hotels/:id/rooms", { preHandler: authenticate }, async (_request) => {
  // TODO: add room
  return { ok: true, roomId: "room1" };
});

// Gallery
app.get("/hotels/:id/gallery", { preHandler: authenticate }, async (_request) => {
  // TODO: fetch gallery
  return { ok: true, gallery: [] };
});
app.post("/hotels/:id/gallery", { preHandler: authenticate }, async (_request) => {
  // TODO: add photo/video
  return { ok: true, mediaId: "media1" };
});

// Managers
app.get("/hotels/:id/managers", { preHandler: authenticate }, async (_request) => {
  // TODO: fetch managers
  return { ok: true, managers: [] };
});
app.post("/hotels/:id/managers", { preHandler: authenticate }, async (_request) => {
  // TODO: assign manager
  return { ok: true };
});

// Pricing
app.get("/hotels/:id/pricing", { preHandler: authenticate }, async (_request) => {
  // TODO: fetch pricing
  return { ok: true, pricing: [] };
});
app.post("/hotels/:id/pricing", { preHandler: authenticate }, async (_request) => {
  // TODO: set pricing
  return { ok: true };
});

// Blackout dates
app.get("/hotels/:id/blackout", { preHandler: authenticate }, async (_request) => {
  // TODO: fetch blackout dates
  return { ok: true, blackout: [] };
});
app.post("/hotels/:id/blackout", { preHandler: authenticate }, async (_request) => {
  // TODO: set blackout dates
  return { ok: true };
});

// --- Geo / Nearby Experience Engine ---
app.get("/nearby", async (request) => {
  // Parse query params
  const q = request.query as any;
  const type = q.type ?? "hotel"; // hotel | activity | dining | event
  const lat = Number(q.lat);
  const lng = Number(q.lng);
  const radius = Number(q.radius ?? 5000); // meters
  const date = q.date ? new Date(q.date) : undefined;
  if (isNaN(lat) || isNaN(lng)) {
    return { ok: false, error: "lat/lng required" };
  }

  // TODO: implement real geo query with $geoNear
  // For now, return mock data with distance
  let results: any[] = [];
  if (type === "hotel") {
    results = [
      {
        id: "hotel1",
        name: "Sunset Resort",
        location: { type: "Point", coordinates: [31.05, -17.82] },
        distance: 1200,
        photoUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
      },
      {
        id: "hotel2",
        name: "Victoria Falls Hotel",
        location: { type: "Point", coordinates: [25.84, -17.93] },
        distance: 4200,
        photoUrl: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80",
      },
    ];
  } else if (type === "activity") {
    results = [
      {
        id: "activity1",
        name: "Zambezi River Rafting",
        location: { type: "Point", coordinates: [25.85, -17.93] },
        distance: 3800,
        photoUrl: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=600&q=80",
      },
    ];
  } else if (type === "dining") {
    results = [
      {
        id: "dining1",
        name: "Riverfront Grill",
        location: { type: "Point", coordinates: [25.86, -17.92] },
        distance: 2100,
        photoUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80",
      },
    ];
  } else if (type === "event") {
    results = [
      {
        id: "event1",
        name: "Sunset Jazz Night",
        location: { type: "Point", coordinates: [25.87, -17.91] },
        distance: 3200,
        date: new Date().toISOString(),
        photoUrl: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80",
      },
    ];
  }

  // Sort by distance
  results = results.sort((a, b) => a.distance - b.distance);

  return {
    ok: true,
    results,
    type,
    lat,
    lng,
    radius,
    date,
  };
});

// --- Customer Profile & Account Module ---
app.get("/profile", { preHandler: authenticate }, async (request) => {
  const userId = request.user.sub;
  // Personal info
  const user = await users.findOne(
    { _id: toObjectId(userId) },
    {
      projection: {
        email: 1,
        firstName: 1,
        lastName: 1,
        photoUrl: 1,
        phone: 1,
        preferences: 1,
        notificationSettings: 1,
        language: 1,
        currency: 1,
        loyaltyPoints: 1,
      },
    }
  );

  // Wishlist
  const wishlist = await wishlists.findOne({ userId });
  // Reviews
  const reviewsList = await reviews.find({ userId }).sort({ createdAt: -1 }).limit(20).toArray();
  // Loyalty
  const loyaltyInfo = await loyalty.findOne({ userId });
  // Coupons
  const couponsList = await coupons.find({ userId }).toArray();
  // Payment methods
  const paymentList = await paymentMethods.find({ userId }).toArray();
  // Notification settings
  const notif = await notificationSettings.findOne({ userId });
  // Trip drafts
  const drafts = await tripDrafts.find({ userId }).sort({ updatedAt: -1 }).limit(10).toArray();

  // Bookings (past + upcoming)
  const bookingList = await bookings.find({ userId }).sort({ createdAt: -1 }).limit(50).toArray();

  // Recently viewed (mock)
  const recentlyViewed: unknown[] = [];

  return {
    ok: true,
    profile: {
      user,
      wishlist: (wishlist as any)?.items ?? [],
      bookings: bookingList,
      reviews: reviewsList,
      loyalty: loyaltyInfo ?? { points: 0 },
      coupons: couponsList,
      paymentMethods: paymentList,
      notificationSettings: notif ?? {},
      tripDrafts: drafts,
      recentlyViewed,
    },
  };
});

// PATCH profile (update personal info, preferences, notification settings)
app.patch("/profile", { preHandler: authenticate }, async (request) => {
  const userId = request.user.sub;
  const body = request.body as any;
  const updates: any = {};
  if (typeof body.firstName === "string") updates.firstName = body.firstName;
  if (typeof body.lastName === "string") updates.lastName = body.lastName;
  if (typeof body.photoUrl === "string") updates.photoUrl = body.photoUrl;
  if (typeof body.phone === "string") updates.phone = body.phone;
  if (typeof body.preferences === "object") updates.preferences = body.preferences;
  if (typeof body.language === "string") updates.language = body.language;
  if (typeof body.currency === "string") updates.currency = body.currency;
  if (typeof body.loyaltyPoints === "number") updates.loyaltyPoints = body.loyaltyPoints;
  await users.updateOne({ _id: toObjectId(userId) }, { $set: updates });
  if (typeof body.notificationSettings === "object") {
    await notificationSettings.updateOne({ userId }, { $set: body.notificationSettings }, { upsert: true });
  }
  return { ok: true };
});

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
  { preHandler: requirePermission(Permissions.APPROVE_VENDOR) },
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
  { preHandler: requirePermission(Permissions.APPROVE_VENDOR) },
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
  { preHandler: requirePermission(Permissions.APPROVE_VENDOR) },
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
  const q = request.query as any;
  const type = q.type === "hotel" || q.type === "activity" || q.type === "combo" ? q.type : "hotel";

  const query = typeof q.query === "string" ? q.query.trim() : "";
  const city = typeof q.city === "string" ? q.city.trim() : "";
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
          { city: { $regex: query, $options: "i" } },
          { tags: { $elemMatch: { $regex: query, $options: "i" } } },
        ],
      }
    : {};

  const cityFilter = city
    ? {
        $or: [{ city: { $regex: city, $options: "i" } }, { locationName: { $regex: city, $options: "i" } }],
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

  if (type === "combo") {
    const results = [
      {
        id: "combo1",
        name: "Weekend Getaway: Falls + Safari",
        price: 350,
        premium: true,
        photoUrl: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80",
        verified: true,
      },
    ];
    return {
      ok: true,
      results,
      suggestions: ["Harare", "Victoria Falls", "Lake Kariba"],
    };
  }

  const collection = type === "hotel" ? hotels : activities;
  const list = await collection
    .find({ ...textFilter, ...cityFilter, ...geoFilter })
    .limit(50)
    .toArray();

  const results = list.map((doc: any) => {
    const amenities = Array.isArray(doc.amenities) ? doc.amenities : Array.isArray(doc.tags) ? doc.tags : undefined;
    const photoUrl =
      doc.photoUrl ??
      doc.coverUrl ??
      doc.thumbnailUrl ??
      (Array.isArray(doc.gallery) && doc.gallery.length ? doc.gallery[0]?.url : undefined) ??
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80";

    return {
      id: doc._id?.toString?.() ?? doc.id ?? "",
      name: doc.name ?? doc.title ?? "",
      city: doc.city ?? doc.locationName ?? "",
      price: doc.price ?? doc.startingPrice ?? doc.priceFrom ?? doc.amount ?? undefined,
      star: doc.star ?? doc.stars ?? undefined,
      amenities,
      verified: Boolean(doc.verified ?? doc.isVerified ?? doc.approved),
      photoUrl,
    };
  });

  return {
    ok: true,
    results,
    suggestions: ["Harare", "Victoria Falls", "Lake Kariba"],
  };
});

// Vendor team management: owners can assign sub-users as managers.
app.get(
  "/vendor/team",
  { preHandler: requirePermission(Permissions.TEAM_MANAGE) },
  async (request) => {
    const ownerUserId = request.user.sub;
    const list = await users
      .find({ vendorOwnerUserId: ownerUserId })
      .project({ email: 1, roles: 1, vendorOwnerUserId: 1, createdAt: 1, updatedAt: 1 })
      .sort({ createdAt: -1 })
      .limit(200)
      .toArray();

    return {
      ok: true,
      members: list.map((u) => ({
        id: u._id.toString(),
        email: u.email,
        roles: Array.isArray(u.roles) ? u.roles : [],
        vendorOwnerUserId: u.vendorOwnerUserId,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      })),
    };
  }
);

app.post(
  "/vendor/team/managers",
  { preHandler: requirePermission(Permissions.TEAM_MANAGE) },
  async (request, reply) => {
    const body = request.body as { email?: unknown; type?: unknown };
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const type = body.type === "HOTEL" || body.type === "ACTIVITY" ? body.type : null;
    if (!email || !type) return reply.code(400).send({ ok: false, error: "email and type are required" });

    const roleToAdd = type === "HOTEL" ? Roles.HOTEL_MANAGER : Roles.ACTIVITY_MANAGER;
    const now = new Date();

    const target = await users.findOne({ email });
    if (!target) return reply.code(404).send({ ok: false, error: "User not found" });

    const ownerUserId = request.user.sub;
    const before = {
      roles: Array.isArray((target as any).roles) ? (target as any).roles : [],
      vendorOwnerUserId: (target as any).vendorOwnerUserId ?? null,
    };

    await users.updateOne(
      { _id: target._id },
      {
        $addToSet: { roles: roleToAdd },
        $set: { vendorOwnerUserId: ownerUserId, updatedAt: now },
      }
    );

    await writeAuditLog({
      event: "VENDOR_MANAGER_ASSIGNED",
      actorUserId: request.user.sub,
      targetUserId: target._id.toString(),
      summary: `Assigned ${roleToAdd} to ${email}`,
      before,
      after: { roleAdded: roleToAdd, vendorOwnerUserId: ownerUserId },
      request,
    });

    return { ok: true };
  }
);

app.patch(
  "/vendor/team/managers/:id/remove",
  { preHandler: requirePermission(Permissions.TEAM_MANAGE) },
  async (request, reply) => {
    const params = request.params as { id?: string };
    const body = request.body as { type?: unknown };
    const type = body.type === "HOTEL" || body.type === "ACTIVITY" ? body.type : null;
    if (!params.id || !type) return reply.code(400).send({ ok: false, error: "id and type are required" });

    const roleToRemove = type === "HOTEL" ? Roles.HOTEL_MANAGER : Roles.ACTIVITY_MANAGER;
    const ownerUserId = request.user.sub;
    const target = await users.findOne({ _id: toObjectId(params.id) });
    if (!target) return reply.code(404).send({ ok: false, error: "User not found" });

    // Owners can only manage their own team.
    if ((target as any).vendorOwnerUserId !== ownerUserId) {
      return reply.code(403).send({ ok: false, error: "Forbidden" });
    }

    const before = {
      roles: Array.isArray((target as any).roles) ? (target as any).roles : [],
      vendorOwnerUserId: (target as any).vendorOwnerUserId ?? null,
    };

    const now = new Date();
    await users.updateOne(
      { _id: target._id },
      {
        $pull: { roles: roleToRemove as any },
        $set: { updatedAt: now },
      }
    );

    await writeAuditLog({
      event: "VENDOR_MANAGER_REMOVED",
      actorUserId: request.user.sub,
      targetUserId: target._id.toString(),
      summary: `Removed ${roleToRemove} from ${(target as any).email ?? params.id}`,
      before,
      after: { roleRemoved: roleToRemove },
      request,
    });

    return { ok: true };
  }
);

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

    const effectiveOwnerUserId = getEffectiveVendorOwnerUserId({ request, vendorType: "HOTEL" });
    if (!effectiveOwnerUserId) {
      return reply.code(403).send({ ok: false, error: "Forbidden" });
    }

    const now = new Date();
    const result = await hotels.insertOne({
      ownerUserId: effectiveOwnerUserId,
      createdByUserId: request.user.sub,
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
  async (request, reply) => {
    const effectiveOwnerUserId = getEffectiveVendorOwnerUserId({ request, vendorType: "HOTEL" });
    if (!effectiveOwnerUserId) {
      return reply.code(403).send({ ok: false, error: "Forbidden" });
    }

    const list = await hotels
      .find({ ownerUserId: effectiveOwnerUserId })
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

    const effectiveOwnerUserId = getEffectiveVendorOwnerUserId({ request, vendorType: "ACTIVITY" });
    if (!effectiveOwnerUserId) {
      return reply.code(403).send({ ok: false, error: "Forbidden" });
    }

    const now = new Date();
    const result = await activities.insertOne({
      ownerUserId: effectiveOwnerUserId,
      createdByUserId: request.user.sub,
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
  async (request, reply) => {
    const effectiveOwnerUserId = getEffectiveVendorOwnerUserId({ request, vendorType: "ACTIVITY" });
    if (!effectiveOwnerUserId) {
      return reply.code(403).send({ ok: false, error: "Forbidden" });
    }

    const list = await activities
      .find({ ownerUserId: effectiveOwnerUserId })
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
  { preHandler: requirePermission(Permissions.LISTING_VERIFY) },
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
  { preHandler: requirePermission(Permissions.LISTING_VERIFY) },
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
  { preHandler: requirePermission(Permissions.LISTING_VERIFY) },
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
  { preHandler: requirePermission(Permissions.LISTING_VERIFY) },
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
  const body = request.body as {
    email?: unknown;
    password?: unknown;
    affiliate?: unknown;
    phone?: unknown;
    accountType?: unknown;
  };
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const affiliate = body.affiliate === true;
  const phone = typeof body.phone === "string" ? body.phone.trim() : undefined;
  const accountType = typeof body.accountType === "string" ? body.accountType : "CUSTOMER";

  if (!email || !password) {
    return reply.code(400).send({ ok: false, error: "email and password are required" });
  }

  const roles: Role[] = [Roles.CUSTOMER];
  if (affiliate) roles.push(Roles.AFFILIATE_PARTNER);

  // Role-based registration flow (minimal): vendor accounts start as customers and apply for vendor onboarding separately.
  const wantsVendor = accountType === "VENDOR_HOTEL" || accountType === "VENDOR_ACTIVITY";
  const vendorType = accountType === "VENDOR_HOTEL" ? "HOTEL" : accountType === "VENDOR_ACTIVITY" ? "ACTIVITY" : null;

  const passwordHash = bcrypt.hashSync(password, 12);
  const now = new Date();

  try {
    const result = await users.insertOne({
      email,
      passwordHash,
      roles,
      emailVerified: false,
      phone,
      phoneVerified: false,
      twoFactorEnabled: false,
      twoFactorSecretBase32: null,
      vendorOnboarding: wantsVendor ? { status: "DRAFT", vendorType } : { status: "NONE" },
      createdAt: now,
      updatedAt: now,
    });

    const sessionId = randomBytes(16).toString("hex");
    await sessions.insertOne({
      sid: sessionId,
      sessionId,
      userId: result.insertedId.toString(),
      createdAt: now,
      lastSeenAt: now,
      revokedAt: null,
      ...getRequestMeta(request),
    });

    const token = app.jwt.sign({ sub: result.insertedId.toString(), roles, sid: sessionId });

    // Create email verification token (email sending comes later)
    const verifyToken = randomBytes(24).toString("hex");
    await emailVerifications.insertOne({
      userId: result.insertedId.toString(),
      tokenHash: sha256(verifyToken),
      createdAt: now,
      expiresAt: new Date(now.getTime() + 1000 * 60 * 60), // 60 minutes
      usedAt: null,
    });

    return {
      ok: true,
      token,
      user: { id: result.insertedId.toString(), email, roles },
      ...(env.isDevelopment ? { devEmailVerificationToken: verifyToken } : {}),
    };
  } catch (error) {
    request.log.error({ error, email }, "Registration failed");

    const err = error as any;
    const isDuplicateKey = err?.code === 11000 || (typeof err?.message === "string" && err.message.includes("E11000"));
    if (isDuplicateKey) {
      return reply.code(409).send({ ok: false, error: "User already exists" });
    }

    return reply
      .code(500)
      .send({ ok: false, error: "Registration failed", ...(env.isDevelopment ? { dev: String(err?.message ?? err) } : {}) });
  }
});

app.post("/auth/login", async (request, reply) => {
  const body = request.body as { email?: unknown; password?: unknown };
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return reply.code(400).send({ ok: false, error: "email and password are required" });
  }

  const attempts = await loginAttempts.findOne({ email });
  const lockUntil = attempts?.lockUntil instanceof Date ? attempts.lockUntil : null;
  if (lockUntil && lockUntil.getTime() > Date.now()) {
    await writeSecurityEvent({
      type: "LOGIN_LOCKED",
      email,
      userId: attempts?.userId,
      summary: `Login blocked (locked until ${lockUntil.toISOString()})`,
      request,
    });
    return reply.code(423).send({ ok: false, error: "Account temporarily locked. Try again later." });
  }

  const user = await users.findOne({ email });
  if (!user || typeof user.passwordHash !== "string") {
    const failed = (attempts?.failedCount ?? 0) + 1;
    const now = new Date();
    const shouldLock = failed >= 5;
    const nextLockUntil = shouldLock ? new Date(now.getTime() + 1000 * 60 * 15) : null;
    await loginAttempts.updateOne(
      { email },
      {
        $set: {
          email,
          userId: user?._id?.toString(),
          failedCount: failed,
          lastFailedAt: now,
          lockUntil: nextLockUntil,
          updatedAt: now,
        },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true }
    );
    if (shouldLock) {
      await writeSecurityEvent({
        type: "LOGIN_LOCKED",
        email,
        userId: user?._id?.toString(),
        summary: "Account locked due to repeated failed logins",
        request,
      });
    }
    return reply.code(401).send({ ok: false, error: "Invalid credentials" });
  }

  const ok = bcrypt.compareSync(password, user.passwordHash);
  if (!ok) {
    const failed = (attempts?.failedCount ?? 0) + 1;
    const now = new Date();
    const shouldLock = failed >= 5;
    const nextLockUntil = shouldLock ? new Date(now.getTime() + 1000 * 60 * 15) : null;
    await loginAttempts.updateOne(
      { email },
      {
        $set: {
          email,
          userId: user._id.toString(),
          failedCount: failed,
          lastFailedAt: now,
          lockUntil: nextLockUntil,
          updatedAt: now,
        },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true }
    );
    if (shouldLock) {
      await writeSecurityEvent({
        type: "LOGIN_LOCKED",
        email,
        userId: user._id.toString(),
        summary: "Account locked due to repeated failed logins",
        request,
      });
    }
    return reply.code(401).send({ ok: false, error: "Invalid credentials" });
  }

  await loginAttempts.deleteOne({ email });

  // If 2FA is enabled, require TOTP step.
  if ((user as any).twoFactorEnabled === true && typeof (user as any).twoFactorSecretBase32 === "string") {
    const challengeToken = randomBytes(24).toString("hex");
    const now = new Date();
    await twoFactorChallenges.insertOne({
      userId: user._id.toString(),
      tokenHash: sha256(challengeToken),
      expiresAt: new Date(now.getTime() + 1000 * 60 * 10), // 10 minutes
      createdAt: now,
      usedAt: null,
      ...getRequestMeta(request),
    });
    return { ok: true, twoFactorRequired: true, challengeToken };
  }

  const roles = (Array.isArray(user.roles) ? user.roles : []) as Role[];

  const now = new Date();
  const sessionId = randomBytes(16).toString("hex");
  await sessions.insertOne({
    sid: sessionId,
    sessionId,
    userId: user._id.toString(),
    createdAt: now,
    lastSeenAt: now,
    revokedAt: null,
    ...getRequestMeta(request),
  });

  const token = app.jwt.sign({ sub: user._id.toString(), roles, sid: sessionId });
  return { ok: true, token, user: { id: user._id.toString(), email: user.email, roles } };
});

app.post("/auth/login/2fa", async (request, reply) => {
  const body = request.body as { challengeToken?: unknown; code?: unknown };
  const challengeToken = typeof body.challengeToken === "string" ? body.challengeToken.trim() : "";
  const code = typeof body.code === "string" ? body.code.trim() : "";

  if (!challengeToken || !code) {
    return reply.code(400).send({ ok: false, error: "challengeToken and code are required" });
  }

  const tokenHash = sha256(challengeToken);
  const now = new Date();
  const challenge = await twoFactorChallenges.findOne({ tokenHash, usedAt: null, expiresAt: { $gt: now } });
  if (!challenge || typeof (challenge as any).userId !== "string") {
    return reply.code(400).send({ ok: false, error: "Invalid or expired challenge" });
  }

  const user = await users.findOne({ _id: toObjectId((challenge as any).userId) });
  if (!user || typeof (user as any).twoFactorSecretBase32 !== "string") {
    return reply.code(401).send({ ok: false, error: "Unauthorized" });
  }

  const ok = await verifyTotp({ secretBase32: (user as any).twoFactorSecretBase32, code });
  if (!ok) {
    return reply.code(401).send({ ok: false, error: "Invalid code" });
  }

  await twoFactorChallenges.updateOne({ _id: challenge._id }, { $set: { usedAt: now } });

  const roles = (Array.isArray((user as any).roles) ? (user as any).roles : []) as Role[];
  const sessionId = randomBytes(16).toString("hex");
  await sessions.insertOne({
    sid: sessionId,
    sessionId,
    userId: user._id.toString(),
    createdAt: now,
    lastSeenAt: now,
    revokedAt: null,
    ...getRequestMeta(request),
  });
  const token = app.jwt.sign({ sub: user._id.toString(), roles, sid: sessionId });

  return { ok: true, token, user: { id: user._id.toString(), email: (user as any).email, roles } };
});

app.post("/auth/send-email-verification", { preHandler: authenticate }, async (request) => {
  const userId = request.user.sub;
  const token = randomBytes(24).toString("hex");
  const now = new Date();
  await emailVerifications.insertOne({
    userId,
    tokenHash: sha256(token),
    createdAt: now,
    expiresAt: new Date(now.getTime() + 1000 * 60 * 60),
    usedAt: null,
  });
  return {
    ok: true,
    message: "Verification email will be sent.",
    ...(env.isDevelopment ? { devEmailVerificationToken: token } : {}),
  };
});

app.post("/auth/verify-email", async (request, reply) => {
  const body = request.body as { token?: unknown };
  const token = typeof body.token === "string" ? body.token.trim() : "";
  if (!token) return reply.code(400).send({ ok: false, error: "token is required" });

  const tokenHash = sha256(token);
  const now = new Date();
  const entry = await emailVerifications.findOne({ tokenHash, usedAt: null, expiresAt: { $gt: now } });
  if (!entry || typeof (entry as any).userId !== "string") {
    return reply.code(400).send({ ok: false, error: "Invalid or expired token" });
  }

  await users.updateOne(
    { _id: toObjectId((entry as any).userId) },
    { $set: { emailVerified: true, updatedAt: now } }
  );
  await emailVerifications.updateOne({ _id: entry._id }, { $set: { usedAt: now } });

  return { ok: true };
});

app.post("/auth/request-phone-otp", { preHandler: authenticate }, async (request, reply) => {
  const body = request.body as { phone?: unknown };
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  if (!phone) return reply.code(400).send({ ok: false, error: "phone is required" });

  const code = makeNumericCode();
  const now = new Date();
  await phoneOtps.insertOne({
    userId: request.user.sub,
    phone,
    codeHash: sha256(code),
    createdAt: now,
    expiresAt: new Date(now.getTime() + 1000 * 60 * 10),
    usedAt: null,
  });
  await users.updateOne(
    { _id: toObjectId(request.user.sub) },
    { $set: { phone, phoneVerified: false, updatedAt: now } }
  );

  return {
    ok: true,
    message: "OTP will be sent.",
    ...(env.isDevelopment ? { devOtp: code } : {}),
  };
});

app.post("/auth/verify-phone-otp", { preHandler: authenticate }, async (request, reply) => {
  const body = request.body as { phone?: unknown; code?: unknown };
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const code = typeof body.code === "string" ? body.code.trim() : "";
  if (!phone || !code) return reply.code(400).send({ ok: false, error: "phone and code are required" });

  const now = new Date();
  const entry = await phoneOtps.findOne({
    userId: request.user.sub,
    phone,
    codeHash: sha256(code),
    usedAt: null,
    expiresAt: { $gt: now },
  });
  if (!entry) return reply.code(400).send({ ok: false, error: "Invalid or expired code" });

  await phoneOtps.updateOne({ _id: entry._id }, { $set: { usedAt: now } });
  await users.updateOne(
    { _id: toObjectId(request.user.sub) },
    { $set: { phone, phoneVerified: true, updatedAt: now } }
  );

  return { ok: true };
});

app.post("/auth/2fa/setup", { preHandler: authenticate }, async (request) => {
  const secretBytes = randomBytes(20);
  const secretBase32 = base32Encode(secretBytes);
  const issuer = "BlessedToursZim";
  const label = `${issuer}:${request.user.sub}`;
  const otpauthUrl = `otpauth://totp/${encodeURIComponent(label)}?secret=${secretBase32}&issuer=${encodeURIComponent(issuer)}&digits=6&period=30`;

  const now = new Date();
  await users.updateOne(
    { _id: toObjectId(request.user.sub) },
    { $set: { twoFactorSetupSecretBase32: secretBase32, updatedAt: now } }
  );

  return { ok: true, secretBase32, otpauthUrl };
});

app.post("/auth/2fa/enable", { preHandler: authenticate }, async (request, reply) => {
  const body = request.body as { code?: unknown };
  const code = typeof body.code === "string" ? body.code.trim() : "";
  if (!code) return reply.code(400).send({ ok: false, error: "code is required" });

  const user = await users.findOne({ _id: toObjectId(request.user.sub) }, { projection: { twoFactorSetupSecretBase32: 1 } });
  const secret = typeof (user as any)?.twoFactorSetupSecretBase32 === "string" ? (user as any).twoFactorSetupSecretBase32 : "";
  if (!secret) return reply.code(400).send({ ok: false, error: "2FA setup not started" });

  const ok = await verifyTotp({ secretBase32: secret, code });
  if (!ok) return reply.code(401).send({ ok: false, error: "Invalid code" });

  const now = new Date();
  await users.updateOne(
    { _id: toObjectId(request.user.sub) },
    {
      $set: {
        twoFactorEnabled: true,
        twoFactorSecretBase32: secret,
        twoFactorSetupSecretBase32: null,
        updatedAt: now,
      },
    }
  );
  await writeSecurityEvent({ type: "TWO_FACTOR_ENABLED", userId: request.user.sub, summary: "2FA enabled", request });
  return { ok: true };
});

app.post("/auth/2fa/disable", { preHandler: authenticate }, async (request, reply) => {
  const body = request.body as { code?: unknown };
  const code = typeof body.code === "string" ? body.code.trim() : "";
  if (!code) return reply.code(400).send({ ok: false, error: "code is required" });

  const user = await users.findOne(
    { _id: toObjectId(request.user.sub) },
    { projection: { twoFactorSecretBase32: 1, twoFactorEnabled: 1 } }
  );
  const secret = typeof (user as any)?.twoFactorSecretBase32 === "string" ? (user as any).twoFactorSecretBase32 : "";
  if (!(user as any)?.twoFactorEnabled || !secret) return reply.code(400).send({ ok: false, error: "2FA not enabled" });

  const ok = await verifyTotp({ secretBase32: secret, code });
  if (!ok) return reply.code(401).send({ ok: false, error: "Invalid code" });

  const now = new Date();
  await users.updateOne(
    { _id: toObjectId(request.user.sub) },
    { $set: { twoFactorEnabled: false, twoFactorSecretBase32: null, updatedAt: now } }
  );
  await writeSecurityEvent({ type: "TWO_FACTOR_DISABLED", userId: request.user.sub, summary: "2FA disabled", request });
  return { ok: true };
});

app.get("/auth/sessions", { preHandler: authenticate }, async (request) => {
  const list = await sessions
    .find({ userId: request.user.sub })
    .project({ sessionId: 1, createdAt: 1, lastSeenAt: 1, revokedAt: 1, ip: 1, userAgent: 1 })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();
  return {
    ok: true,
    sessions: list.map((s) => ({
      id: s._id.toString(),
      sessionId: s.sessionId,
      createdAt: s.createdAt,
      lastSeenAt: s.lastSeenAt,
      revokedAt: s.revokedAt,
      ip: s.ip,
      userAgent: s.userAgent,
    })),
  };
});

app.post("/auth/sessions/revoke", { preHandler: authenticate }, async (request, reply) => {
  const body = request.body as { sessionId?: unknown };
  const sessionId = typeof body.sessionId === "string" ? body.sessionId.trim() : "";
  if (!sessionId) return reply.code(400).send({ ok: false, error: "sessionId is required" });

  const now = new Date();
  const result = await sessions.updateOne(
    { sessionId, userId: request.user.sub },
    { $set: { revokedAt: now, updatedAt: now } }
  );
  if (result.matchedCount === 0) return reply.code(404).send({ ok: false, error: "Session not found" });

  await writeSecurityEvent({
    type: "SESSION_REVOKED",
    userId: request.user.sub,
    summary: `Revoked session ${sessionId}`,
    request,
  });

  return { ok: true };
});

app.post("/auth/logout", { preHandler: authenticate }, async (request) => {
  if (request.user.sid) {
    await sessions.updateOne(
      { sessionId: request.user.sid, userId: request.user.sub },
      { $set: { revokedAt: new Date(), updatedAt: new Date() } }
    );
    await writeSecurityEvent({
      type: "LOGOUT",
      userId: request.user.sub,
      summary: "Logged out",
      request,
    });
  }
  return { ok: true };
});

app.get("/auth/account", { preHandler: authenticate }, async (request) => {
  const user = await users.findOne(
    { _id: toObjectId(request.user.sub) },
    { projection: { email: 1, emailVerified: 1, phone: 1, phoneVerified: 1, twoFactorEnabled: 1 } }
  );

  return {
    ok: true,
    account: {
      email: (user as any)?.email,
      emailVerified: Boolean((user as any)?.emailVerified),
      phone: typeof (user as any)?.phone === "string" ? (user as any).phone : null,
      phoneVerified: Boolean((user as any)?.phoneVerified),
      twoFactorEnabled: Boolean((user as any)?.twoFactorEnabled),
    },
  };
});

app.get("/auth/security-events", { preHandler: authenticate }, async (request) => {
  const list = await securityEvents
    .find({ userId: request.user.sub })
    .project({ type: 1, summary: 1, createdAt: 1, ip: 1 })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();
  return {
    ok: true,
    events: list.map((e) => ({
      id: e._id.toString(),
      type: e.type,
      summary: e.summary,
      createdAt: e.createdAt,
      ip: e.ip,
    })),
  };
});

app.post("/auth/forgot-password", async (request, reply) => {
  const body = request.body as { email?: unknown };
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!email) {
    return reply.code(400).send({ ok: false, error: "email is required" });
  }

  const user = await users.findOne({ email });
  if (user?._id) {
    const token = randomBytes(24).toString("hex");
    const tokenHash = sha256(token);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 1000 * 60 * 30); // 30 minutes

    await passwordResets.insertOne({
      userId: user._id.toString(),
      tokenHash,
      createdAt: now,
      expiresAt,
      usedAt: null,
    });

    // Email sending comes later. In development, return the token to make local testing possible.
    if (env.isDevelopment) {
      return {
        ok: true,
        devToken: token,
        message: "If that email exists, a reset link will be sent.",
      };
    }
  }

  // Always respond with ok to avoid account enumeration.
  return { ok: true, message: "If that email exists, a reset link will be sent." };
});

app.post("/auth/reset-password", async (request, reply) => {
  const body = request.body as { token?: unknown; newPassword?: unknown };
  const token = typeof body.token === "string" ? body.token.trim() : "";
  const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";

  if (!token || !newPassword) {
    return reply.code(400).send({ ok: false, error: "token and newPassword are required" });
  }
  if (newPassword.length < 6) {
    return reply.code(400).send({ ok: false, error: "Password must be at least 6 characters" });
  }

  const tokenHash = sha256(token);
  const now = new Date();
  const reset = await passwordResets.findOne({ tokenHash, usedAt: null, expiresAt: { $gt: now } });
  if (!reset || typeof reset.userId !== "string") {
    return reply.code(400).send({ ok: false, error: "Invalid or expired token" });
  }

  const passwordHash = bcrypt.hashSync(newPassword, 12);

  await users.updateOne(
    { _id: toObjectId(reset.userId) },
    { $set: { passwordHash, updatedAt: now } }
  );

  // Revoke existing sessions
  await sessions.updateMany(
    { userId: reset.userId, revokedAt: null },
    { $set: { revokedAt: now, updatedAt: now } }
  );

  await passwordResets.updateOne(
    { _id: reset._id },
    { $set: { usedAt: now } }
  );

  // Invalidate other outstanding reset tokens for this user.
  await passwordResets.updateMany(
    { userId: reset.userId, usedAt: null },
    { $set: { usedAt: now } }
  );

  return { ok: true };
});

app.post("/auth/change-password", { preHandler: authenticate }, async (request, reply) => {
  const body = request.body as { currentPassword?: unknown; newPassword?: unknown };
  const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword : "";
  const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";

  if (!currentPassword || !newPassword) {
    return reply.code(400).send({ ok: false, error: "currentPassword and newPassword are required" });
  }
  if (newPassword.length < 6) {
    return reply.code(400).send({ ok: false, error: "Password must be at least 6 characters" });
  }

  const userId = request.user.sub;
  const user = await users.findOne({ _id: toObjectId(userId) });
  if (!user || typeof user.passwordHash !== "string") {
    return reply.code(401).send({ ok: false, error: "Unauthorized" });
  }

  const ok = bcrypt.compareSync(currentPassword, user.passwordHash);
  if (!ok) {
    return reply.code(401).send({ ok: false, error: "Invalid credentials" });
  }

  const passwordHash = bcrypt.hashSync(newPassword, 12);
  await users.updateOne(
    { _id: toObjectId(userId) },
    { $set: { passwordHash, updatedAt: new Date() } }
  );

  // Revoke other sessions
  const now = new Date();
  await sessions.updateMany(
    { userId, sessionId: { $ne: request.user.sid }, revokedAt: null },
    { $set: { revokedAt: now, updatedAt: now } }
  );

  return { ok: true };
});

app.get("/me", { preHandler: authenticate }, async (request) => {
  return {
    ok: true,
    user: request.user,
    authz: request.authz ?? { userId: request.user.sub, roles: request.user.roles ?? [], permissions: [] },
  };
});

app.get(
  "/admin/rbac",
  { preHandler: requirePermission(Permissions.USER_VIEW_ALL) },
  async () => {
    return {
      ok: true,
      roles: Object.values(Roles),
      permissions: Object.values(Permissions),
    };
  }
);

app.get(
  "/admin/audit-logs",
  { preHandler: requirePermission(Permissions.AUDIT_VIEW) },
  async (request) => {
    const q = request.query as { targetUserId?: string; limit?: string };
    const limit = Math.min(200, Math.max(1, Number.parseInt(q.limit ?? "50", 10) || 50));
    const filter = typeof q.targetUserId === "string" && q.targetUserId.trim() ? { targetUserId: q.targetUserId.trim() } : {};

    const list = await auditLogs.find(filter).sort({ createdAt: -1 }).limit(limit).toArray();
    return {
      ok: true,
      logs: list.map((l) => ({
        id: l._id.toString(),
        event: l.event,
        actorUserId: l.actorUserId,
        targetUserId: l.targetUserId,
        summary: l.summary,
        before: l.before,
        after: l.after,
        ip: l.ip,
        userAgent: l.userAgent,
        createdAt: l.createdAt,
      })),
    };
  }
);

app.get(
  "/admin/approvals",
  { preHandler: requirePermission(Permissions.APPROVALS_VIEW) },
  async (request) => {
    const q = request.query as { status?: string; limit?: string };
    const status = q.status === "PENDING" || q.status === "APPROVED" || q.status === "REJECTED" ? q.status : "PENDING";
    const limit = Math.min(200, Math.max(1, Number.parseInt(q.limit ?? "50", 10) || 50));
    const list = await approvals.find({ status }).sort({ createdAt: -1 }).limit(limit).toArray();
    return {
      ok: true,
      approvals: list.map((a) => ({
        id: a._id.toString(),
        type: a.type,
        status: a.status,
        requestedByUserId: a.requestedByUserId,
        targetUserId: a.targetUserId,
        summary: a.summary,
        createdAt: a.createdAt,
        decidedByUserId: a.decidedByUserId,
        decidedAt: a.decidedAt,
        decisionReason: a.decisionReason,
      })),
    };
  }
);

app.post(
  "/admin/approvals/:id/approve",
  { preHandler: requireAnyPermission([Permissions.APPROVALS_DECIDE, Permissions.USER_MANAGE]) },
  async (request, reply) => {
    const params = request.params as { id?: string };
    if (!params.id) return reply.code(400).send({ ok: false, error: "id is required" });

    const approval = await approvals.findOne({ _id: toObjectId(params.id) });
    if (!approval) return reply.code(404).send({ ok: false, error: "Approval not found" });
    if (approval.status !== "PENDING") return reply.code(409).send({ ok: false, error: "Already decided" });

    // For now, only Super Admin can execute RBAC approvals.
    const roles = request.user.roles ?? [];
    if (
      ["RBAC_USER_ROLES", "RBAC_USER_PERMISSIONS", "RBAC_ROLE_OVERRIDE", "RBAC_ROLE_OVERRIDE_CLEAR"].includes(
        String(approval.type)
      )
    ) {
      if (!roles.includes(Roles.SUPER_ADMIN)) {
        return reply.code(403).send({ ok: false, error: "Forbidden" });
      }
    }

    const now = new Date();
    const payload = (approval as { payload?: unknown }).payload as any;

    if (approval.type === "RBAC_USER_ROLES") {
      const { targetUserId, roles: nextRoles } = payload ?? {};
      if (typeof targetUserId !== "string" || !Array.isArray(nextRoles)) {
        return reply.code(400).send({ ok: false, error: "Invalid approval payload" });
      }

      const user = await users.findOne({ _id: toObjectId(targetUserId) }, { projection: { roles: 1 } });
      const before = { roles: Array.isArray(user?.roles) ? user?.roles : [] };
      await users.updateOne(
        { _id: toObjectId(targetUserId) },
        { $set: { roles: nextRoles, updatedAt: now } }
      );
      await writeAuditLog({
        event: "USER_ROLES_UPDATED",
        actorUserId: request.user.sub,
        targetUserId,
        summary: `Approved roles update`,
        before,
        after: { roles: nextRoles },
        request,
      });
    } else if (approval.type === "RBAC_USER_PERMISSIONS") {
      const { targetUserId, grant, deny } = payload ?? {};
      if (typeof targetUserId !== "string" || !Array.isArray(grant) || !Array.isArray(deny)) {
        return reply.code(400).send({ ok: false, error: "Invalid approval payload" });
      }

      const user = await users.findOne(
        { _id: toObjectId(targetUserId) },
        { projection: { permissionsGrant: 1, permissionsDeny: 1 } }
      );
      const before = {
        grant: Array.isArray((user as any)?.permissionsGrant) ? (user as any).permissionsGrant : [],
        deny: Array.isArray((user as any)?.permissionsDeny) ? (user as any).permissionsDeny : [],
      };
      await users.updateOne(
        { _id: toObjectId(targetUserId) },
        { $set: { permissionsGrant: grant, permissionsDeny: deny, updatedAt: now } }
      );
      await writeAuditLog({
        event: "USER_PERMISSIONS_UPDATED",
        actorUserId: request.user.sub,
        targetUserId,
        summary: `Approved user permission overrides`,
        before,
        after: { grant, deny },
        request,
      });
    } else if (approval.type === "RBAC_ROLE_OVERRIDE") {
      const { role, permissions } = payload ?? {};
      if (typeof role !== "string" || !isRole(role) || !Array.isArray(permissions)) {
        return reply.code(400).send({ ok: false, error: "Invalid approval payload" });
      }

      const beforeDoc = await rolePermissionOverrides.findOne({ role });
      const before = {
        permissions: Array.isArray((beforeDoc as any)?.permissions) ? (beforeDoc as any).permissions : null,
      };

      await rolePermissionOverrides.updateOne(
        { role },
        { $set: { role, permissions, updatedAt: now }, $setOnInsert: { createdAt: now } },
        { upsert: true }
      );

      await writeAuditLog({
        event: "ROLE_PERMISSIONS_OVERRIDDEN",
        actorUserId: request.user.sub,
        summary: `Approved role permissions override`,
        before,
        after: { role, permissions },
        request,
      });
    } else if (approval.type === "RBAC_ROLE_OVERRIDE_CLEAR") {
      const { role } = payload ?? {};
      if (typeof role !== "string" || !isRole(role)) {
        return reply.code(400).send({ ok: false, error: "Invalid approval payload" });
      }

      const beforeDoc = await rolePermissionOverrides.findOne({ role });
      await rolePermissionOverrides.deleteOne({ role });

      await writeAuditLog({
        event: "ROLE_PERMISSIONS_OVERRIDE_CLEARED",
        actorUserId: request.user.sub,
        summary: `Approved clear role permissions override`,
        before: {
          permissions: Array.isArray((beforeDoc as any)?.permissions) ? (beforeDoc as any).permissions : null,
        },
        after: { role },
        request,
      });
    }

    await approvals.updateOne(
      { _id: approval._id },
      {
        $set: {
          status: "APPROVED",
          decidedByUserId: request.user.sub,
          decidedAt: now,
          updatedAt: now,
        },
      }
    );

    return { ok: true };
  }
);

app.post(
  "/admin/approvals/:id/reject",
  { preHandler: requirePermission(Permissions.APPROVALS_DECIDE) },
  async (request, reply) => {
    const params = request.params as { id?: string };
    const body = request.body as { reason?: unknown };
    if (!params.id) return reply.code(400).send({ ok: false, error: "id is required" });
    const reason = typeof body.reason === "string" ? body.reason : undefined;

    const approval = await approvals.findOne({ _id: toObjectId(params.id) });
    if (!approval) return reply.code(404).send({ ok: false, error: "Approval not found" });
    if (approval.status !== "PENDING") return reply.code(409).send({ ok: false, error: "Already decided" });

    const now = new Date();
    await approvals.updateOne(
      { _id: approval._id },
      {
        $set: {
          status: "REJECTED",
          decidedByUserId: request.user.sub,
          decidedAt: now,
          decisionReason: reason,
          updatedAt: now,
        },
      }
    );

    await writeAuditLog({
      event: "APPROVAL_REJECTED",
      actorUserId: request.user.sub,
      targetUserId: approval.targetUserId,
      summary: `Rejected approval: ${approval.summary}`,
      request,
    });

    return { ok: true };
  }
);

app.patch(
  "/admin/users/:id/roles",
  { preHandler: requirePermission(Permissions.USER_MANAGE) },
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

    const actorRoles = request.user.roles ?? [];
    const isSuperAdmin = actorRoles.includes(Roles.SUPER_ADMIN);

    if (!isSuperAdmin) {
      const approvalId = await createApproval({
        type: "RBAC_USER_ROLES",
        requestedByUserId: request.user.sub,
        targetUserId: params.id,
        summary: `Update user roles`,
        payload: { targetUserId: params.id, roles: validated },
        request,
      });
      return { ok: true, status: "PENDING_APPROVAL", approvalId };
    }

    const beforeUser = await users.findOne({ _id: toObjectId(params.id) }, { projection: { roles: 1, email: 1 } });
    const before = { roles: Array.isArray(beforeUser?.roles) ? beforeUser?.roles : [] };

    const result = await users.updateOne(
      { _id: toObjectId(params.id) },
      { $set: { roles: validated, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return reply.code(404).send({ ok: false, error: "User not found" });
    }

    await writeAuditLog({
      event: "USER_ROLES_UPDATED",
      actorUserId: request.user.sub,
      targetUserId: params.id,
      summary: `Updated roles for ${beforeUser?.email ?? params.id}`,
      before,
      after: { roles: validated },
      request,
    });

    return { ok: true, roles: validated };
  }
);

app.patch(
  "/admin/users/:id/permissions",
  { preHandler: requirePermission(Permissions.USER_MANAGE) },
  async (request, reply) => {
    const params = request.params as { id?: string };
    const body = request.body as { grant?: unknown; deny?: unknown };

    if (!params.id) {
      return reply.code(400).send({ ok: false, error: "id is required" });
    }

    const grantRaw = Array.isArray(body.grant) ? body.grant : [];
    const denyRaw = Array.isArray(body.deny) ? body.deny : [];

    const grant: Permission[] = [];
    for (const p of grantRaw) {
      if (typeof p !== "string" || !isPermission(p)) {
        return reply.code(400).send({ ok: false, error: `Invalid permission in grant: ${String(p)}` });
      }
      grant.push(p);
    }

    const deny: Permission[] = [];
    for (const p of denyRaw) {
      if (typeof p !== "string" || !isPermission(p)) {
        return reply.code(400).send({ ok: false, error: `Invalid permission in deny: ${String(p)}` });
      }
      deny.push(p);
    }

    const actorRoles = request.user.roles ?? [];
    const isSuperAdmin = actorRoles.includes(Roles.SUPER_ADMIN);

    if (!isSuperAdmin) {
      const approvalId = await createApproval({
        type: "RBAC_USER_PERMISSIONS",
        requestedByUserId: request.user.sub,
        targetUserId: params.id,
        summary: `Update user permission overrides`,
        payload: { targetUserId: params.id, grant, deny },
        request,
      });
      return { ok: true, status: "PENDING_APPROVAL", approvalId };
    }

    const beforeUser = await users.findOne(
      { _id: toObjectId(params.id) },
      { projection: { permissionsGrant: 1, permissionsDeny: 1, email: 1 } }
    );
    const before = {
      grant: Array.isArray((beforeUser as any)?.permissionsGrant) ? (beforeUser as any).permissionsGrant : [],
      deny: Array.isArray((beforeUser as any)?.permissionsDeny) ? (beforeUser as any).permissionsDeny : [],
    };

    const result = await users.updateOne(
      { _id: toObjectId(params.id) },
      {
        $set: {
          permissionsGrant: grant,
          permissionsDeny: deny,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return reply.code(404).send({ ok: false, error: "User not found" });
    }

    await writeAuditLog({
      event: "USER_PERMISSIONS_UPDATED",
      actorUserId: request.user.sub,
      targetUserId: params.id,
      summary: `Updated user permission overrides for ${beforeUser?.email ?? params.id}`,
      before,
      after: { grant, deny },
      request,
    });

    return { ok: true, grant, deny };
  }
);

app.get(
  "/admin/roles",
  { preHandler: requirePermission(Permissions.USER_VIEW_ALL) },
  async () => {
    const overrides = await rolePermissionOverrides.find({}).toArray();
    const overrideByRole = new Map<string, Permission[]>();
    for (const o of overrides) {
      const role = (o as { role?: unknown }).role;
      const permissionsRaw = (o as { permissions?: unknown }).permissions;
      if (typeof role !== "string" || !isRole(role)) continue;
      if (!Array.isArray(permissionsRaw)) continue;
      const list: Permission[] = [];
      for (const p of permissionsRaw) {
        if (typeof p === "string" && isPermission(p)) list.push(p);
      }
      overrideByRole.set(role, list);
    }

    const roles = Object.values(Roles);
    return {
      ok: true,
      roles: roles.map((r) => ({
        role: r,
        permissions: overrideByRole.get(r) ?? [...getPermissionsForRole(r)],
        source: overrideByRole.has(r) ? "override" : "default",
      })),
    };
  }
);

app.patch(
  "/admin/roles/:role/permissions",
  { preHandler: requirePermission(Permissions.USER_MANAGE) },
  async (request, reply) => {
    const params = request.params as { role?: string };
    const body = request.body as { permissions?: unknown };

    const role = typeof params.role === "string" ? params.role : "";
    if (!role || !isRole(role)) return reply.code(400).send({ ok: false, error: "Invalid role" });

    const permsRaw = Array.isArray(body.permissions) ? body.permissions : null;
    if (!permsRaw) return reply.code(400).send({ ok: false, error: "permissions is required" });

    const permissions: Permission[] = [];
    for (const p of permsRaw) {
      if (typeof p !== "string" || !isPermission(p)) {
        return reply.code(400).send({ ok: false, error: `Invalid permission: ${String(p)}` });
      }
      permissions.push(p);
    }

    const actorRoles = request.user.roles ?? [];
    const isSuperAdmin = actorRoles.includes(Roles.SUPER_ADMIN);
    if (!isSuperAdmin) {
      const approvalId = await createApproval({
        type: "RBAC_ROLE_OVERRIDE",
        requestedByUserId: request.user.sub,
        summary: `Override permissions for role ${role}`,
        payload: { role, permissions },
        request,
      });
      return { ok: true, status: "PENDING_APPROVAL", approvalId };
    }

    const beforeDoc = await rolePermissionOverrides.findOne({ role });
    const before = {
      permissions: Array.isArray((beforeDoc as any)?.permissions) ? (beforeDoc as any).permissions : null,
    };

    const now = new Date();
    await rolePermissionOverrides.updateOne(
      { role },
      { $set: { role, permissions, updatedAt: now }, $setOnInsert: { createdAt: now } },
      { upsert: true }
    );

    await writeAuditLog({
      event: "ROLE_PERMISSIONS_OVERRIDDEN",
      actorUserId: request.user.sub,
      summary: `Overrode permissions for role ${role}`,
      before,
      after: { role, permissions },
      request,
    });

    return { ok: true, role, permissions };
  }
);

app.delete(
  "/admin/roles/:role/permissions",
  { preHandler: requirePermission(Permissions.USER_MANAGE) },
  async (request, reply) => {
    const params = request.params as { role?: string };
    const role = typeof params.role === "string" ? params.role : "";
    if (!role || !isRole(role)) return reply.code(400).send({ ok: false, error: "Invalid role" });

    const actorRoles = request.user.roles ?? [];
    const isSuperAdmin = actorRoles.includes(Roles.SUPER_ADMIN);
    if (!isSuperAdmin) {
      const approvalId = await createApproval({
        type: "RBAC_ROLE_OVERRIDE_CLEAR",
        requestedByUserId: request.user.sub,
        summary: `Clear permissions override for role ${role}`,
        payload: { role },
        request,
      });
      return { ok: true, status: "PENDING_APPROVAL", approvalId };
    }

    const beforeDoc = await rolePermissionOverrides.findOne({ role });
    await rolePermissionOverrides.deleteOne({ role });

    await writeAuditLog({
      event: "ROLE_PERMISSIONS_OVERRIDE_CLEARED",
      actorUserId: request.user.sub,
      summary: `Cleared permissions override for role ${role}`,
      before: { permissions: Array.isArray((beforeDoc as any)?.permissions) ? (beforeDoc as any).permissions : null },
      after: { role },
      request,
    });

    return { ok: true };
  }
);

async function shutdown(signal: string) {
  try {
    app.log.info({ signal }, "Shutting down...");
    await app.close();
  } catch (error) {
    app.log.error({ error, signal }, "Shutdown error");
  } finally {
    process.exit(0);
  }
}

process.once("SIGINT", () => {
  void shutdown("SIGINT");
});

process.once("SIGTERM", () => {
  void shutdown("SIGTERM");
});

await app.listen({ port, host });
