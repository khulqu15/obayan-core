import { middleware, APIError } from "encore.dev/api";
import { loadActorAccess, assertSubscriptionActive } from "../auth/access";
import type { ActorAccess } from "../auth/types";
import { APICallMeta, currentRequest } from "encore.dev";

export const accessMiddleware = middleware(
  { target: { auth: true } },
  async (req: any, next) => {
    const tenantSlug =
      req.headers["x-tenant-slug"] ||
      req.headers["X-Tenant-Slug"] ||
      undefined;

    const access = await loadActorAccess(
      typeof tenantSlug === "string" ? tenantSlug : undefined,
    );

    assertSubscriptionActive(access);

    req.data.access = access;

    return next(req);
  },
);

export function getRequestAccess(): ActorAccess {
  const meta = currentRequest() as APICallMeta;
  const access = meta.middlewareData?.access as ActorAccess | undefined;
  if (!access) {
    throw APIError.permissionDenied("Access context tidak tersedia");
  }
  return access;
}