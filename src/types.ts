// src/types.ts
// Shared types. Imported by both src/api/ and src/context/

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  shop?: string;
  variant?: string;
}

export interface AuthUser {
  id: number;
  email: string;
  name: string;
}