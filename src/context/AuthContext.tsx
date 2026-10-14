// src/context/AuthContext.tsx
import {
  createContext,
  useContext,
  useState,
  useRef,
  ReactNode,
  useEffect,
} from "react";
import { SecureStorage } from "@aparajita/capacitor-secure-storage";
import { ApiError, NetworkError, TOKEN_STORAGE_KEY } from "../api/client";
import { loginRequest, loginVerifyRequest, registerRequest, unlockRequest, TwoFactorRequired, LoginResponse } from "../api/auth";
import type { AuthUser } from "../types";

export type LoginResult =
  | "success" //Goes to app/home
  | "2fa_required" //Password right, waiting for the 6-digit code
  | "invalid" //Incorrect email/pass
  | "suspended" //Self explanatory
  | "locked" //Too many failed attempts
  | "network" //No internet
  | "error"; //Something is wrong, try again

export type RegisterResult =
  | "success" //Account created and logged in
  | "email_taken" //Email already registered
  | "invalid" //Server rejected the details
  | "locked" //Too many attempts
  | "network" //No internet
  | "error"; //Something is wrong, try again

export type VerifyResult =
  | "success"
  | "invalid_code" //Wrong code
  | "locked" //Too many attempts, temporary lock
  | "expired" //Pending token expired, log in again
  | "network"
  | "error";

  export type UnlockResult =
  | "success"
  | "invalid" //Wrong email, password or code (the server doesn't say which)
  | "locked" //Too many attempts
  | "network"
  | "error";

interface AuthContextType {
  unlock: (input: {
    email: string;
    password: string;
    code?: string;
    recoveryCode?: string;
  }) => Promise<UnlockResult>;

  verifyTwoFactor: (input: { code?: string; recoveryCode?: string }) => Promise<VerifyResult>;
  markTwoFactorEnabled: () => Promise<void>;
  currentUser: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  register: (
    name: string,
    email: string,
    password: string,
  ) => Promise<RegisterResult>;
  logout: () => Promise<void>;
}

const USER_STORAGE_KEY = "shopapp_current_user";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Reads the "exp" claim from a JWT (no signature check; the server does that)
const isTokenExpired = (jwt: string): boolean => {
  try {
    const payload = JSON.parse(
      atob(jwt.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
    );
    return typeof payload.exp !== "number" || payload.exp * 1000 <= Date.now();
  } catch {
    return true; // malformed token -> treat as expired
  }
};

const clearStoredSession = async () => {
  try {
    await SecureStorage.remove(TOKEN_STORAGE_KEY);
    await SecureStorage.remove(USER_STORAGE_KEY);
  } catch (err) {
    console.error("Failed to clear secure storage:", err);
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pendingTokenRef = useRef<string | null>(null); 

  useEffect(() => {
    const restoreSession = async () => {
      // Remove anything left over from the old, insecure localStorage version
      localStorage.removeItem("shopapp_current_user");
      localStorage.removeItem("shopapp_token");

      try {
        const storedToken = (await SecureStorage.get(TOKEN_STORAGE_KEY)) as
          | string
          | null;
        const storedUser = (await SecureStorage.get(USER_STORAGE_KEY)) as
          | string
          | null;

        if (storedToken && storedUser && !isTokenExpired(storedToken)) {
          setCurrentUser(JSON.parse(storedUser));
          setToken(storedToken);
        } else if (storedToken || storedUser) {
          await clearStoredSession(); // expired or incomplete session
        }
      } catch (err) {
        console.error("Failed to restore session:", err);
        await clearStoredSession();
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  // Shared by login and register: store the session securely, then expose it
  const saveSession = async (data: LoginResponse) => {
    await SecureStorage.set(TOKEN_STORAGE_KEY, data.token);
    await SecureStorage.set(USER_STORAGE_KEY, JSON.stringify(data.user));
    setCurrentUser(data.user);
    setToken(data.token);
  };

  const login = async (
    email: string,
    password: string,
  ): Promise<LoginResult> => {
    let data: LoginResponse | TwoFactorRequired;
    try {
      data = await loginRequest(email, password);
    } catch (err) {
      if (err instanceof NetworkError) return "network";
      if (err instanceof ApiError) {
        if (err.status === 401) return "invalid";
        if (err.status === 403) return "suspended";
        if (err.status === 429) return "locked";
      }
      return "error";
    }

    if ("pendingToken" in data) {
      pendingTokenRef.current = data.pendingToken;
      return "2fa_required";
    }

    try {
      await saveSession(data);
      return "success";
    } catch (err) {
      console.error("Login failed after server response:", err);
      return "error";
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
  ): Promise<RegisterResult> => {
    let data: LoginResponse;
    try {
      data = await registerRequest(name, email, password);
    } catch (err) {
      if (err instanceof NetworkError) return "network";
      if (err instanceof ApiError) {
        if (err.status === 409) return "email_taken";
        if (err.status === 400) return "invalid";
        if (err.status === 429) return "locked";
      }
      return "error";
    }

    try {
      await saveSession(data);
      return "success";
    } catch (err) {
      console.error("Sign-up failed after server response:", err);
      return "error";
    }
  };

    const verifyTwoFactor = async (input: {
    code?: string;
    recoveryCode?: string;
  }): Promise<VerifyResult> => {
    const pendingToken = pendingTokenRef.current;
    if (!pendingToken) return "expired";

    let data: LoginResponse;
    try {
      data = await loginVerifyRequest(pendingToken, input);
    } catch (err) {
      if (err instanceof NetworkError) return "network";
      if (err instanceof ApiError) {
        const code = (err.body as { error?: string } | undefined)?.error;
        if (err.status === 429) return "locked";
        if (err.status === 401) {
          if (code === "pending_expired") {
            pendingTokenRef.current = null;
            return "expired";
          }
          if (code === "invalid_code") return "invalid_code";
        }
      }
      return "error";
    }

    try {
      await saveSession(data);
      pendingTokenRef.current = null;
      return "success";
    } catch (err) {
      console.error("2FA login failed after server response:", err);
      return "error";
    }
  };

    const unlock = async (input: {
    email: string;
    password: string;
    code?: string;
    recoveryCode?: string;
  }): Promise<UnlockResult> => {
    let data: LoginResponse;
    try {
      data = await unlockRequest(input);
    } catch (err) {
      if (err instanceof NetworkError) return "network";
      if (err instanceof ApiError) {
        if (err.status === 401) return "invalid";
        if (err.status === 429) return "locked";
      }
      return "error";
    }

    try {
      await saveSession(data);
      pendingTokenRef.current = null; // drop any half-finished login
      return "success";
    } catch (err) {
      console.error("Unlock failed after server response:", err);
      return "error";
    }
  };

  const markTwoFactorEnabled = async () => {
    if (!currentUser) return;
    const updated = { ...currentUser, totpEnabled: true };
    setCurrentUser(updated);
    try {
      await SecureStorage.set(USER_STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error("Failed to update stored user:", err);
    }
  };

  const logout = async () => {
    setCurrentUser(null);
    setToken(null);
    await clearStoredSession();
  };

  return (
    <AuthContext.Provider
      value={{ currentUser, token, isLoading, login, register, logout, verifyTwoFactor, markTwoFactorEnabled, unlock }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};