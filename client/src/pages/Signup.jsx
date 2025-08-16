import React, { useState, useRef } from "react";
import { FaUserCircle, FaCamera } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { toast } from "react-toastify";

export const baseUrl = "https://blog-app-ssrg.onrender.com";

const Signup = () => {
  const { auth, signup } = useAuth();

  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
    avatar: null,
  });

  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.match("image.*")) {
        setErrors((prev) => ({
          ...prev,
          avatar: "Please select an image file",
        }));
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          avatar: "File size must be less than 2MB",
        }));
        return;
      }

      setFormData((prev) => ({ ...prev, avatar: file }));
      setErrors((prev) => ({ ...prev, avatar: null }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.userName.trim()) newErrors.userName = "Username is required";
    else if (formData.userName.length <= 3)
      newErrors.userName = "Username must be more than 3 characters";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email))
      newErrors.email = "Email is invalid";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setIsLoading(true);
      try {
        const submitData = new FormData();
        submitData.append("userName", formData.userName);
        submitData.append("email", formData.email);
        submitData.append("password", formData.password);
        if (formData.avatar) {
          submitData.append("avatar", formData.avatar);
        }

        await signup(submitData);
        // toast.success("Registration successful!");
      } catch (error) {
        console.log(error)
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-2 mt-5">
      <div className="w-full max-w-md p-6 bg-[#1e1e1e] rounded-lg shadow-xl overflow-hidden">
        {/* Avatar Upload */}
        <div className="flex flex-col items-center mb-3">
          <div
            className="relative w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center cursor-pointer overflow-hidden group"
            onClick={triggerFileInput}
          >
            {preview ? (
              <img
                src={preview}
                alt="Avatar preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <FaUserCircle className="text-gray-500 text-5xl" />
            )}
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <FaCamera className="text-white text-xl" />
            </div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarChange}
            accept="image/*"
            className="hidden"
          />
          <p className="text-gray-400 text-sm mt-2">
            Click to upload profile picture
          </p>
          {errors.avatar && (
            <p className="text-red-500 text-sm mt-1">{errors.avatar}</p>
          )}
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              placeholder="Enter your username"
              disabled={isLoading}
              className={`w-full p-2 rounded-md text-sm md:text-base bg-[#2d2d2d] text-white border ${
                errors.userName ? "border-red-500" : "border-[#333]"
              } placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-2 ${
                errors.userName ? "focus:ring-red-300" : "focus:ring-orange-300"
              } disabled:bg-[#3d3d3d] disabled:cursor-not-allowed`}
            />
            {errors.userName && (
              <p className="mt-1 text-sm text-red-500">{errors.userName}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              disabled={isLoading}
              className={`w-full p-2 rounded-md text-sm md:text-base bg-[#2d2d2d] text-white border ${
                errors.email ? "border-red-500" : "border-[#333]"
              } placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-2 ${
                errors.email ? "focus:ring-red-300" : "focus:ring-orange-300"
              } disabled:bg-[#3d3d3d] disabled:cursor-not-allowed`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              disabled={isLoading}
              className={`w-full p-2 rounded-md text-sm md:text-base bg-[#2d2d2d] text-white border ${
                errors.password ? "border-red-500" : "border-[#333]"
              } placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-2 ${
                errors.password ? "focus:ring-red-300" : "focus:ring-orange-300"
              } disabled:bg-[#3d3d3d] disabled:cursor-not-allowed`}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full p-1 bg-orange-500 text-white rounded-md font-medium flex items-center justify-center gap-2 transition-all hover:bg-orange-600 active:scale-[0.98] disabled:bg-orange-300 disabled:cursor-not-allowed"
          >
            {isLoading && (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            )}
            {isLoading ? "Registering..." : "Register"}
          </button>
        </form>

        {/* Login Link */}
        <div className="text-center mt-4 text-gray-400 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-orange-500 hover:underline">
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
