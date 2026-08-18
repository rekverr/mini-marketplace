import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../app/store";
import { Button } from "../../components/ui/Button";
import { ErrorState } from "../../components/ui/FeedbackStates";
import { clearCartState, fetchCart } from "../cart/cart.slice";
import { orderService } from "../../api/order.service";
import { getApiErrorMessage } from "../../lib/api-error";

export const CheckoutPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { data } = useSelector((state: RootState) => state.cart);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const idempotencyKeyRef = useRef(crypto.randomUUID());

  const totalAmount =
    data?.items.reduce(
      (sum, item) => sum + Number(item.product?.price ?? 0) * item.quantity,
      0,
    ) ?? 0;

  const handleCheckout = async () => {
    setIsSubmitting(true);
    setError("");
    try {
      await orderService.checkout(idempotencyKeyRef.current);
      dispatch(clearCartState());
      navigate("/orders");
    } catch (err) {
      setError(getApiErrorMessage(err, "Checkout failed"));
      dispatch(fetchCart());
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!data || data.items.length === 0) {
    return (
      <section className="mx-auto max-w-3xl space-y-4">
        <h1 className="text-2xl font-semibold text-gray-950">Checkout</h1>
        <p className="text-sm text-gray-600">Your cart is empty.</p>
        <Link className="text-sm font-medium text-indigo-600" to="/">
          Back to catalog
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-950">Checkout</h1>
        <p className="mt-1 text-sm text-gray-600">
          Payment is simulated for this assignment. The backend revalidates
          prices and stock before creating the order.
        </p>
      </div>

      {error && <ErrorState message={error} />}

      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="divide-y divide-gray-100">
          {data.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 p-4"
            >
              <div>
                <p className="font-medium text-gray-950">
                  {item.product?.name ?? "Product"}
                </p>
                <p className="text-sm text-gray-500">
                  {item.quantity} x ${item.product?.price ?? "0.00"}
                </p>
              </div>
              <p className="font-semibold text-gray-950">
                ${(Number(item.product?.price ?? 0) * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-gray-200 p-4 text-lg font-semibold">
          <span>Total</span>
          <span>${totalAmount.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          className="w-full sm:w-auto"
          isLoading={isSubmitting}
          onClick={handleCheckout}
        >
          Place order
        </Button>
        <Button
          className="w-full sm:w-auto"
          variant="secondary"
          onClick={() => navigate("/cart")}
        >
          Back to cart
        </Button>
      </div>
    </section>
  );
};
