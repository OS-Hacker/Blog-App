// Import necessary React hooks and other dependencies
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";
import axios from "axios"; // HTTP client for making API requests
import { useNavigate } from "react-router-dom"; // For programmatic navigation
import { toast } from "react-toastify"; // For showing notifications
import Loading from "../pages/Loading"; // Loading component
import { baseUrl } from "../pages/Signup";

// Configure axios to include credentials (cookies) with all requests
axios.defaults.withCredentials = true;

// Create an authentication context to share auth state across components
const AuthContext = createContext();

// AuthProvider component that wraps the application to provide auth functionality
const AuthProvider = ({ children }) => {
  // State for storing authenticated user data
  const [auth, setAuth] = useState(null);
  // State to track loading status during auth operations
  const [loading, setLoading] = useState(true);
  // Hook for programmatic navigation
  const navigate = useNavigate();

  // Function to check if user is authenticated
  const checkAuth = useCallback(async () => {
    setLoading(true); // Start loading
    try {
      // Make API call to check current user session
      const { data } = await axios.get(`${baseUrl}/auth/current-user`);
      // Update auth state if successful, otherwise set to null
      setAuth(data.success ? data.user : null);
    } catch (err) {
      // On error, clear auth state
      setAuth(null);
      console.error("Auth check failed:", err);
    } finally {
      setLoading(false); // Stop loading regardless of success/failure
    }
  }, []); // Empty dependency array means this is created once

  // Effect to check authentication status when component mounts
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Generic handler for auth actions (login/signup)
  const handleAuthAction = async (
    action, // 'login' or 'signup'
    data, // Form data to submit
    successMessage, // Message to show on success
    redirectPath = "/" // Where to redirect after success
  ) => {
    try {
      // Make API request to the specified endpoint
      await axios.post(`${baseUrl}/${action}`, data);
      // Verify the new auth state
      await checkAuth();
      // Show success notification
      toast.success(successMessage, { position: "top-center" });
      // Redirect to specified path
      navigate(redirectPath);
    } catch (err) {
      // Show error message from server or generic message
      toast.error(err.response?.data?.message || `${action} failed`, {
        position: "top-center",
      });
      // Re-throw error for component to handle if needed
      throw err;
    }
  };

  // Signup function - wraps handleAuthAction with specific parameters
  const signup = useCallback(
    (submitData) =>
      handleAuthAction("signup", submitData, "Registration successful!"),
    [handleAuthAction] // Only recreate if handleAuthAction changes
  );

  // Login function - wraps handleAuthAction with specific parameters
  const login = useCallback(
    (email, password) =>
      handleAuthAction("login", { email, password }, "Login successful!"),
    [handleAuthAction] // Only recreate if handleAuthAction changes
  );

  // Logout function
  const logout = useCallback(async () => {
    try {
      // Make API request to logout endpoint
      await axios.post(`${baseUrl}/logout`);
      // Clear auth state
      setAuth(null);
      // Redirect to login page
      navigate("/login");
    } catch (err) {
      // Show error notification
      toast.error("Logout failed", { position: "top-center" });
      console.error("Logout error:", err);
    }
  }, [navigate]); // Only recreate if navigate changes

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      auth, // Current user data
      loading, // Loading state
      signup, // Signup function
      login, // Login function
      logout, // Logout function
      isAuthenticated: !!auth, // Boolean indicating auth status
      checkAuth, // Function to manually check auth status
    }),
    [auth, loading, signup, login, logout, checkAuth] // Only recalculate when these change
  );

  // Render the provider with context value
  return (
    <AuthContext.Provider value={contextValue}>
      {/* Show loading spinner or children based on loading state */}
      {loading ? <Loading /> : children}
    </AuthContext.Provider>
  );
};

// Export the provider component
export default AuthProvider;

// Custom hook for consuming auth context
export const useAuth = () => {
  // Get context from nearest AuthProvider
  const context = useContext(AuthContext);
  // Throw error if used outside AuthProvider
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context; // Return auth context values
};
