import axios from "axios";

const apiRequest = axios.create({
  baseURL: "http://localhost:8800/api",
  withCredentials: true,
});

// Request interceptor
apiRequest.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Response interceptor
apiRequest.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear user data
      localStorage.removeItem("user");
      // Redirect to login
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Add this to the request interceptor
apiRequest.interceptors.request.use((config) => {
  // Add agent token if available
  const agentToken = localStorage.getItem("agentToken");
  if (agentToken) {
    config.headers.Authorization = `Bearer ${agentToken}`;
  }
  
  // Add user token if available
  const userToken = localStorage.getItem("userToken");
  if (userToken) {
    config.headers.Authorization = `Bearer ${userToken}`;
  }
  
  return config;
});

export default apiRequest;
