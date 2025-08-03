import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import Loading from "../pages/Loading";

const UserProtectedRoute = () => {
  const { auth, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace />
  );
};

export default UserProtectedRoute;
