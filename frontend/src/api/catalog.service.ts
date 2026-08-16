import { api } from "./axios";
import type {
  Product,
  Category,
  PaginatedResponse,
  CatalogQueryParams,
} from "../entities/product/product.types";

export const catalogService = {
  getProducts: async (
    params: CatalogQueryParams,
  ): Promise<PaginatedResponse<Product>> => {
    const response = await api.get("/products", { params });
    return response.data;
  },
  getProductById: async (id: string): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get("/categories");
    return response.data;
  },
};
