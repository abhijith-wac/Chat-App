import React from "react";
import useLoginForm from "../hooks/useLoginForm";
import "../styles/login.css";

const Login = () => {
  const { isSignup, setIsSignup, formData, error, handleChange, handleSubmit, loading } = useLoginForm();

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>{isSignup ? "Create an Account" : "Welcome Back!"}</h2>
        <p className="subtitle">
          {isSignup ? "Join us and start chatting instantly!" : "Login to continue your conversations."}
        </p>

        <form onSubmit={handleSubmit}>
          {isSignup && (
            <div className="input-group">
              <input
                type="text"
                name="displayName"
                placeholder="Username"
                value={formData.displayName}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className="input-group">
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {isSignup && (
            <div className="terms">
              <input type="checkbox" required />
              <label> I agree to the <a href="#">Terms & Privacy Policy</a></label>
            </div>
          )}

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (isSignup ? "Signing Up..." : "Logging In...") : (isSignup ? "Sign Up" : "Login")}
          </button>
        </form>

        <p className="toggle-text">
          {isSignup ? "Already have an account?" : "Don't have an account?"}  
          <span onClick={() => setIsSignup(!isSignup)} className="toggle-link">
            {isSignup ? " Login here" : " Sign up here"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
