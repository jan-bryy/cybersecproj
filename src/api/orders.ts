// src/api/orders.ts
import { request } from "./client";

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

// Throws ApiError:
//   400 { error: "bad_request" }  invalid items / payment method
//   400 { error: "unavailable" }  a product no longer exists
//   401                           session ended (SessionWatcher handles the logout)
export const placeOrder = (
  items: OrderItemInput[],
  paymentMethod: "cod" = "cod",
) =>
  request<PlaceOrderResponse>("/api/orders", {
    method: "POST",
    body: {
      items: items.map((i) => ({ id: Number(i.id), quantity: i.quantity })),
      paymentMethod,
    },
  });