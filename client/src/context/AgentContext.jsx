import { createContext, useState, useEffect } from "react";

export const AgentContext = createContext();

export const AgentContextProvider = ({ children }) => {  
  const [currentAgent, setCurrentAgent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize agent from localStorage on app load
  useEffect(() => {
    const initializeAgent = async () => {
      try {
        const token = localStorage.getItem("agentToken");
        
        if (token) {
          // Verify token and get agent data
          // In a real app, you might need to validate with the server
          const agentData = JSON.parse(localStorage.getItem("agentData"));
          setCurrentAgent(agentData);
        }
      } catch (error) {
        console.error("Agent initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAgent();
  }, []);
  
  // Update agent data
  const updateAgent = (agentData) => {
    localStorage.setItem("agentData", JSON.stringify(agentData));
    setCurrentAgent(agentData);
  };
  
  // Clear agent data
  const clearAgent = () => {
    localStorage.removeItem("agentToken");
    localStorage.removeItem("agentData");
    setCurrentAgent(null);
    window.location.href = "/";
  };
  
  return (
    <AgentContext.Provider
      value={{
        currentAgent,
        updateAgent,
        clearAgent,
        isLoading
      }}
    >
      {children}
    </AgentContext.Provider>
  );
};