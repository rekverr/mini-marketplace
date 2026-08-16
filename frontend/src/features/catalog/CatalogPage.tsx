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

export const CatalogPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [params, setParams] = useState<CatalogQueryParams>({
    page: 1,
    limit: 12,
    search: "",
    categoryId: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  useEffect(() => {
    catalogService
      .getCategories()
      .then(setCategories)
      .catch(() => {});
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
      } catch (err: any) {
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timer);
  }, [params]);

  const handleParamChange = (key: keyof CatalogQueryParams, value: any) => {
    setParams((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const categoryOptions = [
    { value: "", label: "All Categories" },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  const sortOptions = [
    { value: "createdAt_desc", label: "Newest First" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Catalog</h1>
        <div className="text-sm text-gray-500">{total} products found</div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="md:col-span-1 space-y-4 rounded-lg bg-white p-4 shadow-sm h-fit">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Search
            </label>
            <Input
              placeholder="Search products..."
              value={params.search}
              onChange={(e) => handleParamChange("search", e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Category
            </label>
            <Select
              options={categoryOptions}
              value={params.categoryId || ""}
              onChange={(e) => handleParamChange("categoryId", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Min Price
              </label>
              <Input
                type="number"
                placeholder="0"
                value={params.minPrice || ""}
                onChange={(e) =>
                  handleParamChange(
                    "minPrice",
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Max Price
              </label>
              <Input
                type="number"
                placeholder="Any"
                value={params.maxPrice || ""}
                onChange={(e) =>
                  handleParamChange(
                    "maxPrice",
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Sort By
            </label>
            <Select
              options={sortOptions}
              value={`${params.sortBy}_${params.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split("_");
                setParams((prev) => ({
                  ...prev,
                  sortBy: sortBy as any,
                  sortOrder: sortOrder as any,
                  page: 1,
                }));
              }}
            />
          </div>
        </div>

        <div className="md:col-span-3">
          {loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState message={error} />
          ) : products.length === 0 ? (
            <EmptyState
              title="No products found"
              description="Try adjusting your search or filters"
            />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={(id) => console.log("Will add to cart:", id)}
                  />
                ))}
              </div>
              <Pagination
                currentPage={params.page || 1}
                totalPages={totalPages}
                onPageChange={(page) =>
                  setParams((prev) => ({ ...prev, page }))
                }
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
