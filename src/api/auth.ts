import { request } from "./client";
import type { AuthUser } from "../types";

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface TwoFactorRequired {
  result: "2fa_required";
  pendingToken: string;
}

export const loginRequest = (email: string, password: string) =>
  request<LoginResponse | TwoFactorRequired>("/api/auth/login", {
    method: "POST",
    body: { email: email.trim(), password },
    auth: false,
  });

export const loginVerifyRequest = (
  pendingToken: string,
  input: { code?: string; recoveryCode?: string },
) =>
  request<LoginResponse>("/api/2fa/login-verify", {
    method: "POST",
    body: { pendingToken, ...input },
    auth: false,
  });

export const registerRequest = (name: string, email: string, password: string) =>
  request<LoginResponse>("/api/auth/register", {
    method: "POST",
    body: { name, email, password },
    auth: false,
  });