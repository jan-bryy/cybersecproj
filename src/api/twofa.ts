import { request } from "./client";

export const startTwoFactorSetup = () =>
  request<{ qr: string; manualKey: string }>("/api/2fa/setup", { method: "POST" });

export const confirmTwoFactorSetup = (code: string) =>
  request<{ recoveryCodes: string[] }>("/api/2fa/verify-setup", {
    method: "POST",
    body: { code },
  });