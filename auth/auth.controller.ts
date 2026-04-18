import { APIError } from "encore.dev/api";
import { z } from "zod";
import { authUseCase } from "./auth.usecase";

export interface RegisterRequest {
    tenantSlug: string;
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: "admin" | "media" | "guardian" | "student";
}

export interface RegisterResponse {
    ok: boolean;
    message: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    requiresTenantSelection: boolean;
    accessToken?: string;
    selectionToken?: string;
    user: {
        id: string;
        name: string;
        email: string | null;
        emailVerifiedAt?: string | null;
    };
    tenant?: {
        id: string;
        slug: string;
        name: string;
        role: string;
    };
    availableTenants?: Array<{
        id: string;
        slug: string;
        name: string;
        role: string;
    }>;
}

export interface SelectTenantRequest {
    selectionToken: string;
    tenantSlug: string;
}

export interface SelectTenantResponse {
    accessToken: string;
    user: {
        id: string;
        name: string;
        email: string | null;
        emailVerifiedAt?: string | null;
    };
    tenant: {
        id: string;
        slug: string;
        name: string;
        role: string;
    };
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ForgotPasswordResponse {
    ok: boolean;
    message: string;
}

export interface ResetPasswordRequest {
    token: string;
    newPassword: string;
}

export interface ResetPasswordResponse {
    ok: boolean;
    message: string;
}

export interface VerifyEmailRequest {
    token: string;
}

export interface VerifyEmailResponse {
    ok: boolean;
    message: string;
}

const registerSchema = z.object({
    tenantSlug: z.string().min(2).max(120).trim(),
    name: z.string().min(2).max(120).trim(),
    email: z.string().email().transform((v) => v.trim().toLowerCase()),
    password: z.string().min(8).max(100),
    phone: z.string().min(8).max(30).trim().optional(),
    role: z.enum(["admin", "media", "guardian", "student"]).optional(),
});

const loginSchema = z.object({
    email: z.string().email().transform((v) => v.trim().toLowerCase()),
    password: z.string().min(8).max(100),
});

const selectTenantSchema = z.object({
    selectionToken: z.string().min(20),
    tenantSlug: z.string().min(2).max(120).trim(),
});

const forgotPasswordSchema = z.object({
    email: z.string().email().transform((v) => v.trim().toLowerCase()),
});

const resetPasswordSchema = z.object({
    token: z.string().min(20).max(500).trim(),
    newPassword: z.string().min(8).max(100),
});

const verifyEmailSchema = z.object({
    token: z.string().min(20).max(500).trim(),
});

function parseOrThrow<T>(schema: z.ZodSchema<T>, payload: unknown, fallbackMessage: string): T {
    const parsed = schema.safeParse(payload);

    if (!parsed.success) {
        const firstIssue = parsed.error.issues[0];
        throw APIError.invalidArgument(firstIssue?.message ?? fallbackMessage);
    }

    return parsed.data;
}

export class AuthController {
    async register(payload: RegisterRequest): Promise<RegisterResponse> {
        const data = parseOrThrow(registerSchema, payload, "Payload register tidak valid");
        return authUseCase.register(data);
    }

    async login(payload: LoginRequest): Promise<LoginResponse> {
        const data = parseOrThrow(loginSchema, payload, "Payload login tidak valid");
        return authUseCase.login(data);
    }

    async selectTenant(payload: SelectTenantRequest): Promise<SelectTenantResponse> {
        const data = parseOrThrow(selectTenantSchema, payload, "Payload select tenant tidak valid");
        return authUseCase.selectTenant(data);
    }

    async forgotPassword(payload: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
        const data = parseOrThrow(forgotPasswordSchema, payload, "Payload forgot password tidak valid");
        return authUseCase.forgotPassword(data);
    }

    async resetPassword(payload: ResetPasswordRequest): Promise<ResetPasswordResponse> {
        const data = parseOrThrow(resetPasswordSchema, payload, "Payload reset password tidak valid");
        return authUseCase.resetPassword(data);
    }

    async verifyEmail(payload: VerifyEmailRequest): Promise<VerifyEmailResponse> {
        const data = parseOrThrow(verifyEmailSchema, payload, "Payload verify email tidak valid");
        return authUseCase.verifyEmail(data);
    }
}

export const authController = new AuthController();