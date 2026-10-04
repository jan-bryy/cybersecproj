// src/api/client.ts
import { SecureStorage } from "@aparajita/capacitor-secure-storage";

export const API_URL = import.meta.env.VITE_API_URL;
export const TOKEN_STORAGE_KEY = "shopapp_token";

/** The server answered, but with a non-2xx status. */
export class ApiError extends Error {
  status: number;
  body?: unknown;

  constructor(status: number, body?: unknown) {
    super(`API error ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

/** The request never reached the server (offline, DNS, timeout...). */
export class NetworkError extends Error {
  constructor() {
    super("Network error");
    this.name = "NetworkError";
  }
}

// Registered once by <SessionWatcher />; called when an authenticated
// request comes back 401 (expired token, deleted or suspended account).
let onUnauthorized: (() => void) | null = null;
export const setUnauthorizedHandler = (fn: (() => void) | null) => {
  onUnauthorized = fn;
};

const getToken = async (): Promise<string | null> => {
  try {
    return (await SecureStorage.get(TOKEN_STORAGE_KEY)) as string | null;
  } catch {
    return null;
  }
};

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  /** Attach the Bearer token and react to 401. Set false for login/public routes. */
  auth?: boolean;
}

export async function request<T>(
  path: string,
  { method = "GET", body, auth = true }: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";

  if (auth) {
    const token = await getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new NetworkError();
  }

  if (res.status === 401 && auth) onUnauthorized?.();

  if (!res.ok) {
    let data: unknown;
    try {
      data = await res.json();
    } catch {
      /* no JSON body */
    }
    throw new ApiError(res.status, data);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}