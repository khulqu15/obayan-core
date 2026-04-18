import { api } from "encore.dev/api";
import {
  authController,
  type RegisterRequest,
  type RegisterResponse,
  type LoginRequest,
  type LoginResponse,
  type ForgotPasswordRequest,
  type ForgotPasswordResponse,
  type ResetPasswordRequest,
  type ResetPasswordResponse,
  type VerifyEmailRequest,
  type VerifyEmailResponse,
} from "./auth.controller";

/**
 * Register
 */
export const register = api(
  {
    expose: true,
    method: "POST",
    path: "/auth/register",
    tags: ["Auth"],
  },
  async (body: RegisterRequest): Promise<RegisterResponse> => {
    return authController.register(body);
  },
);

/**
 * Login
 */
export const login = api(
  {
    expose: true,
    method: "POST",
    path: "/auth/login",
    tags: ["Auth"],
  },
  async (body: LoginRequest): Promise<LoginResponse> => {
    return authController.login(body);
  },
);

/**
 * Forgot Password
 * Selalu return respons generik agar tidak mudah dipakai untuk email enumeration.
 */
export const forgotPassword = api(
  {
    expose: true,
    method: "POST",
    path: "/auth/forgot-password",
    tags: ["Auth"],
  },
  async (body: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
    return authController.forgotPassword(body);
  },
);

/**
 * Reset Password
 */
export const resetPassword = api(
  {
    expose: true,
    method: "POST",
    path: "/auth/reset-password",
    tags: ["Auth"],
  },
  async (body: ResetPasswordRequest): Promise<ResetPasswordResponse> => {
    return authController.resetPassword(body);
  },
);

/**
 * Verify Email
 */
export const verifyEmail = api(
  {
    expose: true,
    method: "POST",
    path: "/auth/verify-email",
    tags: ["Auth"],
  },
  async (body: VerifyEmailRequest): Promise<VerifyEmailResponse> => {
    return authController.verifyEmail(body);
  },
);