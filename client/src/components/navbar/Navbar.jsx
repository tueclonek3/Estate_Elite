import { useContext, useState, useEffect } from "react";
import "./navbar.scss";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { AgentContext } from "../../context/AgentContext";
import { useNotificationStore } from "../../lib/notificationStore";
import apiRequest from "../../lib/apiRequest";

function Navbar() {
  const [open, setOpen] = useState(false);
  const { currentUser, updateUser, clearUser } = useContext(AuthContext);
  const { currentAgent, clearAgent } = useContext(AgentContext);
  const { number, fetch, reset } = useNotificationStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetch();
    } else {
      reset();
    }
  }, [currentUser, fetch, reset]);

  const handleUserLogout = async () => {
    try {
      await apiRequest.post("/auth/logout");
      clearUser();
      reset();
      setOpen(false);
      navigate("/");
    } catch (err) {
      console.log(err);
    }
  };

  const handleAgentLogout = async () => {
    try {
      await apiRequest.post("/agent-auth/logout");
      clearAgent();
      setOpen(false);
      navigate("/");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <nav>
      <div className="left">
        <Link to="/" className="logo">
          <img src="/logo.png" alt="" />
          <span>EstateElite</span>
        </Link>
        <Link to="/">Home</Link>
        <Link to="/">About</Link>
        <Link to="/">Contact</Link>
        <Link to="/">Agents</Link>
      </div>
      
      <div className="right">
        {currentAgent ? (
          <div className="agentIndicator" onClick={() => navigate("/agent")}>
            <img 
              src={currentAgent.avatar || "/noavatar.jpg"} 
              alt="Agent Avatar" 
              className="agentAvatar"
            />
            <span>Agent: {currentAgent.displayName}</span>
            <button onClick={handleAgentLogout} className="agentLogout">
              Logout
            </button>
          </div>
        ) : currentUser ? (
          <div className="user">
            <img src={currentUser.avatar || "/noavatar.jpg"} alt="" />
            <span>{currentUser.displayName}</span>
            <Link to="/profile" className="profile">
              {number > 0 && <div className="notification">{number}</div>}
              <span>Profile</span>
            </Link>
          </div>
        ) : (
          <>
            <Link to="/login">Sign in</Link>
            <Link to="/register" className="register">
              Sign up
            </Link>
          </>
        )}
        
        <div className="menuIcon">
          <img
            src="/menu.png"
            alt=""
            onClick={() => setOpen(!open)}
          />
        </div>
        
        <div className={open ? "menu active" : "menu"}>
          <Link to="/" onClick={() => setOpen(false)}>
            Home
          </Link>
          <Link to="/" onClick={() => setOpen(false)}>
            About
          </Link>
          <Link to="/" onClick={() => setOpen(false)}>
            Contact
          </Link>
          <Link to="/" onClick={() => setOpen(false)}>
            Agents
          </Link>
          
          {currentAgent ? (
            <>
              <Link to="/agent" onClick={() => setOpen(false)}>
                Agent Dashboard
              </Link>
              <a href="#" onClick={handleAgentLogout}>
                Agent Logout
              </a>
            </>
          ) : currentUser ? (
            <>
              <Link to="/profile" onClick={() => setOpen(false)}>
                Profile
              </Link>
              <a href="#" onClick={handleUserLogout}>
                Logout
              </a>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setOpen(false)}>
                Sign in
              </Link>
              <Link to="/register" onClick={() => setOpen(false)}>
                Sign up
              </Link>
              <div className="separator">Agent Options</div>
              <Link to="/agent-login" onClick={() => setOpen(false)}>
                Agent Sign In
              </Link>
              <Link to="/agent-register" onClick={() => setOpen(false)}>
                Become Agent
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;