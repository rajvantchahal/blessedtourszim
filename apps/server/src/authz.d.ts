import type { Permission, Role } from "@repo/shared";

declare module "fastify" {
  interface FastifyRequest {
    authz?: {
      userId: string;
      roles: Role[];
      permissions: Permission[];
      vendorOwnerUserId?: string;
    };
  }
}
