import { useEffect, useState, type FormEvent } from "react";
import { catalogService } from "../../api/catalog.service";
import type { Category } from "../../entities/product/product.types";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { ErrorState, LoadingState } from "../../components/ui/FeedbackStates";
import { getApiErrorMessage } from "../../lib/api-error";

export const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadCategories = () => {
    setLoading(true);
    catalogService
      .getCategories()
      .then(setCategories)
      .catch((err) =>
        setError(getApiErrorMessage(err, "Failed to load categories")),
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    catalogService
      .getCategories()
      .then(setCategories)
      .catch((err) =>
        setError(getApiErrorMessage(err, "Failed to load categories")),
      )
      .finally(() => setLoading(false));
  }, []);

  const resetForm = () => {
    setName("");
    setEditingId(null);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editingId) {
        await catalogService.updateCategory(editingId, { name });
      } else {
        await catalogService.createCategory({ name });
      }
      resetForm();
      loadCategories();
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to save category"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setError("");
    try {
      await catalogService.deleteCategory(id);
      loadCategories();
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to delete category"));
    }
  };

  if (loading) return <LoadingState />;

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-950">Categories</h1>
      {error && <ErrorState message={error} />}

      <form
        className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 sm:flex-row"
        onSubmit={handleSubmit}
      >
        <Input
          required
          minLength={2}
          placeholder="Category name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <div className="flex gap-2">
          <Button isLoading={saving} type="submit">
            {editingId ? "Update" : "Create"}
          </Button>
          {editingId && (
            <Button type="button" variant="secondary" onClick={resetForm}>
              Cancel
            </Button>
          )}
        </div>
      </form>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map((category) => (
              <tr key={category.id}>
                <td className="px-4 py-3 font-medium text-gray-950">
                  {category.name}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setEditingId(category.id);
                        setName(category.name);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      onClick={() => handleDelete(category.id)}
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
