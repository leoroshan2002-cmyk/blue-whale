import { Navigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";

export default function AdminProtectedRoute({ children }) {
    const { user, isAuthReady } = useAuth();

    if (isAuthReady === false) {
        return null;
    }

    if (!user || user.role !== "admin") {
        return <Navigate to="/login" replace />;
    }

    return children;
}