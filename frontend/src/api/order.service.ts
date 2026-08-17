import { api } from "./axios";
import type {
  AnalyticsSummary,
  Order,
  OrderStatus,
} from "../entities/order/order.types";

export const orderService = {
  checkout: async (idempotencyKey: string): Promise<Order> => {
    const response = await api.post("/orders/checkout", {}, { headers: { "Idempotency-Key": idempotencyKey } });
    return response.data;
  },
  getMyOrders: async (): Promise<Order[]> => {
    const response = await api.get("/orders/me");
    return response.data;
  },
  getAllOrders: async (): Promise<Order[]> => {
    const response = await api.get("/orders/admin");
    return response.data;
  },
  updateOrderStatus: async (
    id: string,
    status: OrderStatus,
  ): Promise<Order> => {
    const response = await api.patch(`/orders/admin/${id}/status`, { status });
    return response.data;
  },
  getAnalyticsSummary: async (params?: { from?: string; to?: string }): Promise<AnalyticsSummary> => {
    const response = await api.get("/admin/analytics/summary", { params });
    return response.data;
  },
  downloadSalesCsv: async (params?: { from?: string; to?: string }): Promise<Blob> => {
    const response = await api.get("/admin/analytics/export.csv", {
      params,
      responseType: "blob",
    });
    return response.data;
  },
};
