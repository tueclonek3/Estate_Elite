import HomePage from "./routes/homePage/homePage";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ListPage from "./routes/listPage/listPage";
import { Layout, RequireAuth } from "./routes/layout/layout";
import SinglePage from "./routes/singlePage/singlePage";
import ProfilePage from "./routes/profilePage/profilePage";
import Login from "./routes/login/login";
import Register from "./routes/register/register";
import ProfileUpdatePage from "./routes/profileUpdatePage/profileUpdatePage";
import NewPostPage from "./routes/newPostPage/newPostPage";
import EditPostPage from "./routes/editPostPage/editPostPage"; 
import { listPageLoader, profilePageLoader, singlePageLoader } from "./lib/loaders";
import AgentLayout from "./routes/agentLayout/AgentLayout";
import AgentPage from "./routes/agentPage/agentPage";
import AgentLogin from "./routes/agentLogin/agentLogin";
import AgentRegister from "./routes/agentRegister/agentRegister";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          path: "/",
          element: <HomePage />,
        },
        {
          path: "/list",
          element: <ListPage />,
          loader: listPageLoader,
        },
        {
          path: "/:id",
          element: <SinglePage />,
          loader: singlePageLoader,
        },
        {
          path: "/login",
          element: <Login />,
        },
        {
          path: "/register",
          element: <Register />,
        },
        {
          path: "/agent-login",
          element: <AgentLogin />,
        },
        {
          path: "/agent-register",
          element: <AgentRegister />,
        },
        {
          path: "/agent",
          element: <AgentPage />
        },
      ],
    },
    {
      path: "/",
      element: <RequireAuth />,
      children: [
        {
          path: "/profile",
          element: <ProfilePage />,
          loader: profilePageLoader
        },
        {
          path: "/profile/update",
          element: <ProfileUpdatePage />,
        },
        {
          path: "/add",
          element: <NewPostPage />,
        },
        // NEW EDIT POST ROUTE
        {
          path: "/edit/:id",
          element: <EditPostPage />,
          loader: singlePageLoader // Reuse the single page loader to get post data
        },
      ],
    },
    {
      path: "/agent",
      element: <AgentLayout />,
      children: [
        { index: true, element: <AgentPage /> },
        // Add more agent routes here if needed
      ]
    }
  ]);

  return <RouterProvider router={router} />;
}

export default App;