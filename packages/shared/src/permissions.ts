import { type Role, Roles } from "./roles.js";

export const Permissions = {
  // Account
  READ_SELF: "READ_SELF",

  // Vendor onboarding
  APPLY_VENDOR: "APPLY_VENDOR",
  APPROVE_VENDOR: "APPROVE_VENDOR",

  // Listings
  HOTEL_CREATE: "HOTEL_CREATE",
  HOTEL_UPDATE_OWN: "HOTEL_UPDATE_OWN",
  ACTIVITY_CREATE: "ACTIVITY_CREATE",
  ACTIVITY_UPDATE_OWN: "ACTIVITY_UPDATE_OWN",
  LISTING_VERIFY: "LISTING_VERIFY",

  // Teams
  TEAM_MANAGE: "TEAM_MANAGE",

  // Bookings
  BOOKING_CREATE: "BOOKING_CREATE",
  BOOKING_VIEW_OWN: "BOOKING_VIEW_OWN",
  BOOKING_VIEW_ALL: "BOOKING_VIEW_ALL",

  // Admin
  USER_VIEW_ALL: "USER_VIEW_ALL",
  USER_MANAGE: "USER_MANAGE",

  // Governance
  AUDIT_VIEW: "AUDIT_VIEW",
  APPROVALS_VIEW: "APPROVALS_VIEW",
  APPROVALS_DECIDE: "APPROVALS_DECIDE",
} as const;

export type Permission = (typeof Permissions)[keyof typeof Permissions];

export function isPermission(value: string): value is Permission {
  return Object.values(Permissions).includes(value as Permission);
}

const allPermissions = Object.values(Permissions) as Permission[];

export const RolePermissions: Record<Role, readonly Permission[]> = {
  [Roles.SUPER_ADMIN]: allPermissions,

  [Roles.OPERATIONS_ADMIN]: [
    Permissions.READ_SELF,
    Permissions.USER_VIEW_ALL,
    Permissions.APPROVE_VENDOR,
    Permissions.LISTING_VERIFY,
    Permissions.BOOKING_VIEW_ALL,
    Permissions.AUDIT_VIEW,
    Permissions.APPROVALS_VIEW,
  ],

  [Roles.FINANCE_ADMIN]: [
    Permissions.READ_SELF,
    Permissions.BOOKING_VIEW_ALL,
    Permissions.AUDIT_VIEW,
    Permissions.APPROVALS_VIEW,
  ],

  [Roles.SUPPORT_AGENT]: [
    Permissions.READ_SELF,
    Permissions.USER_VIEW_ALL,
    Permissions.BOOKING_VIEW_ALL,
    Permissions.AUDIT_VIEW,
    Permissions.APPROVALS_VIEW,
  ],

  [Roles.AI_SYSTEM]: [Permissions.READ_SELF],

  [Roles.HOTEL_OWNER]: [
    Permissions.READ_SELF,
    Permissions.APPLY_VENDOR,
    Permissions.TEAM_MANAGE,
    Permissions.HOTEL_CREATE,
    Permissions.HOTEL_UPDATE_OWN,
    Permissions.BOOKING_VIEW_OWN,
  ],

  [Roles.HOTEL_MANAGER]: [
    Permissions.READ_SELF,
    Permissions.HOTEL_CREATE,
    Permissions.HOTEL_UPDATE_OWN,
    Permissions.BOOKING_VIEW_OWN,
  ],

  [Roles.ACTIVITY_OWNER]: [
    Permissions.READ_SELF,
    Permissions.APPLY_VENDOR,
    Permissions.TEAM_MANAGE,
    Permissions.ACTIVITY_CREATE,
    Permissions.ACTIVITY_UPDATE_OWN,
    Permissions.BOOKING_VIEW_OWN,
  ],

  [Roles.ACTIVITY_MANAGER]: [
    Permissions.READ_SELF,
    Permissions.ACTIVITY_CREATE,
    Permissions.ACTIVITY_UPDATE_OWN,
    Permissions.BOOKING_VIEW_OWN,
  ],

  [Roles.CUSTOMER]: [
    Permissions.READ_SELF,
    Permissions.APPLY_VENDOR,
    Permissions.BOOKING_CREATE,
    Permissions.BOOKING_VIEW_OWN,
  ],

  [Roles.PREMIUM_CUSTOMER]: [
    Permissions.READ_SELF,
    Permissions.APPLY_VENDOR,
    Permissions.BOOKING_CREATE,
    Permissions.BOOKING_VIEW_OWN,
  ],

  [Roles.AFFILIATE_PARTNER]: [Permissions.READ_SELF],

  [Roles.INFLUENCER_LOCAL_AGENT]: [Permissions.READ_SELF],
} as const;

export function getPermissionsForRole(role: Role): readonly Permission[] {
  return RolePermissions[role] ?? [];
}

export function getPermissionsForRoles(roles: readonly Role[]): Permission[] {
  const out = new Set<Permission>();
  for (const role of roles) {
    for (const permission of getPermissionsForRole(role)) out.add(permission);
  }
  return [...out];
}

export function hasPermission(roles: readonly Role[], permission: Permission): boolean {
  return getPermissionsForRoles(roles).includes(permission);
}

export function getEffectivePermissions(args: {
  roles: readonly Role[];
  grant?: readonly Permission[];
  deny?: readonly Permission[];
}): Permission[] {
  const base = new Set<Permission>(getPermissionsForRoles(args.roles));
  for (const p of args.grant ?? []) base.add(p);
  for (const p of args.deny ?? []) base.delete(p);
  return [...base];
}
