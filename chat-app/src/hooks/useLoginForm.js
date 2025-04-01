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
  const [loading, setLoading] = useState(false); // Add loading state

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true); // Start loading

    try {
      let response;
      if (isSignup) {
        response = await signup(formData.email, formData.password, formData.displayName);
      } else {
        response = await login(formData.email, formData.password);
      }

      if (response.success) {
        navigate("/mainchatpage");
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false); // End loading regardless of outcome
    }
  };

  return { 
    isSignup, 
    setIsSignup, 
    formData, 
    error, 
    loading,  // Return loading state
    handleChange, 
    handleSubmit 
  };
};

export default useLoginForm;