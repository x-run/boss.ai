import { createBrowserRouter, Navigate } from "react-router";
import Layout from "./Layout";
import WorkerLayout from "./layouts/WorkerLayout";
import Landing from "./pages/Landing";
import BriefNew from "./pages/BriefNew";
import WorkerRegister from "./pages/WorkerRegister";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import Workers from "./pages/Workers";
import WorkerNew from "./pages/WorkerNew";
import WorkerDetail from "./pages/WorkerDetail";
import Login from "./pages/Login";
import WorkerBrowse from "./pages/WorkerBrowse";
import Clients from "./pages/Clients";
import Editors from "./pages/Editors";
import Dashboard from "./pages/Dashboard";
import Verification from "./pages/Verification";
import AppProfile from "./pages/AppProfile";

export const router = createBrowserRouter([
  { path: "/", element: <Landing /> },
  {
    element: <WorkerLayout />,
    children: [
      { path: "/app/dashboard", element: <Dashboard /> },
      { path: "/app/verification", element: <Verification /> },
      { path: "/app/profile", element: <AppProfile /> },
    ],
  },
  {
    element: <Layout />,
    children: [
      { path: "/brief/new", element: <BriefNew /> },
      { path: "/workers/register", element: <WorkerRegister /> },
      { path: "/workers", element: <Workers /> },
      { path: "/workers/new", element: <WorkerNew /> },
      { path: "/workers/:id", element: <WorkerDetail /> },
      { path: "/browse", element: <WorkerBrowse /> },
      { path: "/clients", element: <Clients /> },
      { path: "/editors", element: <Editors /> },
      { path: "/jobs", element: <Jobs /> },
      { path: "/jobs/:id", element: <JobDetail /> },
      { path: "/login", element: <Login /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
