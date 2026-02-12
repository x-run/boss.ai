import { createBrowserRouter, Navigate } from "react-router";
import Layout from "./Layout";
import Landing from "./pages/Landing";
import BriefNew from "./pages/BriefNew";
import WorkerRegister from "./pages/WorkerRegister";
import JobsList from "./pages/JobsList";

export const router = createBrowserRouter([
  { path: "/", element: <Landing /> },
  {
    element: <Layout />,
    children: [
      { path: "/brief/new", element: <BriefNew /> },
      { path: "/workers/register", element: <WorkerRegister /> },
      { path: "/jobs", element: <JobsList /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
