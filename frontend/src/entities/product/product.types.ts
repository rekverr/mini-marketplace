export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  categoryId: string;
  stockQuantity: number;
  imageUrl?: string;
  createdAt: string;
  category?: Category;
}

export interface ProductWritePayload {
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  stockQuantity: number;
  imageUrl?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CatalogQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "price" | "createdAt";
  sortOrder?: "asc" | "desc";
}
