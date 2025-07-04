import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiRequest from "../../lib/apiRequest";
import "./agentLogin.scss";
import { AgentContext } from "../../context/AgentContext"; // Add this import

function AgentLogin() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { updateAgent } = useContext(AgentContext); // Get updateAgent function
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    const formData = new FormData(e.target);
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      const res = await apiRequest.post("/agent-auth/login", {
        email,
        password,
      });

      // Update agent context with the response data
      updateAgent(res.data.agent);
      
      // Store token in localStorage
      localStorage.setItem("agentToken", res.data.token);
      
      // Redirect to home page
      navigate("/agent");
    } catch (err) {
      setError(err.response?.data?.message || "Agent login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login">
      <div className="formContainer">
        <form onSubmit={handleSubmit}>
          <h1>Agent Sign In</h1>
          <input
            name="email"
            required
            type="email"
            placeholder="Agent Email"
          />
          <input
            name="password"
            type="password"
            required
            placeholder="Password"
          />
          <button disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
          {error && <span className="error">{error}</span>}
          <Link to="/agent-register">Create An Agent Account</Link>
          <Link to="/login">Sign in as regular user</Link>
        </form>
      </div>
      <div className="imgContainer">
        <img src="/bg.png" alt="" />
      </div>
    </div>
  );
}

export default AgentLogin;