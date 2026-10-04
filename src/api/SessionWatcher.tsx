// src/components/SessionWatcher.tsx
import { useEffect } from "react";
import { setUnauthorizedHandler } from "../api/client";
import { useLogout } from "../hooks/useLogout";

// Render once, inside both <AuthProvider> and <CartProvider>.
// useLogout clears the cart too, so a forced logout doesn't leave items behind.
const SessionWatcher: React.FC = () => {
  const logout = useLogout();

  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  return null;
};

export default SessionWatcher;