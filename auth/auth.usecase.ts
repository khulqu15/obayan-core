import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { APIError } from "encore.dev/api";
import { secret } from "encore.dev/config";

import { authRepo } from "./auth.repo";
import { createAccessToken, createTenantSelectionToken, verifyTenantSelectionToken } from "./auth.tokens";
import { generateRawToken, sha256 } from "./auth.security";
import { sendMail } from "./auth.mail";
import {
  forgotPasswordEmailTemplate,
  verifyEmailTemplate,
  welcomeEmailTemplate,
} from "./templates/auth-email";

const appBaseUrl = secret("AppBaseUrl");

type PublicRegisterRole = "guardian" | "student";
type InternalRegisterRole = "admin" | "media" | "guardian" | "student";

interface UserTenantMembership {
  tenantId: string;
  tenantSlug: string;
  tenantName: string;
  roleKey: string;
}

function mapTenantMembership(m: UserTenantMembership) {
  return {
    id: m.tenantId,
    slug: m.tenantSlug,
    name: m.tenantName,
    role: m.roleKey,
  };
}

function mapUser(user: {
  id: string;
  displayName: string;
  email: string | null;
  emailVerifiedAt?: string | null;
}) {
  return {
    id: user.id,
    name: user.displayName,
    email: user.email,
    emailVerifiedAt: user.emailVerifiedAt ?? null,
  };
}

export const authUseCase = {
  async register(payload: {
    tenantSlug: string;
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: InternalRegisterRole;
  }) {
    const tenant = await authRepo.findTenantBySlug(payload.tenantSlug);
    if (!tenant) {
      throw APIError.notFound("Tenant tidak ditemukan");
    }

    const existing = await authRepo.findUserByEmail(payload.email);
    if (existing) {
      throw APIError.alreadyExists("Email sudah terdaftar");
    }

    /**
     * Untuk endpoint public register, sebaiknya batasi role.
     * Admin/media sebaiknya dibuat dari panel internal.
     */
    const requestedRole = payload.role ?? "guardian";
    const allowedPublicRoles: PublicRegisterRole[] = ["guardian", "student"];

    if (!allowedPublicRoles.includes(requestedRole as PublicRegisterRole)) {
      throw APIError.permissionDenied("Role ini tidak dapat didaftarkan melalui endpoint publik");
    }

    const userId = randomUUID();
    const now = new Date().toISOString();
    const passwordHash = await bcrypt.hash(payload.password, 12);

    await authRepo.createUser({
      userId,
      authUid: `local-${userId}`,
      displayName: payload.name,
      email: payload.email,
      phone: payload.phone ?? null,
      primaryRoleKey: requestedRole,
    });

    await authRepo.createPasswordCredential({
      id: `cred_${userId}`,
      userId,
      passwordHash,
    });

    await authRepo.addTenantRole({
      tenantId: tenant.id,
      userId,
      roleKey: requestedRole,
    });

    const rawVerifyToken = generateRawToken();
    const verifyTokenHash = sha256(rawVerifyToken);
    const verifyExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();

    await authRepo.saveEmailVerificationToken({
      id: randomUUID(),
      userId,
      email: payload.email,
      tokenHash: verifyTokenHash,
      expiresAt: verifyExpiresAt,
    });

    const verifyUrl = `${appBaseUrl()}/verify-email?token=${rawVerifyToken}`;

    await sendMail({
      to: payload.email,
      subject: `Verifikasi email ${tenant.brandName ?? tenant.name}`,
      html: verifyEmailTemplate({
        brandName: tenant.brandName ?? tenant.name,
        recipientName: payload.name,
        verifyUrl,
        expireMinutes: 24 * 60,
      }),
    });

    return {
      ok: true,
      message: "Registrasi berhasil. Silakan cek email untuk verifikasi akun.",
    };
  },

  async login(payload: {
    email: string;
    password: string;
  }) {
    const user = await authRepo.findUserByEmail(payload.email);

    if (!user || !user.isActive) {
      throw APIError.unauthenticated("Email atau password salah");
    }

    const credential = await authRepo.findCredentialByUserId(user.id);

    if (!credential) {
      throw APIError.unauthenticated("Email atau password salah");
    }

    const valid = await bcrypt.compare(payload.password, credential.passwordHash);

    if (!valid) {
      throw APIError.unauthenticated("Email atau password salah");
    }

    /**
     * Untuk login berbasis email, user perlu email verified.
     * Superadmin seed Anda seharusnya sudah diberi emailVerifiedAt.
     */
    // if (!user.emailVerifiedAt) {
    //   throw APIError.permissionDenied("Email belum diverifikasi");
    // }

    const memberships = await authRepo.findUserTenantMemberships(user.id);

    if (!memberships || memberships.length === 0) {
      throw APIError.permissionDenied("Akun ini belum memiliki akses tenant");
    }

    if (memberships.length === 1) {
      const membership = memberships[0];

      const accessToken = await createAccessToken({
        userId: user.id,
        email: user.email ?? "",
        tenantSlug: membership.tenantSlug,
        sessionId: randomUUID(),
      });

      await authRepo.touchLastLogin(user.id);

      return {
        requiresTenantSelection: false,
        accessToken,
        user: mapUser(user),
        tenant: mapTenantMembership(membership),
      };
    }

    const selectionToken = await createTenantSelectionToken({
      userId: user.id,
      email: user.email ?? "",
      tenantIds: memberships.map((m) => m.tenantId),
    });

    return {
      requiresTenantSelection: true,
      selectionToken,
      user: mapUser(user),
      availableTenants: memberships.map(mapTenantMembership),
    };
  },

  async selectTenant(payload: {
    selectionToken: string;
    tenantSlug: string;
  }) {
    const selection = await verifyTenantSelectionToken(payload.selectionToken);

    const user = await authRepo.findUserById(selection.userId);
    if (!user || !user.isActive) {
      throw APIError.unauthenticated("User tidak valid");
    }

    const membership = await authRepo.findTenantMembershipBySlug(
      selection.userId,
      payload.tenantSlug,
    );

    if (!membership) {
      throw APIError.permissionDenied("Tenant tidak dapat diakses oleh user ini");
    }

    /**
     * Optional extra check:
     * kalau selection token bawa daftar tenantIds yang valid, cocokkan juga.
     */
    if (
      Array.isArray(selection.tenantIds) &&
      selection.tenantIds.length > 0 &&
      !selection.tenantIds.includes(membership.tenantId)
    ) {
      throw APIError.permissionDenied("Tenant tidak termasuk dalam selection token");
    }

    const accessToken = await createAccessToken({
      userId: user.id,
      email: user.email ?? "",
      tenantSlug: membership.tenantSlug,
      sessionId: randomUUID(),
    });

    await authRepo.touchLastLogin(user.id);

    return {
      accessToken,
      user: mapUser(user),
      tenant: mapTenantMembership(membership),
    };
  },

  async forgotPassword(payload: {
    email: string;
  }) {
    /**
     * Respons generik agar tidak mudah dipakai untuk email enumeration.
     */
    const genericResponse = {
      ok: true,
      message: "Jika email terdaftar, instruksi reset password akan dikirim.",
    };

    const user = await authRepo.findUserByEmail(payload.email);

    if (!user || !user.isActive || !user.email) {
      return genericResponse;
    }

    const rawToken = generateRawToken();
    const tokenHash = sha256(rawToken);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 15).toISOString();

    await authRepo.savePasswordResetToken({
      id: randomUUID(),
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    /**
     * Ambil tenant pertama untuk branding email.
     * Kalau user multi-tenant, ini tetap aman karena reset password bersifat global user.
     */
    const memberships = await authRepo.findUserTenantMemberships(user.id);
    const firstTenant = memberships[0];

    const brandName = firstTenant?.tenantName ?? "Obayan";
    const resetUrl = `${appBaseUrl()}/reset-password?token=${rawToken}`;

    await sendMail({
      to: user.email,
      subject: `Reset password ${brandName}`,
      html: forgotPasswordEmailTemplate({
        brandName,
        recipientName: user.displayName,
        resetUrl,
        expireMinutes: 15,
      }),
      text: `Reset password akun Anda: ${resetUrl}`,
    });

    return genericResponse;
  },

  async resetPassword(payload: {
    token: string;
    newPassword: string;
  }) {
    const tokenHash = sha256(payload.token);
    const resetToken = await authRepo.findPasswordResetTokenByHash(tokenHash);

    if (!resetToken) {
      throw APIError.invalidArgument("Token reset tidak valid");
    }

    if (resetToken.usedAt) {
      throw APIError.invalidArgument("Token reset sudah digunakan");
    }

    if (new Date(resetToken.expiresAt).getTime() < Date.now()) {
      throw APIError.invalidArgument("Token reset sudah kedaluwarsa");
    }

    const passwordHash = await bcrypt.hash(payload.newPassword, 12);

    await authRepo.updatePasswordHash(resetToken.userId, passwordHash);
    await authRepo.markPasswordResetTokenUsed(resetToken.id);

    return {
      ok: true,
      message: "Password berhasil diperbarui",
    };
  },

  async verifyEmail(payload: {
    token: string;
  }) {
    const tokenHash = sha256(payload.token);
    const verification = await authRepo.findEmailVerificationTokenByHash(tokenHash);

    if (!verification) {
      throw APIError.invalidArgument("Token verifikasi tidak valid");
    }

    if (verification.verifiedAt) {
      return {
        ok: true,
        message: "Email sudah terverifikasi sebelumnya",
      };
    }

    if (new Date(verification.expiresAt).getTime() < Date.now()) {
      throw APIError.invalidArgument("Token verifikasi sudah kedaluwarsa");
    }

    await authRepo.markEmailVerified(verification.userId);
    await authRepo.markEmailVerificationTokenVerified(verification.id);

    return {
      ok: true,
      message: "Email berhasil diverifikasi",
    };
  },
};