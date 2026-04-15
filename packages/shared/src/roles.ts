export const Roles = {
  SUPER_ADMIN: "SUPER_ADMIN",
  OPERATIONS_ADMIN: "OPERATIONS_ADMIN",
  FINANCE_ADMIN: "FINANCE_ADMIN",
  SUPPORT_AGENT: "SUPPORT_AGENT",
  AI_SYSTEM: "AI_SYSTEM",

  HOTEL_OWNER: "HOTEL_OWNER",
  HOTEL_MANAGER: "HOTEL_MANAGER",
  ACTIVITY_OWNER: "ACTIVITY_OWNER",
  ACTIVITY_MANAGER: "ACTIVITY_MANAGER",

  CUSTOMER: "CUSTOMER",
  PREMIUM_CUSTOMER: "PREMIUM_CUSTOMER",

  AFFILIATE_PARTNER: "AFFILIATE_PARTNER",
  INFLUENCER_LOCAL_AGENT: "INFLUENCER_LOCAL_AGENT",
} as const;

export type Role = (typeof Roles)[keyof typeof Roles];

export function isRole(value: string): value is Role {
  return Object.values(Roles).includes(value as Role);
}

export const PlatformRoles = [
  Roles.SUPER_ADMIN,
  Roles.OPERATIONS_ADMIN,
  Roles.FINANCE_ADMIN,
  Roles.SUPPORT_AGENT,
  Roles.AI_SYSTEM,
] as const satisfies readonly Role[];

export const VendorRoles = [
  Roles.HOTEL_OWNER,
  Roles.HOTEL_MANAGER,
  Roles.ACTIVITY_OWNER,
  Roles.ACTIVITY_MANAGER,
] as const satisfies readonly Role[];

export const CustomerRoles = [Roles.CUSTOMER, Roles.PREMIUM_CUSTOMER] as const satisfies readonly Role[];

export const GrowthRoles = [
  Roles.AFFILIATE_PARTNER,
  Roles.INFLUENCER_LOCAL_AGENT,
] as const satisfies readonly Role[];
