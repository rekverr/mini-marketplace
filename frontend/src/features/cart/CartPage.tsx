import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../../app/store";
import { fetchCart, removeCartItem, updateCartItem } from "./cart.slice";
import { Button } from "../../components/ui/Button";
import {
  LoadingState,
  ErrorState,
  EmptyState,
} from "../../components/ui/FeedbackStates";

export const CartPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { data, loading, error } = useSelector(
    (state: RootState) => state.cart,
  );

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const totalAmount =
    data?.items.reduce((sum, item) => {
      return sum + Number(item.product?.price || 0) * item.quantity;
    }, 0) || 0;

  if (loading && !data) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!data || data.items.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Looks like you haven't added anything to your cart yet."
      />
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">Shopping Cart</h1>
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <ul className="divide-y divide-gray-200">
          {data.items.map((item) => (
            <li key={item.id} className="flex py-6">
              <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                {item.product?.imageUrl ? (
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="h-full w-full object-cover object-center"
                  />
                ) : (
                  <div className="h-full w-full bg-gray-100" />
                )}
              </div>
              <div className="ml-4 flex flex-1 flex-col">
                <div>
                  <div className="flex justify-between text-base font-medium text-gray-900">
                    <h3>
                      <Link to={`/product/${item.productId}`}>
                        {item.product?.name}
                      </Link>
                    </h3>
                    <p className="ml-4">${item.product?.price}</p>
                  </div>
                </div>
                <div className="flex flex-1 items-end justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <button
                      disabled={item.quantity <= 1}
                      onClick={() =>
                        dispatch(
                          updateCartItem({
                            productId: item.productId,
                            quantity: item.quantity - 1,
                          }),
                        )
                      }
                      className="flex h-8 w-8 items-center justify-center rounded border bg-gray-50 hover:bg-gray-100 disabled:opacity-50"
                    >
                      -
                    </button>
                    <span className="font-medium text-gray-700">
                      {item.quantity}
                    </span>
                    <button
                      disabled={
                        item.quantity >= (item.product?.stockQuantity || 0)
                      }
                      onClick={() =>
                        dispatch(
                          updateCartItem({
                            productId: item.productId,
                            quantity: item.quantity + 1,
                          }),
                        )
                      }
                      className="flex h-8 w-8 items-center justify-center rounded border bg-gray-50 hover:bg-gray-100 disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => dispatch(removeCartItem(item.productId))}
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-8 border-t border-gray-200 pt-6">
          <div className="flex justify-between text-lg font-medium text-gray-900">
            <p>Subtotal</p>
            <p>${totalAmount.toFixed(2)}</p>
          </div>
          <div className="mt-6">
            <Button className="w-full" onClick={() => navigate("/checkout")}>
              Proceed to Checkout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
