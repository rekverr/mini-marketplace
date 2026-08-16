import React from "react";
import { Link } from "react-router-dom";
import type { Product } from "../../entities/product/product.types";
import { Button } from "../../components/ui/Button";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
}) => {
  return (
    <div className="flex flex-col rounded-lg border bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="aspect-w-1 aspect-h-1 mb-4 w-full overflow-hidden rounded-md bg-gray-100">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-48 w-full object-cover"
          />
        ) : (
          <div className="flex h-48 w-full items-center justify-center text-gray-400">
            No image
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            <Link to={`/product/${product.id}`} className="hover:underline">
              {product.name}
            </Link>
          </h3>
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">
            {product.description}
          </p>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">
            ${product.price}
          </span>
          {product.stockQuantity > 0 ? (
            <Button
              variant="primary"
              className="text-xs py-1 px-3"
              onClick={() => onAddToCart?.(product.id)}
            >
              Add to cart
            </Button>
          ) : (
            <span className="text-sm font-medium text-red-500">
              Out of stock
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
