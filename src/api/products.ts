// src/api/products.ts
import { Product } from '../context/CartContext';

const API_URL = import.meta.env.VITE_API_URL;

interface ProductRow {
  id: number | string;
  name: string;
  price: string | number; // Postgres numeric arrives as a string
  image?: string | null;
  image_url?: string | null;
  shop?: string | null;
  variant?: string | null;
}

const toProduct = (r: ProductRow): Product => ({
  id: String(r.id),
  name: r.name,
  price: Number(r.price),
  image: r.image ?? r.image_url ?? 'https://placehold.co/200x200?text=No+Image',
  shop: r.shop ?? undefined,
  variant: r.variant ?? undefined,
});

export const fetchProducts = async (): Promise<Product[]> => {
  const res = await fetch(`${API_URL}/api/products`);
  if (!res.ok) throw new Error(String(res.status));
  const rows: ProductRow[] = await res.json();
  return rows.map(toProduct);
};