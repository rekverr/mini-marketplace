import type { User } from "../../features/auth/auth.types";

export type OrderStatus =
  | "NEW"
  | "PROCESSING"
  | "SHIPPED"
  | "COMPLETED"
  | "CANCELLED";

export interface OrderItem {
  id: string;
  productId: string;
  productNameSnapshot: string;
  unitPrice: string;
  quantity: number;
}

export interface Order {
  id: string;
  status: OrderStatus;
  totalAmount: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user?: Pick<User, "email">;
  orderItems: OrderItem[];
}

export interface AnalyticsSummary {
  from: string;
  to: string;
  totalRevenue: number;
  totalOrders: number;
  salesByDate: Record<string, number>;
  topProducts: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
}
