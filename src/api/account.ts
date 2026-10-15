// src/api/account.ts
import { request } from "./client";

// What the user typed in the delete modal's verify step: a current
// authenticator code or a single-use recovery code.
export type SecondFactor = { code: string } | { recoveryCode: string };

// Pass what the user actually typed in the modal; the server re-checks the
// confirmation (it must equal "delete-account") and the second factor, so
// the UI is never the only gate.
//
// Throws ApiError:
//   400 { error: "bad_request" | "code_required" | "invalid_code" }
//   401                           session already ended
//   429 { error: "locked" }       too many wrong codes
//   500                           server error (transaction rolled back)
export const deleteAccount = (confirmation: string, second: SecondFactor) =>
  request<{ deleted: true }>("/api/account", {
    method: "DELETE",
    body: { confirmation, ...second },
  });

// Device security check consent. "Never asked" reads as false.
//
// Throws ApiError:
//   400 { error: "bad_request" }  granted wasn't a boolean
//   401                           session already ended
export const getDeviceConsent = () =>
  request<{ granted: boolean }>("/api/account/device-consent");

export const setDeviceConsent = (granted: boolean) =>
  request<{ granted: boolean }>("/api/account/device-consent", {
    method: "PATCH",
    body: { granted },
  });