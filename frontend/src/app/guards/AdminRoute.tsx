import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { type RootState } from "../store";

export const AdminRoute = () => {
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return user?.role === "ADMIN" ? <Outlet /> : <Navigate to="/" replace />;
};
