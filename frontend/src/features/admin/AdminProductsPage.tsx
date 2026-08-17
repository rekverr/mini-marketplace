import { useEffect, useState, type FormEvent } from "react";
import { catalogService } from "../../api/catalog.service";
import type {
  Category,
  Product,
  ProductWritePayload,
} from "../../entities/product/product.types";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { ErrorState, LoadingState } from "../../components/ui/FeedbackStates";
import { getApiErrorMessage } from "../../lib/api-error";

const emptyProduct: ProductWritePayload = {
  name: "",
  description: "",
  price: 0,
  categoryId: "",
  stockQuantity: 0,
  imageUrl: "",
};

export const AdminProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<ProductWritePayload>(emptyProduct);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsResponse, categoryResponse] = await Promise.all([
        catalogService.getProducts({ page: 1, limit: 100 }),
        catalogService.getCategories(),
      ]);
      setProducts(productsResponse.data);
      setCategories(categoryResponse);
      setForm((current) => ({
        ...current,
        categoryId: current.categoryId || categoryResponse[0]?.id || "",
      }));
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load products"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm({ ...emptyProduct, categoryId: categories[0]?.id || "" });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      ...form,
      imageUrl: form.imageUrl?.trim() || undefined,
      description: form.description?.trim() || undefined,
      price: Number(form.price),
      stockQuantity: Number(form.stockQuantity),
    };

    try {
      if (editingId) {
        await catalogService.updateProduct(editingId, payload);
      } else {
        await catalogService.createProduct(payload);
      }
      resetForm();
      await loadData();
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to save product"));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description ?? "",
      price: Number(product.price),
      categoryId: product.categoryId,
      stockQuantity: product.stockQuantity,
      imageUrl: product.imageUrl ?? "",
    });
  };

  const handleDelete = async (id: string) => {
    setError("");
    try {
      await catalogService.deleteProduct(id);
      await loadData();
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to delete product"));
    }
  };

  if (loading) return <LoadingState />;

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-950">Products</h1>
        <p className="mt-1 text-sm text-gray-500">Create and manage catalog products, prices, inventory and images.</p>
      </div>
      {error && <ErrorState message={error} />}

      <form
        className="grid gap-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:grid-cols-2"
        onSubmit={handleSubmit}
      >
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Product name</label>
          <Input
          required
          placeholder="e.g. Wireless headphones"
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Category</label>
          <Select
          required
          options={categories.map((category) => ({
            value: category.id,
            label: category.name,
          }))}
          value={form.categoryId}
          onChange={(event) =>
            setForm({ ...form, categoryId: event.target.value })
          }
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Price (USD)</label>
          <Input
          min={0}
          required
          step="0.01"
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={(event) =>
            setForm({ ...form, price: Number(event.target.value) })
          }
          />
          <p className="mt-1 text-xs text-gray-500">Customer-facing price before checkout.</p>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Stock quantity</label>
          <Input
          min={0}
          required
          type="number"
          placeholder="Stock"
          value={form.stockQuantity}
          onChange={(event) =>
            setForm({ ...form, stockQuantity: Number(event.target.value) })
          }
          />
          <p className="mt-1 text-xs text-gray-500">How many units are currently available.</p>
        </div>
        <div className="md:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Image URL</label>
          <Input
          className="w-full"
          placeholder="Image URL"
          type="url"
          value={form.imageUrl}
          onChange={(event) =>
            setForm({ ...form, imageUrl: event.target.value })
          }
          />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Description</label>
          <textarea
          className="block min-h-24 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 md:col-span-2"
          placeholder="Description"
          value={form.description}
          onChange={(event) =>
            setForm({ ...form, description: event.target.value })
          }
          />
        </div>
        <div className="flex gap-2 md:col-span-2">
          <Button isLoading={saving} type="submit">
            {editingId ? "Update product" : "Create product"}
          </Button>
          {editingId && (
            <Button type="button" variant="secondary" onClick={resetForm}>
              Cancel
            </Button>
          )}
        </div>
      </form>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-4 py-3 font-medium text-gray-950">
                  {product.name}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {product.category?.name ?? "-"}
                </td>
                <td className="px-4 py-3">${product.price}</td>
                <td className="px-4 py-3">{product.stockQuantity}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => handleEdit(product)}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      onClick={() => handleDelete(product.id)}
                    >
                      Delete
                    </Button>
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
