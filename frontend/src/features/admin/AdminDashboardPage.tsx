import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { orderService } from "../../api/order.service";
import type { AnalyticsSummary } from "../../entities/order/order.types";
import { Button } from "../../components/ui/Button";
import { ErrorState, LoadingState } from "../../components/ui/FeedbackStates";
import { getApiErrorMessage } from "../../lib/api-error";

export const AdminDashboardPage = () => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));

  const range = {
    from: new Date(`${from}T00:00:00`).toISOString(),
    to: new Date(`${to}T23:59:59.999`).toISOString(),
  };

  useEffect(() => {
    setLoading(true);
    setError("");
    orderService
      .getAnalyticsSummary(range)
      .then(setSummary)
      .catch((err) =>
        setError(getApiErrorMessage(err, "Failed to load analytics")),
      )
      .finally(() => setLoading(false));
  }, [from, to]);

  const handleExport = async () => {
    const blob = await orderService.downloadSalesCsv(range);
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "sales-export.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  const salesEntries = Object.entries(summary?.salesByDate ?? {}).sort(
    ([a], [b]) => a.localeCompare(b),
  );
  const maxDailyRevenue = Math.max(
    1,
    ...salesEntries.map(([, revenue]) => revenue),
  );

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-950">
            Admin dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Revenue excludes cancelled orders.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-sm text-gray-600">
            From{" "}
            <input
              className="ml-2 rounded border px-2 py-1"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </label>
          <label className="text-sm text-gray-600">
            To{" "}
            <input
              className="ml-2 rounded border px-2 py-1"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </label>
          <Button variant="secondary" onClick={handleExport}>
            Export CSV
          </Button>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          className="rounded-lg border border-gray-200 bg-white p-4"
          to="/admin/products"
        >
          <p className="text-sm text-gray-500">Products</p>
          <p className="mt-2 text-xl font-semibold text-gray-950">Manage</p>
        </Link>
        <Link
          className="rounded-lg border border-gray-200 bg-white p-4"
          to="/admin/categories"
        >
          <p className="text-sm text-gray-500">Categories</p>
          <p className="mt-2 text-xl font-semibold text-gray-950">Manage</p>
        </Link>
        <Link
          className="rounded-lg border border-gray-200 bg-white p-4"
          to="/admin/orders"
        >
          <p className="text-sm text-gray-500">Orders</p>
          <p className="mt-2 text-xl font-semibold text-gray-950">
            {summary?.totalOrders ?? 0}
          </p>
        </Link>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Revenue</p>
          <p className="mt-2 text-xl font-semibold text-gray-950">
            ${Number(summary?.totalRevenue ?? 0).toFixed(2)}
          </p>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="font-semibold text-gray-950">Daily sales</h2>
          <div className="mt-4 space-y-3">
            {salesEntries.length === 0 ? (
              <p className="text-sm text-gray-500">No sales in period.</p>
            ) : (
              salesEntries.map(([date, revenue]) => (
                <div
                  key={date}
                  className="grid grid-cols-[6rem_1fr_5rem] items-center gap-3 text-sm"
                >
                  <span className="text-gray-500">{date.slice(5)}</span>
                  <div className="h-2 rounded bg-gray-100">
                    <div
                      className="h-2 rounded bg-emerald-500"
                      style={{
                        width: `${Math.max(6, (revenue / maxDailyRevenue) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-right font-medium text-gray-900">
                    ${revenue.toFixed(0)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="font-semibold text-gray-950">Top products</h2>
          <div className="mt-4 divide-y divide-gray-100">
            {(summary?.topProducts ?? []).map((product) => (
              <div
                key={product.name}
                className="flex justify-between gap-4 py-3 text-sm"
              >
                <span className="text-gray-700">{product.name}</span>
                <span className="font-medium text-gray-950">
                  {product.quantity} units, ${product.revenue.toFixed(2)}
                </span>
              </div>
            ))}
            {(summary?.topProducts ?? []).length === 0 && (
              <p className="text-sm text-gray-500">No product sales yet.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
