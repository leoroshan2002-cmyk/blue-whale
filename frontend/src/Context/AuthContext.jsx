import { createContext, useContext, useState, useEffect } from "react";
import { buildApiUrl } from "../services/api";

export const AuthContext = createContext();

const sanitizeUser = (user) => {
  if (!user) return null;

  return {
    id: user.id || user._id || user.userId || "",
    name: user.name || "",
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    email: user.email || "",
    avatar: user.avatar || "",
    role: user.role || "user",
    phone: user.phone || "",
    gender: user.gender || "",
    birthday: user.birthday || "",
    address: user.address || "",
    city: user.city || "",
    state: user.state || "",
    zip: user.zip || "",
  };
};

const hasActiveAuthSession = () => {
  if (typeof window === "undefined") return false;

  const hasStoredUser = Boolean(localStorage.getItem("user"));
  const hasTokenCookie = document.cookie
    .split("; ")
    .some((cookie) => cookie.startsWith("token="));

  return hasStoredUser || hasTokenCookie;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const restoreSession = async () => {
      if (typeof window === "undefined") {
        setIsAuthReady(true);
        return;
      }

      if (!hasActiveAuthSession()) {
        setUser(null);
        localStorage.removeItem("user");
        setIsAuthReady(true);
        return;
      }

      try {
        const response = await fetch(buildApiUrl("/api/auth/me"), {
          method: "GET",
          credentials: "include",
          headers: { Accept: "application/json" },
        });

        if (response.status === 401 || response.status === 403) {
          setUser(null);
          localStorage.removeItem("user");
          return;
        }

        if (!response.ok) {
          setUser(null);
          localStorage.removeItem("user");
          return;
        }

        const data = await response.json();
        const nextUser = sanitizeUser(data?.user);
        setUser(nextUser);
        if (nextUser) {
          localStorage.setItem("user", JSON.stringify(nextUser));
        } else {
          localStorage.removeItem("user");
        }
      } catch {
        setUser(null);
        localStorage.removeItem("user");
      } finally {
        setIsAuthReady(true);
      }
    };

    restoreSession();
  }, []);

  const loginUrl = buildApiUrl("/api/auth/login");
  const registerUrl = buildApiUrl("/api/auth/register");

  const login = async (email, password) => {
    try {
      const response = await fetch(loginUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || "Login failed",
        };
      }

      let loggedInUser = sanitizeUser(data?.user);

      if (!loggedInUser) {
        const meResponse = await fetch(buildApiUrl("/api/auth/me"), {
          method: "GET",
          credentials: "include",
          headers: { Accept: "application/json" },
        });

        const meData = meResponse.ok ? await meResponse.json() : null;
        loggedInUser = sanitizeUser(meData?.user);
      }

      setUser(loggedInUser);
      if (loggedInUser) {
        localStorage.setItem("user", JSON.stringify(loggedInUser));
      } else {
        localStorage.removeItem("user");
      }

      return {
        success: true,
        user: loggedInUser,
      };
    } catch {
      return {
        success: false,
        message: "Unable to reach authentication server. Please try again.",
      };
    }
  };

  const register = async (name, email, password, confirmPassword) => {
    try {
      const response = await fetch(registerUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ name, email, password, confirmPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || "Registration failed",
        };
      }

      return {
        success: true,
        user: data.user,
        emailVerificationSent: data.emailVerificationSent,
      };
    } catch {
      return {
        success: false,
        message: "Unable to reach authentication server. Please try again.",
      };
    }
  };

  const resendEmailVerification = async (email) => {
    try {
      const response = await fetch(buildApiUrl('/api/auth/email/verify/request'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) {
        return { success: false, message: data.message || 'Unable to resend verification code.' };
      }
      return { success: true, message: data.message || 'Verification code resent.' };
    } catch {
      return { success: false, message: 'Unable to reach authentication server. Please try again.' };
    }
  };

  const confirmEmailVerificationCode = async (email, code) => {
    try {
      const response = await fetch(buildApiUrl('/api/auth/email/verify/confirm'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, code }),
      });
      const data = await response.json();
      if (!response.ok) {
        return { success: false, message: data.message || 'Verification failed.' };
      }
      return { success: true, message: data.message || 'Email verified successfully.' };
    } catch {
      return { success: false, message: 'Unable to reach authentication server. Please try again.' };
    }
  };

  const updateUser = (updatedUser) => {
    const nextUser = sanitizeUser(updatedUser);
    setUser(nextUser);
    if (typeof window !== "undefined") {
      if (nextUser) {
        localStorage.setItem("user", JSON.stringify(nextUser));
      } else {
        localStorage.removeItem("user");
      }
    }
  };

  const logout = async () => {
    try {
      await fetch(buildApiUrl('/api/auth/logout'), {
        method: 'POST',
        credentials: 'include',
        headers: { Accept: 'application/json' },
      });
    } catch {
      // Ignore logout API failures and clear local auth state.
    }

    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("adminToken");
    sessionStorage.removeItem("adminToken");
    return { success: true };
  };

  return (
    <AuthContext.Provider value={{ user, isAuthReady, login, register, resendEmailVerification, confirmEmailVerificationCode, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);