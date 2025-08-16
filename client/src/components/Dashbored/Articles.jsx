import React, { useState, useRef, useMemo } from "react";
import { FaCamera, FaImage } from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";
import { baseUrl } from "./../../pages/Signup";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import ImageResize from "quill-image-resize-module-react";

// Register the image resize module
ReactQuill.Quill.register("modules/imageResize", ImageResize);

const Articles = () => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "technology",
    coverImage: null,
  });

  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const quillRef = useRef(null);

  // Configure Quill modules
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        ["blockquote", "code-block"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ script: "sub" }, { script: "super" }],
        [{ indent: "-1" }, { indent: "+1" }],
        [{ direction: "rtl" }],
        [{ color: [] }, { background: [] }],
        [{ align: [] }],
        ["link", "image", "video"],
        ["clean"],
      ],
      imageResize: {
        parchment: ReactQuill.Quill.import("parchment"),
        modules: ["Resize", "DisplaySize"],
      },
    }),
    []
  );

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "code-block",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    "video",
    "color",
    "background",
    "align",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleContentChange = (content) => {
    setFormData((prev) => ({ ...prev, content }));

    if (errors.content) {
      setErrors((prev) => ({ ...prev, content: "" }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match("image.*")) {
      setErrors((prev) => ({
        ...prev,
        coverImage: "Please select an image file (JPEG, PNG)",
      }));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        coverImage: "Image must be less than 2MB",
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, coverImage: file }));
    setErrors((prev) => ({ ...prev, coverImage: "" }));

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length > 100) {
      newErrors.title = "Title must be 100 characters or less";
    }

    if (!formData.content.trim()) {
      newErrors.content = "Content is required";
    } else if (formData.content.split(" ").length < 200) {
      newErrors.content = "Content must be at least 200 words";
    }

    if (!formData.coverImage) {
      newErrors.coverImage = "Cover image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("content", formData.content);
      formDataToSend.append("category", formData.category);
      if (formData.coverImage) {
        formDataToSend.append("coverImage", formData.coverImage);
      }

      await axios.post(`${baseUrl}/blog/create`, formDataToSend);

      toast.success("Blog created successfully!", { position: "top-center" });
      setFormData({
        title: "",
        content: "",
        category: "technology",
        coverImage: null,
      });
      setPreview(null);
    } catch (error) {
      console.error("Error creating blog:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to create blog. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white py-8">
      <div className="max-w-3xl mx-auto bg-[#1a1a1a] rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-center text-orange-400">
          Create New Blog Post
        </h1>
        <p className="text-center text-gray-400 mt-2 hidden md:block">
          Share your knowledge and ideas with the community
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-6 mt-8 bg-[#151414]"
        >
          {/* Cover Image Upload */}
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-300">Cover Image</label>
            <div
              onClick={triggerFileInput}
              className={`relative w-full h-52 rounded-lg flex items-center justify-center cursor-pointer overflow-hidden border-2 border-dashed transition ${
                errors.coverImage
                  ? "border-red-500"
                  : "border-gray-500 hover:border-orange-400"
              }`}
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <FaImage size={40} />
                  <span>Click to upload cover image</span>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 py-2 flex items-center justify-center gap-2 opacity-0 hover:opacity-100 transition">
                <FaCamera size={18} />
                <span className="text-sm">Change Image</span>
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
            {errors.coverImage && (
              <span className="text-sm text-red-500">{errors.coverImage}</span>
            )}
            <span className="text-xs text-gray-400 text-center">
              Recommended size: 1200x630px, Max 2MB
            </span>
          </div>

          {/* Title Input */}
          <div className="flex flex-col gap-2">
            <label htmlFor="title" className="font-semibold text-gray-300">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter a catchy title..."
              maxLength="100"
              className={`w-full p-3 rounded-md border transition focus:outline-none ${
                errors.title
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-600 focus:border-orange-400"
              } bg-black text-white placeholder-gray-500`}
            />
            <span className="text-xs text-gray-400 text-right">
              {formData.title.length}/100
            </span>
            {errors.title && (
              <span className="text-sm text-red-500">{errors.title}</span>
            )}
          </div>

          {/* Category Select */}
          <div className="flex flex-col gap-2">
            <label htmlFor="category" className="font-semibold text-gray-300">
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full p-3 rounded-md border border-gray-600 bg-black text-white focus:border-orange-400 focus:outline-none"
            >
              <option value="technology">Technology</option>
              <option value="travel">Travel</option>
              <option value="food">Food & Cooking</option>
              <option value="lifestyle">Lifestyle</option>
              <option value="business">Business</option>
              <option value="health">Health & Wellness</option>
              <option value="education">Education</option>
            </select>
          </div>

          {/* Content Editor */}
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-300">Content *</label>
            <div
              className={`rounded-md ${
                errors.content
                  ? "border border-red-500"
                  : "border border-gray-600"
              }`}
            >
              <ReactQuill
                theme="snow"
                value={formData.content}
                onChange={handleContentChange}
                modules={modules}
                formats={formats}
                ref={quillRef}
                style={{ height: "300px" }}
              />
            </div>
            {errors.content && (
              <span className="text-sm text-red-500">{errors.content}</span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 rounded-md font-semibold flex items-center justify-center gap-2 transition ${
              isSubmitting
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-orange-500 hover:bg-orange-600"
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Publishing...
              </>
            ) : (
              "Publish Blog"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Articles;
