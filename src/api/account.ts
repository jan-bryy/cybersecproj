// src/api/account.ts
import { request } from "./client";

// Pass what the user actually typed in the modal; the server re-checks it
// (it must equal "delete-account"), so the UI is never the only gate.
//
// Throws ApiError:
//   400 { error: "bad_request" }  confirmation text didn't match
//   401                           session already ended
//   500                           server error (transaction rolled back)
export const deleteAccount = (confirmation: string) =>
  request<{ deleted: true }>("/api/account", {
    method: "DELETE",
    body: { confirmation },
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