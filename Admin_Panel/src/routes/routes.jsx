import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "../pages/ProtectedRoute/ProtectedRoute";
import Category from "../pages/Category/Category";
import Cities from "../pages/Cities/Cities";
import Attractions from "../pages/Attractions/Attractions";
import Dashboard from "../pages/Dashboard/Dashboard";
import User from "../pages/User/User";
import Login from "../pages/Login/Login";
import Review from "../pages/Reviews/Review";
import Unauthorized from "../pages/Unauthorized/Unauthorized";

const publicRoutes = createBrowserRouter([
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "*",
    element: <Unauthorized />
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/Category",
    element: (
      <ProtectedRoute>
        <Category />
      </ProtectedRoute>
    ),
  },
  {
    path: "/Reviews",
    element: (
      <ProtectedRoute>
        <Review />
      </ProtectedRoute>
    ),
  },
  {
    path: "/Cities",
    element: (
      <ProtectedRoute>
        <Cities />
      </ProtectedRoute>
    ),
  },
  {
    path: "/Attractions",
    element: (
      <ProtectedRoute>
        <Attractions />
      </ProtectedRoute>
    ),
  },
  {
    path: "/users",
    element: (
      <ProtectedRoute>
        <User />
      </ProtectedRoute>
    ),
  },
]);


export default publicRoutes;