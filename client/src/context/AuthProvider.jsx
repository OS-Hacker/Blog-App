import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { baseUrl } from "../pages/Signup";
import { toast } from "react-toastify";
import Loading from "../pages/Loading";

axios.defaults.withCredentials = true;

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const checkAuth = useCallback(async () => {
    try {
      const { data } = await axios.get(`${baseUrl}/auth/current-user`, {
        withCredentials: true,
      });
      setAuth(data.success ? data.user : null);
    } catch (err) {
      setAuth(null);
      console.error("Auth check failed:", err);
    } finally {
      setLoading(false);
    }
  }, [setAuth, setLoading, baseUrl]); // ✅ All dependencies listed

  useEffect(() => {
    checkAuth();
  }, [checkAuth]); // Now stable, runs only once

  const signup = async (submitData) => {
    try {
      await axios.post(`${baseUrl}/signup`, submitData);
      await checkAuth();
      toast("Registration successful!", { position: "top-center" });
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed", {
        position: "top-center",
      });
      console.log(err);
      throw err;
    }
  };

  const login = async (email, password) => {
    try {
      await axios.post(`${baseUrl}/login`, { email, password });
      await checkAuth();
      toast("Login successful!", { position: "top-center" });
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed", {
        position: "top-center",
      });
      throw err;
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${baseUrl}/logout`);
      setAuth(null);
      toast("Logged out successfully", { position: "top-center" });
      navigate("/login");
    } catch (err) {
      toast.error("Logout failed", { position: "top-center" });
      console.error(err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        auth,
        loading,
        signup,
        login,
        logout,
        isAuthenticated: !!auth,
        checkAuth,
      }}
    >
      {loading ? <Loading /> : children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

export const useAuth = () => useContext(AuthContext);
