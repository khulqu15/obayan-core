import { APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { and, eq } from "drizzle-orm";
import { db } from "../db/client";
import { tenants, tenantSettings, userTenantRoles } from "../schema";
import type { ActorAccess, AppRole, TenantAccessSettings } from "./types";

function parseJsonArray(value: string | null | undefined): string[] {
    if (!value) return [];
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function parseJsonObject(value: string | null | undefined): Record<string, string[]> {
    if (!value) return {};
    try {
        const parsed = JSON.parse(value);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed as Record<string, string[]>;
        return {};
    } catch {
        return {};
    }
}

export async function loadActorAccess(tenantSlugFromHeader?: string): Promise<ActorAccess> {
    const auth: any = getAuthData();
    if (!auth) throw APIError.unauthenticated("Autentikasi dibutuhkan");

    const resolvedTenantSlug = tenantSlugFromHeader ?? auth.tenantSlug;
    if (!resolvedTenantSlug) throw APIError.invalidArgument("Tenant slug tidak ditemukan");

    const tenant = await db.query.tenants.findFirst({
        where: eq(tenants.slug, resolvedTenantSlug),
    });

    if (!tenant) throw APIError.notFound("Tenant tidak ditemukan");
    if (!tenant.isActive) throw APIError.permissionDenied("Tenant tidak aktif");

    const tenantRoleRows = await db.select().from(userTenantRoles).where(
        and(eq(userTenantRoles.tenantId, tenant.id), eq(userTenantRoles.userId, auth.userId)),
    );

    const roles = tenantRoleRows.map((r) => r.roleKey as AppRole);
    if (roles.length === 0) throw APIError.permissionDenied("Anda tidak memiliki akses ke tenant ini");

    const settings = await db.query.tenantSettings.findFirst({
        where: eq(tenantSettings.tenantId, tenant.id),
    });

    const accessSettings: TenantAccessSettings = {
        currentPlan: settings?.currentPlan ?? "basic",
        subscriptionStatus: (settings?.subscriptionStatus as TenantAccessSettings["subscriptionStatus"]) ?? "active",
        enabledModules: parseJsonArray(settings?.enabledModulesJson),
        enabledFeatures: parseJsonArray(settings?.enabledFeaturesJson),
        roleScopes: parseJsonObject(settings?.roleScopesJson),
    };

    return {
        userId: auth.userId,
        tenantId: tenant.id,
        tenantSlug: tenant.slug,
        roles,
        plan: accessSettings.currentPlan,
        subscriptionStatus: accessSettings.subscriptionStatus,
        modules: accessSettings.enabledModules,
        features: accessSettings.enabledFeatures,
        roleScopes: accessSettings.roleScopes,
    };
}

export function assertSubscriptionActive(access: ActorAccess) {
    if (!["trial", "active", "grace"].includes(access.subscriptionStatus)) throw APIError.permissionDenied("Subscription tenant tidak aktif");
}

export function assertRole(access: ActorAccess, ...allowedRoles: AppRole[]) {
  if (!access.roles.some((role) => allowedRoles.includes(role))) throw APIError.permissionDenied("Role Anda tidak diizinkan");
}

export function assertModule(access: ActorAccess, moduleKey: string) {
  if (!access.modules.includes(moduleKey)) throw APIError.permissionDenied(`Module ${moduleKey} tidak aktif untuk tenant ini`);
}

export function assertFeature(access: ActorAccess, featureKey: string) {
  if (!access.features.includes(featureKey)) throw APIError.permissionDenied(`Feature ${featureKey} tidak aktif untuk tenant ini`);
}

export function assertScopedFeature(access: ActorAccess, featureKey: string) {
    const hasScopedRole = access.roles.some((role) => {
        const scopes = access.roleScopes[role] ?? [];
        return scopes.includes("*") || scopes.includes(featureKey);
    });

    if (!hasScopedRole) throw APIError.permissionDenied(`Role Anda tidak memiliki scope ${featureKey}`);

    assertFeature(access, featureKey);
}