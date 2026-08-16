import { Routes, Route } from "react-router-dom";
import { AuthPage } from "./pages/auth/AuthPage";
import { ProtectedRoute } from "./app/guards/ProtectedRoute";
import { AdminRoute } from "./app/guards/AdminRoute";

function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <main>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />

          <Route element={<ProtectedRoute />}>
            <Route
              path="/"
              element={<h1 className="p-8 text-3xl font-bold">Catalog Page</h1>}
            />
            <Route
              path="/cart"
              element={<h1 className="p-8 text-3xl font-bold">Cart Page</h1>}
            />
            <Route
              path="/orders"
              element={
                <h1 className="p-8 text-3xl font-bold">Order History</h1>
              }
            />
          </Route>

          <Route element={<AdminRoute />}>
            <Route
              path="/admin"
              element={
                <h1 className="p-8 text-3xl font-bold">Admin Dashboard</h1>
              }
            />
            <Route
              path="/admin/products"
              element={
                <h1 className="p-8 text-3xl font-bold">Admin Products</h1>
              }
            />
            <Route
              path="/admin/orders"
              element={<h1 className="p-8 text-3xl font-bold">Admin Orders</h1>}
            />
          </Route>
        </Routes>
      </main>
    </div>
  );
}

export default App;
