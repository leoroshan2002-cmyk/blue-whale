import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const auth = useAuth();
  const location = useLocation();
  const user = auth?.user;

  if (auth?.isAuthReady === false) {
    return (
      <div className="min-h-screen bg-[#f8f7f5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-4 border-gray-300 border-t-[#0d2746] rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ?? <Outlet />;
};

export default ProtectedRoute;