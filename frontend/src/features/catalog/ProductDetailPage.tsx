import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { catalogService } from "../../api/catalog.service";
import type { Product } from "../../entities/product/product.types";
import { Button } from "../../components/ui/Button";
import { LoadingState, ErrorState } from "../../components/ui/FeedbackStates";
import type { AppDispatch } from "../../app/store";
import { addToCart } from "../cart/cart.slice";

export const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      try {
        const data = await catalogService.getProductById(id);
        setProduct(data);
      } catch (err) {
        setError("Product not found");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <LoadingState />;
  if (error || !product) return <ErrorState message={error || "Not found"} />;

  return (
    <div className="mx-auto max-w-4xl rounded-lg bg-white p-6 shadow-sm">
      <Link
        to="/"
        className="mb-6 inline-block text-sm text-indigo-600 hover:underline"
      >
        &larr; Back to Catalog
      </Link>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="overflow-hidden rounded-lg bg-gray-100">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-96 items-center justify-center text-gray-400">
              No image
            </div>
          )}
        </div>
        <div className="flex flex-col justify-between">
          <div>
            {product.category && (
              <span className="text-sm font-medium text-indigo-600">
                {product.category.name}
              </span>
            )}
            <h1 className="mt-2 text-3xl font-bold text-gray-900">
              {product.name}
            </h1>
            <p className="mt-4 text-2xl font-semibold text-gray-900">
              ${product.price}
            </p>
            <p className="mt-6 whitespace-pre-wrap text-gray-600">
              {product.description}
            </p>
          </div>
          <div className="mt-8 border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Stock available: {product.stockQuantity}
              </span>
              {product.stockQuantity > 0 ? (
                <Button
                  variant="primary"
                  className="w-48"
                  onClick={() =>
                    dispatch(addToCart({ productId: product.id, quantity: 1 }))
                  }
                >
                  Add to Cart
                </Button>
              ) : (
                <span className="font-medium text-red-500">Out of Stock</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
