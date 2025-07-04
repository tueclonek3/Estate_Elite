import { useContext } from "react";
import { AgentContext } from "../../context/AgentContext";
import "./agentPage.scss";

function AgentPage() {
  const { currentAgent } = useContext(AgentContext);
  
  return (
    <div className="agentPage">
      <div className="welcomeContainer">
        <div className="welcomeHeader">
          <h1>Welcome, Agent {currentAgent?.displayName}!</h1>
          <p>You now have access to exclusive agent tools and features</p>
        </div>
        
        <div className="dashboard">
          <div className="dashboardCard">
            <div className="cardIcon">
              <img src="/house.png" alt="Properties" />
            </div>
            <h3>Property Management</h3>
            <p>Create, edit, and track your property listings</p>
            <button className="cardButton">Manage Properties</button>
          </div>
          
          <div className="dashboardCard">
            <div className="cardIcon">
              <img src="/messenger.png" alt="Messages" />
            </div>
            <h3>Client Communications</h3>
            <p>Connect with potential buyers and renters</p>
            <button className="cardButton">View Messages</button>
          </div>
          
          <div className="dashboardCard">
            <div className="cardIcon">
              <img src="/analytics.png" alt="Analytics" />
            </div>
            <h3>Market Analytics</h3>
            <p>Access exclusive market data and insights</p>
            <button className="cardButton">View Analytics</button>
          </div>
        </div>
        
        <div className="quickStats">
          <div className="statCard">
            <div className="statValue">12</div>
            <div className="statLabel">Active Listings</div>
          </div>
          <div className="statCard">
            <div className="statValue">24</div>
            <div className="statLabel">New Messages</div>
          </div>
          <div className="statCard">
            <div className="statValue">8</div>
            <div className="statLabel">Upcoming Viewings</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AgentPage;