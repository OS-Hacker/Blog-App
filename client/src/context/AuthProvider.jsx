import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { baseUrl } from "../pages/Signup";
import { toast } from "react-toastify";
import Loading from "../pages/Loading";

// Set axios defaults once (moved outside component)
axios.defaults.withCredentials = true;

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const checkAuth = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${baseUrl}/auth/current-user`);
      setAuth(data.success ? data.user : null);
    } catch (err) {
      setAuth(null);
      console.error("Auth check failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleAuthAction = async (
    action,
    data,
    successMessage,
    redirectPath = "/"
  ) => {
    try {
      await axios.post(`${baseUrl}/${action}`, data);
      await checkAuth();
      toast.success(successMessage, { position: "top-center" });
      navigate(redirectPath);
    } catch (err) {
      toast.error(err.response?.data?.message || `${action} failed`, {
        position: "top-center",
      });
      throw err;
    }
  };

  const signup = useCallback(
    (submitData) =>
      handleAuthAction("signup", submitData, "Registration successful!"),
    [handleAuthAction]
  );

  const login = useCallback(
    (email, password) =>
      handleAuthAction("login", { email, password }, "Login successful!"),
    [handleAuthAction]
  );

  const logout = useCallback(async () => {
    try {
      await axios.post(`${baseUrl}/logout`);
      setAuth(null);
      toast.success("Logged out successfully", { position: "top-center" });
      navigate("/login");
    } catch (err) {
      toast.error("Logout failed", { position: "top-center" });
      console.error("Logout error:", err);
    }
  }, [navigate]);

  const contextValue = useMemo(
    () => ({
      auth,
      loading,
      signup,
      login,
      logout,
      isAuthenticated: !!auth,
      checkAuth,
    }),
    [auth, loading, signup, login, logout, checkAuth]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {loading ? <Loading /> : children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
