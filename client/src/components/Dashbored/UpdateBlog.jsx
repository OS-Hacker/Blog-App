import React, { useState, useEffect, useRef, useMemo } from "react";
import styled from "styled-components";
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

  // Quill editor configuration
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
    "list",
    "bullet",
    "link",
    "image",
  ];

  // Fetch single blog data
  useEffect(() => {
    const fetchBlogData = async () => {
      try {
        const { data } = await axios.get(`${baseUrl}/single-blog/${slug}`);
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
        console.error(error);
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

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate image size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setErrors({
          ...errors,
          coverImage: "Image size should be less than 2MB",
        });
        return;
      }

      // Validate image type
      if (!file.type.match("image.*")) {
        setErrors({
          ...errors,
          coverImage: "Only image files are allowed",
        });
        return;
      }

      setBlogData((prev) => ({
        ...prev,
        image: file,
        previewImage: URL.createObjectURL(file),
      }));
      setErrors({ ...errors, coverImage: "" });
    }
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

      // Only append image if a new one was selected
      if (blogData.image) {
        formData.append("coverImage", blogData.image);
      }

      // If image was removed
      if (!blogData.image && !blogData.previewImage && blogData.existingImage) {
        formData.append("removeImage", "true");
      }

      const { data } = await axios.put(
        `${baseUrl}/blog/edit/${blogId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success(data.message || "Blog updated successfully");
      navigate("/user-dashboard");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to update blog";
      toast.error(errorMessage);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderImagePreview = () => {
    if (blogData.previewImage) {
      if (
        typeof blogData.previewImage === "string" &&
        blogData.previewImage.startsWith("blob:")
      ) {
        return (
          <>
            <PreviewImage src={blogData.previewImage} alt="Cover preview" />
            <RemoveImageButton
              onClick={(e) => {
                e.stopPropagation();
                removeImage();
              }}
            >
              <FaTimes />
            </RemoveImageButton>
          </>
        );
      }
    }

    if (blogData.existingImage?.url) {
      return (
        <>
          <PreviewImage src={blogData.existingImage.url} alt="Cover preview" />
          <RemoveImageButton
            onClick={(e) => {
              e.stopPropagation();
              removeImage();
            }}
          >
            <FaTimes />
          </RemoveImageButton>
        </>
      );
    }

    return (
      <ImagePlaceholder>
        <FaImage size={40} color="#ccc" />
        <span>Click to upload cover image</span>
      </ImagePlaceholder>
    );
  };

  return (
    <PageContainer>
      <FormContainer>
        <FormHeading>Update Blog Post</FormHeading>
        <FormDescription>
          Update your knowledge and ideas with the community
        </FormDescription>

        <Form onSubmit={handleSubmit}>
          {/* Cover Image Upload */}
          <ImageUploadContainer>
            <ImageUploadLabel>Cover Image</ImageUploadLabel>
            <ImagePreview
              onClick={triggerFileInput}
              $hasError={!!errors.coverImage}
            >
              {renderImagePreview()}
              <CameraOverlay>
                <FaCamera size={20} />
                <span>Change Image</span>
              </CameraOverlay>
            </ImagePreview>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              style={{ display: "none" }}
            />
            {errors.coverImage && <ErrorText>{errors.coverImage}</ErrorText>}
            <ImageHint>
              Recommended size: 1200x630px, Max 2MB (JPEG, PNG)
            </ImageHint>
          </ImageUploadContainer>

          {/* Title Input */}
          <FormGroup>
            <Label htmlFor="title">Title *</Label>
            <Input
              type="text"
              id="title"
              name="title"
              value={blogData.title}
              onChange={handleChange}
              $hasError={!!errors.title}
              placeholder="Enter a catchy title..."
              maxLength="100"
            />
            <CharCount>{blogData.title.length}/100</CharCount>
            {errors.title && <ErrorText>{errors.title}</ErrorText>}
          </FormGroup>

          {/* Category Select */}
          <FormGroup>
            <Label htmlFor="category">Category *</Label>
            <Select
              id="category"
              name="category"
              value={blogData.category}
              onChange={handleChange}
              $hasError={!!errors.category}
            >
              <option value="">Select a category</option>
              <option value="technology">Technology</option>
              <option value="travel">Travel</option>
              <option value="food">Food & Cooking</option>
              <option value="lifestyle">Lifestyle</option>
              <option value="business">Business</option>
              <option value="health">Health & Wellness</option>
              <option value="education">Education</option>
            </Select>
            {errors.category && <ErrorText>{errors.category}</ErrorText>}
          </FormGroup>

          {/* Content Editor */}
          <FormGroup>
            <Label htmlFor="content">Content *</Label>
            <EditorContainer $hasError={!!errors.content}>
              <ReactQuill
                theme="snow"
                value={blogData.content}
                onChange={handleContentChange}
                modules={modules}
                formats={formats}
                ref={quillRef}
                style={{ height: "300px" }}
              />
            </EditorContainer>
            {errors.content && <ErrorText>{errors.content}</ErrorText>}
          </FormGroup>

          <ButtonGroup>
            <CancelButton type="button" onClick={() => navigate(-1)}>
              Cancel
            </CancelButton>
            <SubmitButton type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Spinner />
                  Updating...
                </>
              ) : (
                "Update Blog"
              )}
            </SubmitButton>
          </ButtonGroup>
        </Form>
      </FormContainer>
    </PageContainer>
  );
};

// Styled Components
// Styled Components (remain the same as in your original file)
const PageContainer = styled.div`
  min-height: 100vh;
  padding: 2rem 0;
`;


const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
`;

const FormContainer = styled.div`
  max-width: 800px;
  background: rgba(207, 198, 198, 0.1) !important;
  margin: 0px auto;
  border-radius: 30px;
  padding: 2.5rem;
`;

const CancelButton = styled.button`
  background: #f1f1f1;
  color: #2c3e50;

  &:hover {
    background: #e0e0e0;
  }
`;

const RemoveImageButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(231, 76, 60, 0.8);
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(231, 76, 60, 1);
    transform: scale(1.1);
  }
`;

const FormHeading = styled.h1`
  font-size: 2rem;
  color: #2c3e50;
  background-color: #151414 !important;
  text-align: center;
  font-weight: 700;
  @media (max-width: 768px) {
    margin-top: 10px;
  }
`;

const FormDescription = styled.p`
  text-align: center;
  color: #7f8c8d;
  background-color: #151414 !important;
  font-size: 1rem;

  @media (max-width: 768px) {
    display: none;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  background-color: #151414 !important;
  gap: 1.8rem;
`;

const ImageUploadContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #151414 !important;
  gap: 0.5rem;
`;

const ImageUploadLabel = styled.label`
  font-weight: 600;
  background-color: #151414 !important;
  font-size: 0.95rem;
`;

const ImagePreview = styled.div`
  position: relative;
  width: 100%;
  height: 200px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  border: 2px dashed ${(props) => (props.$hasError ? "#e74c3c" : "#bdc3c7")};
  transition: all 0.2s ease;
  background-color: #151414 !important;

  &:hover {
    border-color: ${(props) => (props.$hasError ? "#e74c3c" : "#ff9800")};
  }
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  background-color: #151414 !important;
`;

const ImagePlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
  background-color: #151414 !important;

  span {
    font-size: 0.95rem;
    background-color: #151414 !important;
  }
`;

const CameraOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #151414 !important;
  padding: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  opacity: 0;
  transition: opacity 0.2s ease;

  ${ImagePreview}:hover & {
    opacity: 1;
  }
`;

const ImageHint = styled.span`
  font-size: 0.8rem;
  color: #95a5a6;
  background-color: #151414 !important;
  text-align: center;
  margin-top: 0.3rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  background-color: #151414 !important;
`;

const Label = styled.label`
  font-weight: 600;
  color: #34495e;
  font-size: 0.95rem;
  background-color: #151414 !important;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid ${(props) => (props.$hasError ? "#e74c3c" : "#dfe6e9")};
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${(props) => (props.$hasError ? "#e74c3c" : "#ff9800")};
    box-shadow: 0 0 0 3px
      ${(props) =>
        props.$hasError ? "rgba(231, 76, 60, 0.1)" : "rgba(52, 152, 219, 0.1)"};
  }

  &::placeholder {
    color: #bdc3c7;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid ${(props) => (props.$hasError ? "#e74c3c" : "#dfe6e9")};
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.2s ease;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2334495e%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
  background-repeat: no-repeat;
  background-position: right 0.7rem top 50%;
  background-size: 0.65rem auto;

  &:focus {
    outline: none;
    border-color: #ff9800;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
  }
`;

const EditorContainer = styled.div`
  .ql-toolbar {
    border-radius: 6px 6px 0 0;
    border: 1px solid ${(props) => (props.$hasError ? "#e74c3c" : "#dfe6e9")};
    border-bottom: none;
  }

  .ql-container {
    border-radius: 0 0 6px 6px;
    border: 1px solid ${(props) => (props.$hasError ? "#e74c3c" : "#dfe6e9")};
    font-size: 1rem;
  }

  .ql-editor {
    min-height: 200px;
  }
`;

const CharCount = styled.span`
  font-size: 0.8rem;
  color: #95a5a6;
  text-align: right;
  margin-top: -0.3rem;
  background-color: #151414 !important;
`;

const ErrorText = styled.span`
  color: #e74c3c;
  font-size: 0.85rem;
  margin-top: -0.2rem;
  background-color: #151414 !important;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 0.5rem;
  background: #ff9800;
  z-index: 1223;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 4rem;

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
  }
  @media (max-width: 768px) {
    margin-top: 10rem;
  }
`;

const Spinner = styled.div`
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top: 2px solid white;
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

export default UpdateBlog;
