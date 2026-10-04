// src/context/AuthContext.tsx
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { SecureStorage } from "@aparajita/capacitor-secure-storage";
import { ApiError, NetworkError, TOKEN_STORAGE_KEY } from "../api/client";
import { loginRequest, LoginResponse } from "../api/auth";
import type { AuthUser } from "../types";

export type LoginResult =
  | "success" //Goes to app/home
  | "invalid" //Incorrect email/pass
  | "suspended" //Self explanatory
  | "locked" //Too mant failed attempts
  | "network" //No internet
  | "error"; //Something is wrong, try again

interface AuthContextType {
  currentUser: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
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

  const login = async (
    email: string,
    password: string,
  ): Promise<LoginResult> => {
    let data: LoginResponse;
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

    try {
      await SecureStorage.set(TOKEN_STORAGE_KEY, data.token);
      await SecureStorage.set(USER_STORAGE_KEY, JSON.stringify(data.user));
      setCurrentUser(data.user);
      setToken(data.token);
      return "success";
    } catch (err) {
      console.error("Login failed after server response:", err);
      return "error";
    }
  };

  const logout = async () => {
    setCurrentUser(null);
    setToken(null);
    await clearStoredSession();
  };

  return (
    <AuthContext.Provider
      value={{ currentUser, token, isLoading, login, logout }}
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