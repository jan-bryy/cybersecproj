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