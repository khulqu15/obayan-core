export type AppRole =
    | "superadmin"
    | "admin"
    | "media"
    | "guardian"
    | "student";

export interface TenantAccessSettings {
    currentPlan: string;
    subscriptionStatus: "trial" | "active" | "grace" | "expired" | "suspended";
    enabledModules: string[];
    enabledFeatures: string[];
    roleScopes: Record<string, string[]>;
}

export interface ActorAccess {
    userId: string;
    tenantId: string;
    tenantSlug: string;
    roles: AppRole[];
    plan: string;
    subscriptionStatus: TenantAccessSettings["subscriptionStatus"];
    modules: string[];
    features: string[];
    roleScopes: Record<string, string[]>;
}

export interface CurrentAuthData {
    userId: string;
    tenantSlug?: string;
    role?: string;
}