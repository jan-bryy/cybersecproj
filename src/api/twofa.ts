import { request } from "./client";

export const startTwoFactorSetup = () =>
  request<{ qr: string; manualKey: string }>("/api/2fa/setup", { method: "POST" });

export const confirmTwoFactorSetup = (code: string) =>
  request<{ recoveryCodes: string[] }>("/api/2fa/verify-setup", {
    method: "POST",
    body: { code },
  });

  export const getTwoFactorStatus = () =>
  request<{ enabled: boolean; recoveryRemaining: number }>("/api/2fa/status");

export const regenerateRecoveryCodes = (code: string) =>
  request<{ recoveryCodes: string[] }>("/api/2fa/recovery-codes", {
    method: "POST",
    body: { code },
  });