import { useContext } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { AgentContext } from "../../context/AgentContext";
import apiRequest from "../../lib/apiRequest";
import "./agentLayout.scss";

function AgentLayout() {
  const { currentAgent, clearAgent } = useContext(AgentContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await apiRequest.post("/agent-auth/logout");
      clearAgent();
      reset();
      setOpen(false);
      navigate("/");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="agentLayout">
      <header className="agentHeader">
        <div className="container">
          <Link to="/" className="logo">
            <img src="/logo.png" alt="EstateElite" />
            <span>EstateElite</span>
          </Link>
          
          <nav>
            <Link to="/">Home</Link>
            <div className="agentProfile" onClick={() => navigate("/agent")}>
              <img 
                src={currentAgent?.avatar || "/noavatar.jpg"} 
                alt={currentAgent?.displayName} 
              />
              <span>{currentAgent?.displayName}</span>
              <button onClick={handleLogout} className="agentLogout">
              Logout
            </button>
            </div>
          </nav>
        </div>
      </header>
      
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default AgentLayout;