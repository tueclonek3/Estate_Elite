import { useState } from "react";
import "./register.scss";
import { Link, useNavigate } from "react-router-dom";
import apiRequest from "../../lib/apiRequest";

function Register() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    const formData = new FormData(e.target);
    const email = formData.get("email");
    const password = formData.get("password");
    const confirmedPassword = formData.get("confirmedPassword");
    const displayName = formData.get("displayName");

    if (password !== confirmedPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      await apiRequest.post("/auth/register", {
        email,
        password,
        confirmedPassword,
        displayName
      });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="registerPage">
      <div className="formContainer">
        <form onSubmit={handleSubmit}>
          <h1>Create an Account</h1>
          <input 
            name="email" 
            type="email" 
            placeholder="Email" 
            required 
          />
          <input 
            name="displayName" 
            type="text" 
            placeholder="Display Name" 
            required 
          />
          <input 
            name="password" 
            type="password" 
            placeholder="Password" 
            required 
          />
          <input
            name="confirmedPassword"
            type="password"
            placeholder="Confirm Password"
            required
          />
          <button disabled={isLoading}>
            {isLoading ? "Registering..." : "Register"}
          </button>
          {error && <span className="error">{error}</span>}
          
          <div className="footer">
            <p>Already have an account? <Link to="/login">Sign in</Link></p>
            <div className="agentOption">
              <p>Want to become an agent?</p>
              <Link to="/agent-register">Sign up as agent</Link>
            </div>
          </div>
        </form>
      </div>
      <div className="imgContainer">
        <img src="/bg.png" alt="" />
      </div>
    </div>
  );
}

export default Register;