import React from "react";
import { useNavigate } from "react-router-dom";
import useLoginForm from "../hooks/useLoginForm";
import '../styles/login.css';

const Login = () => {
  const navigate = useNavigate();
  const { isSignup, setIsSignup, formData, error, handleChange, handleSubmit } = useLoginForm();

  return (
    <div className="login">
      <form className="login-form" onSubmit={(e) => handleSubmit(e, navigate)}>
        <h2>{isSignup ? "Sign Up" : "Login"}</h2>
        
        {isSignup && (
          <input
            type="text"
            name="displayName"
            placeholder="Username"
            value={formData.displayName}
            onChange={handleChange}
            className="form-input"
            required
          />
        )}
        
        <input
          type="email"
          name="email"
          placeholder="Email address"
          value={formData.email}
          onChange={handleChange}
          className="form-input"
          required
        />
        
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="form-input"
          required
        />
        
        <button type="submit">{isSignup ? "Sign Up" : "Login"}</button>

        {isSignup && (
          <div className="login-term">
            <input type="checkbox" required />
            <p>Agree to the terms of use & privacy policy.</p>
          </div>
        )}

        {error && <p className="error">{error}</p>}

        <div className="login-forgot">
          <p className="login-toggle">
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <span onClick={() => setIsSignup(!isSignup)} style={{ cursor: "pointer", color: "#4facfe" }}>
              {isSignup ? "Login here" : "Sign up here"}
            </span>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;
