import { Route, Routes, BrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import Blogs from "./components/Blogs";
import Login from "./pages/Login";
import "./App.css";
import Navbar from "./pages/Navbar";
import Profile from "./pages/Profile";
import Signup from "./pages/Signup";
import { ToastContainer } from "react-toastify";
import Unauthorized from "./pages/Unauthorized";
import UserProtectedRoute from "./components/UserProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import SingleBlog from "./components/SingleBlog";
import UserDashboard from "./components/Dashbored/UserDashboard";
import AdminDashboard from "./components/Admin/AdminDashboard";
import Articles from "./components/Dashbored/Articles";
import Layout from "./components/Dashbored/Layout";
import AllUsersComments from "./components/Dashbored/AllUsersComments";
import UpdateBlog from "./components/Dashbored/UpdateBlog";
import Comments from "./pages/Comments";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";

const App = () => {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/single-blog/:slug" element={<SingleBlog />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected routes with sidebar layout */}
        <Route element={<UserProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/user-dashboard" element={<UserDashboard />} />
            <Route path="/create-articles" element={<Articles />} />
            <Route path="/edit-blog/:slug" element={<UpdateBlog />} />
            <Route path="/comments" element={<AllUsersComments />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/comments-page" element={<Comments />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        {/* Protected admin routes */}
        <Route element={<AdminProtectedRoute />}>
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          {/* Add more admin-only routes here */}
        </Route>
      </Routes>
      <ToastContainer style={{ background: "none" }} />
    </>
  );
};

export default App;
