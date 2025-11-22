import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles, userRole, children }) => {
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/not-authorized" replace />;
  }
  return children;
};

export default ProtectedRoute;