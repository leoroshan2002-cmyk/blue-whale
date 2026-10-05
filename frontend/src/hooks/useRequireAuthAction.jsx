import { useAuth } from "../Context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { savePendingAuthAction } from "../utils/authActionUtils";

export const useRequireAuthAction = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const requireAuthAction = (actionType, payload) => {
    if (user) {
      return true;
    }

    savePendingAuthAction({
      actionType,
      payload,
      from: `${location.pathname}${location.search}`,
    });

    navigate("/login", { state: { from: location }, replace: true });
    return false;
  };

  return { requireAuthAction };
};
