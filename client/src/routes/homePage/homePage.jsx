import { useContext } from "react";
import SearchBar from "../../components/searchBar/SearchBar";
import "./homePage.scss";
import { AuthContext } from "../../context/AuthContext";
import { AgentContext } from "../../context/AgentContext"; // Add this import

function HomePage() {
  const { currentUser } = useContext(AuthContext);
  const { currentAgent } = useContext(AgentContext); // Get agent context
  
  // Determine if any user is logged in
  const isLoggedIn = currentUser || currentAgent;
  const displayName = currentUser?.displayName || currentAgent?.displayName;
  const isAgent = !!currentAgent;

  return (
    <div className="homePage">
      <div className="textContainer">
        <div className="wrapper">
          <h1 className="title">Find Real Estate & Get Your Dream Place</h1>
          
          {/* Show welcome message if logged in */}
          {isLoggedIn && (
            <div className="welcomeMessage" data-agent={isAgent}>
              <span className="icon">👋</span>
              Welcome back, {displayName}
              {isAgent && " (Agent)"}!
            </div>
          )}
          
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Eos explicabo 
            suscipit cum eius, iure est nulla animi consequatur facilis id pariatur 
            fugit quos laudantium temporibus dolor ea repellat provident impediti
          </p>
          
          <SearchBar />
          
          <div className="boxes">
            <div className="box">
              <h1>16+</h1>
              <h2>Years of Experience</h2>
            </div>
            <div className="box">
              <h1>200</h1>
              <h2>Award Gained</h2>
            </div>
            <div className="box">
              <h1>2000+</h1>
              <h2>Property Ready</h2>
            </div>
          </div>
        </div>
      </div>
      <div className="imgContainer">
        <img src="/bg.png" alt="" />
      </div>
    </div>
  );
}

export default HomePage;