import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { baseUrl } from "../../pages/Signup";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { FaImage, FaCamera, FaTimes } from "react-icons/fa";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const UpdateBlog = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const quillRef = useRef(null);

  const [blogData, setBlogData] = useState({
    title: "",
    content: "",
    category: "",
    image: null,
    previewImage: "",
    existingImage: null,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [blogId, setBlogId] = useState("");

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
    "list",
    "bullet",
    "link",
    "image",
  ];

  useEffect(() => {
    const fetchBlogData = async () => {
      try {
        const { data } = await axios.get(`${baseUrl}/v1/single-blog/${slug}`);
        setBlogData({
          title: data.title,
          content: data.content,
          category: data.category,
          previewImage: data.coverImage.url,
          existingImage: data.coverImage,
        });
        setBlogId(data._id);
      } catch (error) {
        toast.error("Failed to load blog data");
      }
    };
    fetchBlogData();
  }, [slug]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBlogData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContentChange = (value) => {
    setBlogData((prev) => ({ ...prev, content: value }));
  };

  const triggerFileInput = () => fileInputRef.current.click();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrors({
        ...errors,
        coverImage: "Image size should be less than 2MB",
      });
      return;
    }
    if (!file.type.match("image.*")) {
      setErrors({ ...errors, coverImage: "Only image files are allowed" });
      return;
    }

    setBlogData((prev) => ({
      ...prev,
      image: file,
      previewImage: URL.createObjectURL(file),
    }));
    setErrors({ ...errors, coverImage: "" });
  };

  const removeImage = () => {
    setBlogData((prev) => ({
      ...prev,
      image: null,
      previewImage: "",
      existingImage: null,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!blogData.title.trim()) newErrors.title = "Title is required";
    if (!blogData.content.trim()) newErrors.content = "Content is required";
    if (!blogData.category) newErrors.category = "Category is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", blogData.title);
      formData.append("content", blogData.content);
      formData.append("category", blogData.category);

      if (blogData.image) {
        formData.append("coverImage", blogData.image);
      }
      if (!blogData.image && !blogData.previewImage && blogData.existingImage) {
        formData.append("removeImage", "true");
      }

      const { data } = await axios.put(
        `${baseUrl}/blog/edit/${blogId}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      toast.success(data.message || "Blog updated successfully");
      navigate("/user-dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update blog");
    } finally {
      setLoading(false);
    }
  };

  const renderImagePreview = () => {
    if (blogData.previewImage) {
      return (
        <div className="relative w-full h-full">
          <img
            src={blogData.previewImage}
            alt="Cover"
            className="w-full h-full object-cover rounded"
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full"
          >
            <FaTimes />
          </button>
        </div>
      );
    }

    if (blogData.existingImage?.url) {
      return (
        <div className="relative w-full h-full">
          <img
            src={blogData.existingImage.url}
            alt="Cover"
            className="w-full h-full object-cover rounded"
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full"
          >
            <FaTimes />
          </button>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center gap-2 text-gray-400">
        <FaImage size={40} />
        <span>Click to upload cover image</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black py-10">
      <div className="max-w-3xl mx-auto bg-[#1a1a1a] rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-center text-white mb-2">
          Update Blog Post
        </h1>
        <p className="text-center text-gray-400 mb-6">
          Update your knowledge and ideas with the community
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Image Upload */}
          <div>
            <label className="block font-semibold text-gray-200 mb-2">
              Cover Image
            </label>
            <div
              onClick={triggerFileInput}
              className={`w-full h-52 flex items-center justify-center rounded border-2 border-dashed ${
                errors.coverImage ? "border-red-500" : "border-gray-500"
              } cursor-pointer relative overflow-hidden`}
            >
              {renderImagePreview()}
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-sm flex items-center justify-center gap-2 py-2 opacity-0 hover:opacity-100 transition">
                <FaCamera />
                <span>Change Image</span>
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
              <p className="text-red-500 text-sm mt-1">{errors.coverImage}</p>
            )}
            <p className="text-gray-400 text-xs mt-1 text-center">
              Recommended size: 1200x630px, Max 2MB (JPEG, PNG)
            </p>
          </div>

          {/* Title */}
          <div>
            <label className="block font-semibold text-gray-200 mb-1">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={blogData.title}
              onChange={handleChange}
              placeholder="Enter a catchy title..."
              maxLength="100"
              className={`w-full p-3 rounded border ${
                errors.title ? "border-red-500" : "border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-orange-500`}
            />
            <p className="text-gray-400 text-xs text-right mt-1">
              {blogData.title.length}/100
            </p>
            {errors.title && (
              <p className="text-red-500 text-sm">{errors.title}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block font-semibold text-gray-200 mb-1">
              Category *
            </label>
            <select
              name="category"
              value={blogData.category}
              onChange={handleChange}
              className={`w-full p-3 rounded border bg-black text-white ${
                errors.category ? "border-red-500" : "border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-orange-500`}
            >
              <option value="">Select a category</option>
              <option value="technology">Technology</option>
              <option value="travel">Travel</option>
              <option value="food">Food & Cooking</option>
              <option value="lifestyle">Lifestyle</option>
              <option value="business">Business</option>
              <option value="health">Health & Wellness</option>
              <option value="education">Education</option>
            </select>
            {errors.category && (
              <p className="text-red-500 text-sm">{errors.category}</p>
            )}
          </div>

          {/* Content */}
          <div>
            <label className="block font-semibold text-gray-200 mb-1">
              Content *
            </label>
            <ReactQuill
              theme="snow"
              value={blogData.content}
              onChange={handleContentChange}
              modules={modules}
              formats={formats}
              ref={quillRef}
              style={{ height: "300px", background: "white" }}
            />
            {errors.content && (
              <p className="text-red-500 text-sm">{errors.content}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-orange-500 text-white font-semibold rounded hover:bg-orange-600 transition flex items-center justify-center gap-2 disabled:bg-gray-400"
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
            )}
            {loading ? "Updating..." : "Update Blog"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdateBlog;
