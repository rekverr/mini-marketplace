import { useEffect, useState } from "react";
import { orderService } from "../../api/order.service";
import type { Order, OrderStatus } from "../../entities/order/order.types";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { ErrorState, LoadingState } from "../../components/ui/FeedbackStates";
import { getApiErrorMessage } from "../../lib/api-error";

const statusOptions: OrderStatus[] = [
  "NEW",
  "PROCESSING",
  "SHIPPED",
  "COMPLETED",
  "CANCELLED",
];

export const AdminOrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  const loadOrders = () => {
    setLoading(true);
    orderService
      .getAllOrders()
      .then(setOrders)
      .catch((err) => setError(getApiErrorMessage(err, "Failed to load orders")))
      .finally(() => setLoading(false));
  };

  useEffect(loadOrders, []);

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    setSavingId(orderId);
    setError("");
    try {
      const updatedOrder = await orderService.updateOrderStatus(orderId, status);
      setOrders((current) =>
        current.map((order) =>
          order.id === updatedOrder.id ? { ...order, ...updatedOrder } : order,
        ),
      );
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to update order status"));
    } finally {
      setSavingId(null);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-950">Orders</h1>
      {error && <ErrorState message={error} />}

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Update</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-950">
                    {order.id.slice(0, 8)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {order.user?.email ?? "-"}
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {order.orderItems
                    .map((item) => `${item.productNameSnapshot} x${item.quantity}`)
                    .join(", ")}
                </td>
                <td className="px-4 py-3 font-medium text-gray-950">
                  ${Number(order.totalAmount).toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={order.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Select
                      className="w-40"
                      value={order.status}
                      options={statusOptions.map((status) => ({
                        value: status,
                        label: status,
                      }))}
                      onChange={(event) =>
                        handleStatusChange(
                          order.id,
                          event.target.value as OrderStatus,
                        )
                      }
                    />
                    {savingId === order.id && (
                      <Button isLoading variant="secondary">
                        Saving
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
