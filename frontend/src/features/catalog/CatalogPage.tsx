import { useEffect, useState } from "react";
import { catalogService } from "../../api/catalog.service";
import type {
  Product,
  Category,
  CatalogQueryParams,
} from "../../entities/product/product.types";
import { ProductCard } from "./ProductCard";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Pagination } from "../../components/ui/Pagination";
import {
  LoadingState,
  ErrorState,
  EmptyState,
} from "../../components/ui/FeedbackStates";

const PAGE_SIZE = 12;

export const CatalogPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [params, setParams] = useState<CatalogQueryParams>({
    page: 1,
    limit: PAGE_SIZE,
    search: "",
    categoryId: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  useEffect(() => {
    catalogService.getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await catalogService.getProducts(params);
        setProducts(res.data);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      } catch {
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    const timer = window.setTimeout(fetchProducts, 250);
    return () => window.clearTimeout(timer);
  }, [params]);

  const handleParamChange = (
    key: keyof CatalogQueryParams,
    value: string | number | undefined,
  ) => {
    setParams((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const categoryOptions = [
    { value: "", label: "All categories" },
    ...categories.map((category) => ({
      value: category.id,
      label: category.name,
    })),
  ];

  const sortOptions = [
    { value: "createdAt_desc", label: "Newest first" },
    { value: "price_asc", label: "Price: low to high" },
    { value: "price_desc", label: "Price: high to low" },
  ];

  const firstItem = total === 0 ? 0 : (params.page! - 1) * PAGE_SIZE + 1;
  const lastItem = Math.min(params.page! * PAGE_SIZE, total);

  return (
    <div className="space-y-7">
      <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 px-6 py-7 text-white shadow-sm sm:px-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-indigo-100">
          Marketplace
        </p>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Catalog</h1>
            <p className="mt-1 max-w-2xl text-sm text-indigo-100">
              Browse the full catalog, filter by category and price, and open a
              product by clicking anywhere on its card.
            </p>
          </div>
          <span className="text-sm text-indigo-100">
            {total} {total === 1 ? "product" : "products"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:sticky lg:top-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-semibold text-gray-950">Filters</h2>
            <button
              type="button"
              className="cursor-pointer text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              onClick={() =>
                setParams({
                  page: 1,
                  limit: PAGE_SIZE,
                  search: "",
                  categoryId: "",
                  sortBy: "createdAt",
                  sortOrder: "desc",
                })
              }
            >
              Reset
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Search
              </label>
              <Input
                placeholder="Search products..."
                value={params.search}
                onChange={(event) =>
                  handleParamChange("search", event.target.value)
                }
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Category
              </label>
              <Select
                options={categoryOptions}
                value={params.categoryId || ""}
                onChange={(event) =>
                  handleParamChange("categoryId", event.target.value)
                }
              />
              {!params.categoryId && categories.length > 0 && (
                <p className="mt-1.5 text-xs text-gray-500">
                  All categories are included. Use the pagination below to see
                  every product.
                </p>
              )}
            </div>
            <div>
              <p className="mb-1.5 text-sm font-medium text-gray-700">Price</p>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  min={0}
                  placeholder="Min"
                  value={params.minPrice ?? ""}
                  onChange={(event) =>
                    handleParamChange(
                      "minPrice",
                      event.target.value ? Number(event.target.value) : undefined,
                    )
                  }
                />
                <Input
                  type="number"
                  min={0}
                  placeholder="Max"
                  value={params.maxPrice ?? ""}
                  onChange={(event) =>
                    handleParamChange(
                      "maxPrice",
                      event.target.value ? Number(event.target.value) : undefined,
                    )
                  }
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Sort by
              </label>
              <Select
                options={sortOptions}
                value={`${params.sortBy}_${params.sortOrder}`}
                onChange={(event) => {
                  const [sortBy, sortOrder] = event.target.value.split("_");
                  setParams((prev) => ({
                    ...prev,
                    sortBy: sortBy as CatalogQueryParams["sortBy"],
                    sortOrder: sortOrder as CatalogQueryParams["sortOrder"],
                    page: 1,
                  }));
                }}
              />
            </div>
          </div>
        </aside>

        <section className="min-w-0">
          <div className="mb-4 flex flex-col gap-2 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
            <span>
              {total > 0
                ? `Showing ${firstItem}-${lastItem} of ${total}`
                : "No products"}
            </span>
            {totalPages > 1 && <span>Page {params.page} of {totalPages}</span>}
          </div>

          {loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState message={error} />
          ) : products.length === 0 ? (
            <EmptyState
              title="No products found"
              description="Try adjusting your search or filters."
            />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <div className="mt-6 rounded-2xl border border-gray-200 bg-white px-4 shadow-sm">
                <Pagination
                  currentPage={params.page || 1}
                  totalPages={totalPages}
                  onPageChange={(page) =>
                    setParams((prev) => ({ ...prev, page }))
                  }
                />
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
};
