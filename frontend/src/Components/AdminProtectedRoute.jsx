import { Navigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

const AdminProtectedRoute = ({ children }) => {
  const { user, isAuthReady } = useAuth();

  if (isAuthReady === false) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminProtectedRoute;