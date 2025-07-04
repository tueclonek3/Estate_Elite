import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiRequest from "../../lib/apiRequest";
import "./agentRegister.scss";
import { AgentContext } from "../../context/AgentContext"; // Add this import

function AgentRegister() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { updateAgent } = useContext(AgentContext); // Get updateAgent function
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    const formData = new FormData(e.target);
    const email = formData.get("email");
    const displayName = formData.get("displayName");
    const password = formData.get("password");
    const confirmedPassword = formData.get("confirmedPassword");

    if (password !== confirmedPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const res = await apiRequest.post("/agent-auth/register", {
        email,
        displayName,
        password,
        confirmedPassword
      });
      
      // Update agent context with the response data
      updateAgent(res.data.agent);
      
      // Store token in localStorage
      localStorage.setItem("agentToken", res.data.token);
      
      // Redirect to home page
      navigate("/agent");
    } catch (err) {
      setError(err.response?.data?.error || "Agent registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="registerPage">
      <div className="formContainer">
        <form onSubmit={handleSubmit}>
          <h1>Agent Registration</h1>
          <input 
            name="email" 
            type="email" 
            placeholder="Agent Email" 
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
            {isLoading ? "Registering..." : "Register as Agent"}
          </button>
          {error && <span className="error">{error}</span>}
          <Link to="/agent-login">Already have an agent account? Sign In</Link>
          <Link to="/register">Register as regular user</Link>
        </form>
      </div>
      <div className="imgContainer">
        <img src="/bg.png" alt="" />
      </div>
    </div>
  );
}

export default AgentRegister;