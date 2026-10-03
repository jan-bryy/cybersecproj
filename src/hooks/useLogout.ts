// src/hooks/useLogout.ts
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export const useLogout = () => {
  const { logout } = useAuth();
  const { clearCart } = useCart();

  return async () => {
    clearCart();
    await logout();
  };
};
