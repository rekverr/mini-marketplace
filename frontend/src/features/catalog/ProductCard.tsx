import React from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import type { Product } from "../../entities/product/product.types";
import { Button } from "../../components/ui/Button";
import type { AppDispatch } from "../../app/store";
import { addToCart } from "../cart/cart.slice";

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleAddToCart = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    dispatch(
      addToCart({
        productId: product.id,
        quantity: 1,
        optimisticProduct: product,
      }),
    );
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      aria-label={`View ${product.name}`}
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            No image
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex-1">
          {product.category?.name && (
            <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
              {product.category.name}
            </span>
          )}
          <h3 className="mt-1 text-lg font-semibold text-gray-950 group-hover:text-indigo-700">
            {product.name}
          </h3>
          <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-gray-500">
            {product.description || "No description available."}
          </p>
        </div>

        <div className="mt-5 flex items-end justify-between gap-3 border-t border-gray-100 pt-4">
          <div>
            <p className="text-xl font-bold text-gray-950">${product.price}</p>
            <p
              className={`mt-1 text-xs font-medium ${
                product.stockQuantity > 0 ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {product.stockQuantity > 0
                ? `${product.stockQuantity} in stock`
                : "Out of stock"}
            </p>
          </div>

          {product.stockQuantity > 0 && (
            <Button
              type="button"
              variant="primary"
              className="shrink-0 px-3 py-2 text-xs"
              onClick={handleAddToCart}
            >
              Add to cart
            </Button>
          )}
        </div>
      </div>
    </Link>
  );
};
