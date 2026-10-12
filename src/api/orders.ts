// src/api/orders.ts
import { ApiError, request } from "./client";

// Matches the server contract: only id + quantity are sent.
// Prices are looked up server-side, so the cart's price is never trusted.
export interface OrderItemInput {
  id: string | number;
  quantity: number;
}

export interface PlaceOrderResponse {
  orderId: number;
  total: number; // subtotal + shipping, computed by the server
}

export type PaymentMethod = "cod" | "card";

// Throws ApiError:
//   400 { error: "bad_request" }         invalid items / payment method / card number
//   400 { error: "unavailable" }         a product no longer exists
//   401                                  session ended (SessionWatcher handles the logout)
//   403 { error: "checkout_rejected" }   flagged as unusual activity (M04)
export const placeOrder = (
  items: OrderItemInput[],
  paymentMethod: PaymentMethod = "cod",
  cardNumber?: string,
) =>
  request<PlaceOrderResponse>("/api/orders", {
    method: "POST",
    body: {
      items: items.map((i) => ({ id: Number(i.id), quantity: i.quantity })),
      paymentMethod,
      ...(paymentMethod === "card" ? { cardNumber } : {}),
    },
  });

export const isCheckoutRejected = (e: unknown): boolean =>
  e instanceof ApiError &&
  e.status === 403 &&
  (e.body as { error?: string } | undefined)?.error === "checkout_rejected";