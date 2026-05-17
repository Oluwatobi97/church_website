import { Navigate, Outlet, useLocation } from "react-router-dom";

/**
 * A reusable component to protect routes based on user roles.
 * @param {string[]} allowedRoles - Array of roles permitted to access the route.
 */
const ProtectedRoute = ({ allowedRoles }) => {
  const userRole = localStorage.getItem("userRole"); // In production, replace this with a secure Auth Context or JWT check
  const location = useLocation();

  // 1. If no role is found, the user is not logged in.
  if (!userRole) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. If the user's role is not in the allowed list, redirect to home/landing.
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  // 3. If authorized, render the child routes.
  return <Outlet />;
};

export default ProtectedRoute;
