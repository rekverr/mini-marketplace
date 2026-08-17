import { api } from "./axios";
import type {
  Product,
  Category,
  PaginatedResponse,
  CatalogQueryParams,
  ProductWritePayload,
} from "../entities/product/product.types";

export const catalogService = {
  getProducts: async (
    params: CatalogQueryParams,
  ): Promise<PaginatedResponse<Product>> => {
    const response = await api.get("/products", { params });
    return {
      data: response.data.data,
      total: response.data.meta.total,
      page: response.data.meta.page,
      limit: response.data.meta.limit,
      totalPages: response.data.meta.totalPages,
    };
  },
  getProductById: async (id: string): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get("/categories");
    return response.data;
  },
  createCategory: async (payload: Pick<Category, "name">): Promise<Category> => {
    const response = await api.post("/categories", payload);
    return response.data;
  },
  updateCategory: async (
    id: string,
    payload: Pick<Category, "name">,
  ): Promise<Category> => {
    const response = await api.patch(`/categories/${id}`, payload);
    return response.data;
  },
  deleteCategory: async (id: string): Promise<Category> => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
  createProduct: async (
    payload: ProductWritePayload,
  ): Promise<Product> => {
    const response = await api.post("/products", payload);
    return response.data;
  },
  updateProduct: async (
    id: string,
    payload: Partial<ProductWritePayload>,
  ): Promise<Product> => {
    const response = await api.patch(`/products/${id}`, payload);
    return response.data;
  },
  deleteProduct: async (id: string): Promise<Product> => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};
