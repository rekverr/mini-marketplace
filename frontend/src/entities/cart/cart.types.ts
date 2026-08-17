import type { Product } from "../product/product.types";

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  product?: Product;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
}

export interface AddToCartPayload {
  productId: string;
  quantity: number;
  optimisticProduct?: Product;
}
