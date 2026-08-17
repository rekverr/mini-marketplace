import { useEffect } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "./app/store";
import { bootstrapSession, logout } from "./features/auth/auth.slice";
import { AuthPage } from "./pages/auth/AuthPage";
import { ProtectedRoute } from "./app/guards/ProtectedRoute";
import { AdminRoute } from "./app/guards/AdminRoute";
import { CatalogPage } from "./features/catalog/CatalogPage";
import { ProductDetailPage } from "./features/catalog/ProductDetailPage";
import { CartPage } from "./features/cart/CartPage";
import { fetchCart } from "./features/cart/cart.slice";
import { CheckoutPage } from "./features/orders/CheckoutPage";
import { OrderHistoryPage } from "./features/orders/OrderHistoryPage";
import { AdminDashboardPage } from "./features/admin/AdminDashboardPage";
import { AdminProductsPage } from "./features/admin/AdminProductsPage";
import { AdminCategoriesPage } from "./features/admin/AdminCategoriesPage";
import { AdminOrdersPage } from "./features/admin/AdminOrdersPage";

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isAuthenticated, user, hydrated, isHydrating } = useSelector(
    (state: RootState) => state.auth,
  );
  const { data } = useSelector((state: RootState) => state.cart);

  const cartItemsCount =
    data?.items.reduce((acc, item) => acc + item.quantity, 0) || 0;

  useEffect(() => {
    dispatch(bootstrapSession());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/auth");
  };

  if (!hydrated || isHydrating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-700">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {isAuthenticated && (
        <header className="bg-white shadow">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-xl font-bold text-indigo-600">
                Mini Market
              </Link>
              <nav className="flex space-x-4">
                <Link to="/" className="cursor-pointer text-gray-600 transition hover:text-gray-900">
                  Catalog
                </Link>
                {user?.role === "ADMIN" && (
                  <Link
                    to="/admin"
                    className="cursor-pointer text-gray-600 transition hover:text-gray-900"
                  >
                    Admin Panel
                  </Link>
                )}
                {user?.role === "ADMIN" && (
                  <Link
                    to="/admin/orders"
                    className="cursor-pointer text-gray-600 transition hover:text-gray-900"
                  >
                    Orders Admin
                  </Link>
                )}
              </nav>
            </div>
            <div className="flex items-center space-x-6">
              <Link
                to="/cart"
                className="relative text-gray-600 hover:text-gray-900"
              >
                Cart
                {cartItemsCount > 0 && (
                  <span className="absolute -right-3 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-xs text-white">
                    {cartItemsCount}
                  </span>
                )}
              </Link>
              <Link to="/orders" className="cursor-pointer text-gray-600 transition hover:text-gray-900">
                Orders
              </Link>
              <button
                onClick={handleLogout}
                className="cursor-pointer text-sm font-medium text-gray-500 transition hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </header>
      )}

      <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        <Routes>
          <Route path="/auth" element={<AuthPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<CatalogPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/orders" element={<OrderHistoryPage />} />
          </Route>

          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/products" element={<AdminProductsPage />} />
            <Route path="/admin/categories" element={<AdminCategoriesPage />} />
            <Route path="/admin/orders" element={<AdminOrdersPage />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}

export default App;
