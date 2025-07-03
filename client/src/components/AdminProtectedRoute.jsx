import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/authProvider";
import Loading from "../pages/Loading";

const AdminProtectedRoute = () => {
  const { auth, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const isAdmin = auth?.role === "Admin";

  return isAdmin ? <Outlet /> : <Navigate to="/unauthorized" replace />;
};

export default AdminProtectedRoute;
