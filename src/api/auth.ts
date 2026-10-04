// src/api/auth.ts
import { request } from "./client";
import type { AuthUser } from "../types";

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

// Throws ApiError (401 / 403 / 429 / ...) or NetworkError.
// AuthContext maps those to a LoginResult.
export const loginRequest = (email: string, password: string) =>
  request<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: { email: email.trim(), password },
    auth: false, // no token yet, and a 401 here means "wrong password", not "session ended"
  });