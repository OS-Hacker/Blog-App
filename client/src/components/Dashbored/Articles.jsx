import React, { useState, useRef, useMemo } from "react";
import styled from "styled-components";
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

    // Validate file type
    if (!file.type.match("image.*")) {
      setErrors((prev) => ({
        ...prev,
        coverImage: "Please select an image file (JPEG, PNG)",
      }));
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        coverImage: "Image must be less than 2MB",
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, coverImage: file }));
    setErrors((prev) => ({ ...prev, coverImage: "" }));

    // Create preview
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

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length > 100) {
      newErrors.title = "Title must be 100 characters or less";
    }

    // Content validation
    if (!formData.content.trim()) {
      newErrors.content = "Content is required";
    } else if (formData.content.split(" ").length < 200) {
      newErrors.content = "Content must be at least 200 words";
    }

    // Cover image validation (optional based on your requirements)
    if (!formData.coverImage) {
      newErrors.coverImage = "Cover image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("content", formData.content);
      formDataToSend.append("category", formData.category);
      if (formData.coverImage) {
        formDataToSend.append("coverImage", formData.coverImage);
      }

      // Simulate API call
      console.log("Form data to submit:", Object.fromEntries(formDataToSend));

      await axios.post(`${baseUrl}/blog/create`, formDataToSend);

      toast.success("Blog created successfully!", { position: "top-center" });
      // Reset form after successful submission
      setFormData({
        title: "",
        content: "",
        category: "technology",
        coverImage: null,
      });
      setPreview(null);
    } catch (error) {
      console.error("Error creating blog:", error);
      toast.error("Failed to create blog. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <FormContainer>
        <FormHeading>Create New Blog Post</FormHeading>
        <FormDescription>
          Share your knowledge and ideas with the community
        </FormDescription>

        <Form onSubmit={handleSubmit}>
          {/* Cover Image Upload */}
          <ImageUploadContainer>
            <ImageUploadLabel>Cover Image</ImageUploadLabel>
            <ImagePreview
              onClick={triggerFileInput}
              $hasError={!!errors.coverImage}
            >
              {preview ? (
                <PreviewImage src={preview} alt="Cover preview" />
              ) : (
                <ImagePlaceholder>
                  <FaImage size={40} color="#ccc" />
                  <span>Click to upload cover image</span>
                </ImagePlaceholder>
              )}
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
            <ImageHint>Recommended size: 1200x630px, Max 2MB</ImageHint>
          </ImageUploadContainer>

          {/* Title Input */}
          <FormGroup>
            <Label htmlFor="title">Title *</Label>
            <Input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              $hasError={!!errors.title}
              placeholder="Enter a catchy title..."
              maxLength="100"
            />
            <CharCount>{formData.title.length}/100</CharCount>
            {errors.title && <ErrorText>{errors.title}</ErrorText>}
          </FormGroup>

          {/* Category Select */}
          <FormGroup>
            <Label htmlFor="category">Category *</Label>
            <Select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="technology">Technology</option>
              <option value="travel">Travel</option>
              <option value="food">Food & Cooking</option>
              <option value="lifestyle">Lifestyle</option>
              <option value="business">Business</option>
              <option value="health">Health & Wellness</option>
              <option value="education">Education</option>
            </Select>
          </FormGroup>

          {/* Content Editor */}
          <FormGroup>
            <Label htmlFor="content">Content *</Label>
            <EditorContainer $hasError={!!errors.content}>
              <ReactQuill
                theme="snow"
                value={formData.content}
                onChange={handleContentChange}
                modules={modules}
                formats={formats}
                ref={quillRef}
                style={{ height: "300px" }}
              />
            </EditorContainer>
            {errors.content && <ErrorText>{errors.content}</ErrorText>}
          </FormGroup>

          <SubmitButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner />
                Publishing...
              </>
            ) : (
              "Publish Blog"
            )}
          </SubmitButton>
        </Form>
      </FormContainer>
    </PageContainer>
  );
};

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  padding: 2rem 0;
  background-color: black;
`;

const FormContainer = styled.div`
  max-width: 800px;
  background: rgba(207, 198, 198, 0.1) !important;
  margin: 0px auto;
  border-radius: 30px;
  padding: 2.5rem;
  background-color: black;
`;

const FormHeading = styled.h1`
  font-size: 2rem;
  color: #2c3e50;
  background-color: #151414 !important;
  text-align: center;
  font-weight: 700;

  @media (max-width: 768px) {
    font-size: 1.8rem;
    margin: 10px;

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
  /* color: white; */
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
  border: 1px solid #dfe6e9;
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

export default Articles;
