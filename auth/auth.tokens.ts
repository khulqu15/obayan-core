import { jwtVerify, SignJWT } from "jose";
import { secret } from "encore.dev/config";
import { APIError } from "encore.dev/api";

const authJwtSecret = secret("AuthJwtSecret");

function getSecretKey() {
  const raw = authJwtSecret();

  if (!raw || !raw.trim()) {
    throw APIError.internal(
      "AuthJwtSecret belum diset. Isi secret JWT terlebih dahulu untuk local environment.",
    );
  }

  return new TextEncoder().encode(raw);
}

export interface AccessTokenPayload {
  userId: string;
  email: string;
  tenantSlug: string;
  sessionId?: string;
}

export interface VerifiedAccessToken {
  userId: string;
  email?: string;
  tenantSlug: string;
  sessionId?: string;
  tokenType: "access";
}

export interface TenantSelectionTokenPayload {
  userId: string;
  email: string;
  tenantIds: string[];
}

export interface VerifiedTenantSelectionToken {
  userId: string;
  email?: string;
  tenantIds: string[];
  tokenType: "tenant-selection";
}

export async function createAccessToken(payload: AccessTokenPayload) {
  return new SignJWT({
    email: payload.email,
    tenantSlug: payload.tenantSlug,
    sid: payload.sessionId,
    type: "access",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(getSecretKey());
}

export async function verifyAccessToken(
  token: string,
): Promise<VerifiedAccessToken> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: ["HS256"],
    });

    if (payload.type !== "access" || !payload.sub) {
      throw new Error("Invalid access token");
    }

    if (typeof payload.tenantSlug !== "string" || !payload.tenantSlug) {
      throw new Error("Missing tenant slug");
    }

    return {
      userId: payload.sub,
      email: typeof payload.email === "string" ? payload.email : undefined,
      tenantSlug: payload.tenantSlug,
      sessionId: typeof payload.sid === "string" ? payload.sid : undefined,
      tokenType: "access",
    };
  } catch {
    throw APIError.unauthenticated("Invalid or expired access token");
  }
}

export async function createTenantSelectionToken(
  payload: TenantSelectionTokenPayload,
) {
  return new SignJWT({
    email: payload.email,
    tenantIds: payload.tenantIds,
    type: "tenant-selection",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(getSecretKey());
}

export async function verifyTenantSelectionToken(
  token: string,
): Promise<VerifiedTenantSelectionToken> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: ["HS256"],
    });

    if (payload.type !== "tenant-selection" || !payload.sub) {
      throw new Error("Invalid tenant selection token");
    }

    const tenantIds = Array.isArray(payload.tenantIds)
      ? payload.tenantIds.filter((v): v is string => typeof v === "string")
      : [];

    return {
      userId: payload.sub,
      email: typeof payload.email === "string" ? payload.email : undefined,
      tenantIds,
      tokenType: "tenant-selection",
    };
  } catch {
    throw APIError.unauthenticated("Invalid or expired tenant selection token");
  }
}