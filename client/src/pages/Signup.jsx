import React, { useState, useRef } from "react";
import styled from "styled-components";
import { FaUserCircle, FaCamera } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

export const baseUrl = "https://blog-app-cpxu.onrender.com";
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
  const [isLoading, setIsLoading] = useState(false); // Added loading state
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // remove error while fill input
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      if (!file.type.match("image.*")) {
        setErrors((prev) => ({
          ...prev,
          avatar: "Please select an image file",
        }));
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        // 2MB limit
        setErrors((prev) => ({
          ...prev,
          avatar: "File size must be less than 2MB",
        }));
        return;
      }

      setFormData((prev) => ({ ...prev, avatar: file }));
      setErrors((prev) => ({ ...prev, avatar: null }));

      // Create preview
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
    if (!formData.userName.trim()) newErrors.username = "Username is required";
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
      setIsLoading(true); // Set loading to true when submitting
      try {
        const submitData = new FormData();
        submitData.append("userName", formData.userName);
        submitData.append("email", formData.email);
        submitData.append("password", formData.password);
        if (formData.avatar) {
          submitData.append("avatar", formData.avatar);
        }

        await signup(submitData);
      } catch (error) {
        console.error("Signup error:", error);
        // You might want to set errors here if the API returns validation errors
      } finally {
        setIsLoading(false); // Set loading to false when done
      }
    }
  };

  return (
    <FormContainer>
      <Form onSubmit={handleSubmit}>
        <AvatarContainer>
          <AvatarPreview onClick={triggerFileInput}>
            {preview ? (
              <AvatarImage src={preview} alt="Avatar preview" />
            ) : (
              <FaUserCircle size={50} color="#ccc" />
            )}
            <CameraIcon>
              <FaCamera size={16} />
            </CameraIcon>
          </AvatarPreview>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarChange}
            accept="image/*"
            style={{ display: "none" }}
          />
          <AvatarLabel>Click to upload profile picture</AvatarLabel>
          {errors.avatar && (
            <Error style={{ textAlign: "center" }}>{errors.avatar}</Error>
          )}
        </AvatarContainer>

        <FormGroup>
          <Label htmlFor="username">Username</Label>
          <Input
            type="text"
            id="username"
            name="userName"
            value={formData.userName}
            onChange={handleChange}
            $hasError={!!errors.username}
            placeholder="Enter your username"
            disabled={isLoading}
          />
          {errors.username && <Error>{errors.username}</Error>}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            $hasError={!!errors.email}
            placeholder="Enter your email"
            disabled={isLoading}
          />
          {errors.email && <Error>{errors.email}</Error>}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            $hasError={!!errors.password}
            placeholder="Enter your password"
            disabled={isLoading}
          />
          {errors.password && <Error>{errors.password}</Error>}
        </FormGroup>

        <SubmitButton type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Spinner /> Registering...
            </>
          ) : (
            "Register"
          )}
        </SubmitButton>

        <LoginLink>
          Already have an account? <Link to="/login">Login</Link>
        </LoginLink>
      </Form>
    </FormContainer>
  );
};

// Styled Components
const FormContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  margin-top: 50px;
`;

const Form = styled.form`
  width: 100%;
  max-width: 450px;
  padding: 2.5rem;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
`;

const AvatarContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const AvatarPreview = styled.div`
  position: relative;
  width: 90px;
  height: 90px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 2px solid #e0e0e0;

  &:hover {
    opacity: 0.9;
    border-color: #ff9800;
  }
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const CameraIcon = styled.div`
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: #ff9800;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const AvatarLabel = styled.span`
  margin-top: 0.6rem;
  font-size: 0.9rem;
  color: #666;
  text-align: center;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.6rem;
  font-weight: 500;
  color: #555;
  font-size: 0.95rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.7rem;
  border: 1px solid ${(props) => (props.$hasError ? "#ff4d4f" : "#ddd")};
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.3s;

  &:focus {
    outline: none;
    border-color: ${(props) => (props.$hasError ? "#ff4d4f" : "#ff9800")};
    box-shadow: 0 0 0 3px
      ${(props) =>
        props.$hasError ? "rgba(255, 77, 79, 0.1)" : "rgba(24, 144, 255, 0.1)"};
  }

  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

const Error = styled.span`
  color: #ff4d4f;
  font-size: 0.85rem;
  margin-top: 0.3rem;
  display: block;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 0.6rem;
  background: #ff9800;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    background: #ffcc80;
    cursor: not-allowed;
  }
`;

const Spinner = styled.div`
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const LoginLink = styled.div`
  text-align: center;
  margin-top: 1.5rem;
  color: #666;
  font-size: 0.95rem;

  a {
    color: #1890ff;
    text-decoration: none;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }
`;

export default Signup;
