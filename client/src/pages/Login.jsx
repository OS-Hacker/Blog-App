import React, { useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../context/authProvider";

const Login = () => {
  const { auth, login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
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
      const { email, password } = formData;
      await login(email, password);
    }
  };

  return (
    <FormContainer>
      <Form onSubmit={handleSubmit}>
        <Title>Login</Title>
        <FormGroup>
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            id="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            $hasError={!!errors.email}
          />
          {errors.email && <Error>{errors.email}</Error>}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            id="password"
            placeholder="Enter your password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            $hasError={!!errors.password}
          />
          {errors.password && <Error>{errors.password}</Error>}
        </FormGroup>

        <SubmitButton type="submit">Login</SubmitButton>

        <LoginLink>
          Don't have an account? <Link to="/Signup">SignUp</Link>
        </LoginLink>
      </Form>
    </FormContainer>
  );
};

export default Login;

// Styled Components
const FormContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  margin-top: 60px;
`;

const Form = styled.form`
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 1.5rem;
  color: #ff9800;
  font-size: 30px;
  font-weight: 800;
`;

const FormGroup = styled.div`
  margin-bottom: 1.2rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #555;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid ${(props) => (props.$hasError ? "#ff4d4f" : "#ddd")};
  border-radius: 4px;
  font-size: 1rem;
  transition: border 0.3s;

  &:focus {
    outline: none;
    border-color: ${(props) => (props.$hasError ? "#ff4d4f" : "#ff9800")};
    box-shadow: 0 0 0 2px
      ${(props) =>
        props.$hasError ? "rgba(255, 77, 79, 0.2)" : "rgba(24, 144, 255, 0.2)"};
  }
`;

const Error = styled.span`
  color: #ff4d4f;
  font-size: 0.8rem;
  margin-top: 0.3rem;
  display: block;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 0.6rem;
  background: #ff9800;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background: #ff9800;
  }
`;

const LoginLink = styled.div`
  text-align: center;
  margin-top: 1rem;
  color: #666;
`;
