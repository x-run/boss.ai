import { createBrowserRouter, Navigate } from "react-router";
import Layout from "./Layout";
import Landing from "./pages/Landing";
import BriefNew from "./pages/BriefNew";
import WorkerRegister from "./pages/WorkerRegister";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import Workers from "./pages/Workers";
import WorkerNew from "./pages/WorkerNew";
import WorkerDetail from "./pages/WorkerDetail";
import Login from "./pages/Login";

export const router = createBrowserRouter([
  { path: "/", element: <Landing /> },
  {
    element: <Layout />,
    children: [
      { path: "/brief/new", element: <BriefNew /> },
      { path: "/workers/register", element: <WorkerRegister /> },
      { path: "/workers", element: <Workers /> },
      { path: "/workers/new", element: <WorkerNew /> },
      { path: "/workers/:id", element: <WorkerDetail /> },
      { path: "/jobs", element: <Jobs /> },
      { path: "/jobs/:id", element: <JobDetail /> },
      { path: "/login", element: <Login /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
