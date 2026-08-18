import { useEffect, useState } from "react";
import { orderService } from "../../api/order.service";
import type { Order } from "../../entities/order/order.types";
import {
  ErrorState,
  LoadingState,
  EmptyState,
} from "../../components/ui/FeedbackStates";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { getApiErrorMessage } from "../../lib/api-error";

export const OrderHistoryPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    orderService
      .getMyOrders()
      .then(setOrders)
      .catch((err) =>
        setError(getApiErrorMessage(err, "Failed to load orders")),
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (orders.length === 0) {
    return (
      <EmptyState
        title="No orders yet"
        description="Completed checkouts will appear here."
      />
    );
  }

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-950">Order history</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <article
            key={order.id}
            className="rounded-lg border border-gray-200 bg-white p-4"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-gray-950">
                  Order {order.id.slice(0, 8)}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={order.status} />
                <span className="font-semibold text-gray-950">
                  ${Number(order.totalAmount).toFixed(2)}
                </span>
              </div>
            </div>
            <ul className="mt-4 divide-y divide-gray-100">
              {order.orderItems.map((item) => (
                <li
                  key={item.id}
                  className="flex justify-between gap-4 py-2 text-sm"
                >
                  <span className="text-gray-700">
                    {item.productNameSnapshot} x {item.quantity}
                  </span>
                  <span className="font-medium text-gray-900">
                    ${(Number(item.unitPrice) * item.quantity).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
};
