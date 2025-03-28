import { useState } from "react";
import { useAtom } from "jotai";
import { isSignupAtom } from "../atoms/authAtom";
import { useNavigate } from "react-router-dom";
import useAuth from "../atoms/useAuth";

const useLoginForm = () => {
  const [isSignup, setIsSignup] = useAtom(isSignupAtom);
  const { signup, login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "", displayName: "" });
  const [error, setError] = useState("");

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    let response;
    if (isSignup) {
      response = await signup(formData.email, formData.password, formData.displayName);
    } else {
      response = await login(formData.email, formData.password);
    }

    if (response.success) {
      navigate("/mainchatpage"); // Navigate only if successful
    } else {
      setError(response.error); // Display error if signup/login fails
    }
  };

  return { isSignup, setIsSignup, formData, error, handleChange, handleSubmit };
};

export default useLoginForm;
