import type { Role } from "@repo/shared";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: {
      sub: string;
      roles: Role[];
    };
    user: {
      sub: string;
      roles: Role[];
    };
  }
}
