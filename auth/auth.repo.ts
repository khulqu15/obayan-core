import { and, eq } from "drizzle-orm";
import { db } from "../shared/db/client";
import {
  tenants,
  users,
  userTenantRoles,
  userPasswordCredentials,
  passwordResetTokens,
  emailVerificationTokens,
} from "../shared/schema";

export interface CreateUserParams {
  userId: string;
  authUid: string;
  displayName: string;
  email: string;
  phone?: string | null;
  primaryRoleKey: "admin" | "media" | "guardian" | "student";
}

export interface CreatePasswordCredentialParams {
  id: string;
  userId: string;
  passwordHash: string;
}

export interface AddTenantRoleParams {
  tenantId: string;
  userId: string;
  roleKey: "admin" | "media" | "guardian" | "student" | "superadmin";
}

export interface SaveEmailVerificationTokenParams {
  id: string;
  userId: string;
  email: string;
  tokenHash: string;
  expiresAt: string;
}

export interface SavePasswordResetTokenParams {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: string;
}

export const authRepo = {
  async findTenantBySlug(slug: string) {
    const rows = await db
      .select()
      .from(tenants)
      .where(eq(tenants.slug, slug))
      .limit(1);

    return rows[0] ?? null;
  },

  async findUserByEmail(email: string) {
    const rows = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return rows[0] ?? null;
  },

  async findUserById(userId: string) {
    const rows = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return rows[0] ?? null;
  },

  async findCredentialByUserId(userId: string) {
    const rows = await db
      .select()
      .from(userPasswordCredentials)
      .where(eq(userPasswordCredentials.userId, userId))
      .limit(1);

    return rows[0] ?? null;
  },

  async createUser(params: CreateUserParams) {
    const now = new Date().toISOString();

    await db.insert(users).values({
      id: params.userId,
      authUid: params.authUid,
      userType:
        params.primaryRoleKey === "guardian"
          ? "guardian"
          : params.primaryRoleKey === "student"
          ? "student"
          : "staff",
      displayName: params.displayName,
      email: params.email,
      phone: params.phone ?? null,
      primaryRoleKey: params.primaryRoleKey,
      isActive: true,
      emailVerifiedAt: null,
      lastLoginAt: null,
      passwordUpdatedAt: now,
      createdAt: now,
      updatedAt: now,
    });
  },

  async createPasswordCredential(params: CreatePasswordCredentialParams) {
    const now = new Date().toISOString();

    await db.insert(userPasswordCredentials).values({
      id: params.id,
      userId: params.userId,
      passwordHash: params.passwordHash,
      createdAt: now,
      updatedAt: now,
    });
  },

  async addTenantRole(params: AddTenantRoleParams) {
    const now = new Date().toISOString();

    await db.insert(userTenantRoles).values({
      tenantId: params.tenantId,
      userId: params.userId,
      roleKey: params.roleKey,
      createdAt: now,
      updatedAt: now,
    });
  },

  async saveEmailVerificationToken(params: SaveEmailVerificationTokenParams) {
    const now = new Date().toISOString();

    await db.insert(emailVerificationTokens).values({
      id: params.id,
      userId: params.userId,
      email: params.email,
      tokenHash: params.tokenHash,
      expiresAt: params.expiresAt,
      verifiedAt: null,
      createdAt: now,
      updatedAt: now,
    });
  },

  async findEmailVerificationTokenByHash(tokenHash: string) {
    const rows = await db
      .select()
      .from(emailVerificationTokens)
      .where(eq(emailVerificationTokens.tokenHash, tokenHash))
      .limit(1);

    return rows[0] ?? null;
  },

  async markEmailVerified(userId: string) {
    const now = new Date().toISOString();

    await db
      .update(users)
      .set({
        emailVerifiedAt: now,
        updatedAt: now,
      })
      .where(eq(users.id, userId));
  },

  async markEmailVerificationTokenVerified(id: string) {
    const now = new Date().toISOString();

    await db
      .update(emailVerificationTokens)
      .set({
        verifiedAt: now,
        updatedAt: now,
      })
      .where(eq(emailVerificationTokens.id, id));
  },

  async savePasswordResetToken(params: SavePasswordResetTokenParams) {
    const now = new Date().toISOString();

    await db.insert(passwordResetTokens).values({
      id: params.id,
      userId: params.userId,
      tokenHash: params.tokenHash,
      expiresAt: params.expiresAt,
      usedAt: null,
      createdAt: now,
      updatedAt: now,
    });
  },

  async findPasswordResetTokenByHash(tokenHash: string) {
    const rows = await db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.tokenHash, tokenHash))
      .limit(1);

    return rows[0] ?? null;
  },

  async markPasswordResetTokenUsed(id: string) {
    const now = new Date().toISOString();

    await db
      .update(passwordResetTokens)
      .set({
        usedAt: now,
        updatedAt: now,
      })
      .where(eq(passwordResetTokens.id, id));
  },

  async updatePasswordHash(userId: string, passwordHash: string) {
    const now = new Date().toISOString();

    await db
      .update(userPasswordCredentials)
      .set({
        passwordHash,
        updatedAt: now,
      })
      .where(eq(userPasswordCredentials.userId, userId));

    await db
      .update(users)
      .set({
        passwordUpdatedAt: now,
        updatedAt: now,
      })
      .where(eq(users.id, userId));
  },

  async touchLastLogin(userId: string) {
    const now = new Date().toISOString();

    await db
      .update(users)
      .set({
        lastLoginAt: now,
        updatedAt: now,
      })
      .where(eq(users.id, userId));
  },

  async findUserTenantMemberships(userId: string) {
    return db
      .select({
        tenantId: tenants.id,
        tenantSlug: tenants.slug,
        tenantName: tenants.name,
        roleKey: userTenantRoles.roleKey,
      })
      .from(userTenantRoles)
      .innerJoin(tenants, eq(tenants.id, userTenantRoles.tenantId))
      .where(eq(userTenantRoles.userId, userId));
  },

  async findTenantMembershipBySlug(userId: string, tenantSlug: string) {
    const rows = await db
      .select({
        tenantId: tenants.id,
        tenantSlug: tenants.slug,
        tenantName: tenants.name,
        roleKey: userTenantRoles.roleKey,
      })
      .from(userTenantRoles)
      .innerJoin(tenants, eq(tenants.id, userTenantRoles.tenantId))
      .where(
        and(
          eq(userTenantRoles.userId, userId),
          eq(tenants.slug, tenantSlug),
        ),
      )
      .limit(1);

    return rows[0] ?? null;
  },
};