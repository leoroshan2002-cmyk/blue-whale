import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { useCart } from "../Context/CartContext";
import { useWishlist } from "../Context/WhislistContext";
import { consumePendingAuthAction } from "../utils/authActionUtils";
import { renderGoogleButton } from "../utils/googleAuth";
import { buildApiUrl } from "../services/api";
import { motion } from "framer-motion";
import loginImage from "../assets/login.jpg";
import Logotransparent from "../assets/HaierahLogoTransparent.png";
export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, updateUser, user, isAuthReady } = useAuth();
  const googleButtonRef = useRef(null);
  const { addToCart } = useCart();
  const { toggleWishlist } = useWishlist();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!isAuthReady || !user) return;

    const fallbackDestination = location.state?.from?.pathname || "/";
    const destination = fallbackDestination === "/login" || fallbackDestination === "/register" ? "/" : fallbackDestination;
    if (user.role === "admin") {
      navigate("/admin", { replace: true });
    } else {
      navigate(destination, { replace: true });
    }
  }, [isAuthReady, user, location.state, navigate]);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId || !googleButtonRef.current) return;

    renderGoogleButton({
      clientId,
      container: googleButtonRef.current,
      onSuccess: async (credential) => {
        const result = await fetch(buildApiUrl('/api/auth/google'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ credential, createIfMissing: true }),
        });

        const contentType = result.headers.get('content-type') || '';
        let data;

        if (contentType.includes('application/json')) {
          data = await result.json();
        } else {
          const text = await result.text();
          throw new Error(text || 'Google sign-in failed.');
        }

        if (!result.ok) {
          if (result.status === 409) {
            alert(data.message || 'Google account not registered. Please register first.');
            navigate('/register', { replace: true });
            return;
          }

          alert(data.message || 'Google sign-in failed.');
          return;
        }

        const meResponse = await fetch(buildApiUrl('/api/auth/me'), {
          method: 'GET',
          credentials: 'include',
          headers: { Accept: 'application/json' },
        });

        const meData = meResponse.ok ? await meResponse.json() : null;
        const nextUser = meData?.user || data.user;
        updateUser(nextUser);
        localStorage.setItem('user', JSON.stringify(nextUser));

        const destination = location.state?.from?.pathname || '/';
        if (nextUser?.role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate(destination === '/login' || destination === '/register' ? '/' : destination, { replace: true });
        }
      },
      onError: (message) => {
        alert(message || 'Google sign-in failed.');
      },
    });
  }, [location.state, navigate, updateUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      alert('Please enter both email and password');
      return;
    }

    const result = await login(email, password);

    if (result.success) {

      const pendingAction = consumePendingAuthAction();

      if (pendingAction) {
        switch (pendingAction.actionType) {
          case "addToCart":
            addToCart(pendingAction.payload);
            break;
          case "toggleWishlist":
            toggleWishlist(pendingAction.payload);
            break;
          default:
            break;
        }
      }

      if (result.user.role === "admin") {
        navigate("/admin", { replace: true });
        return;
      }

      const redirectTarget = pendingAction?.from || location.state?.from?.pathname || "/";
      const destination = redirectTarget === "/login" || redirectTarget === "/register" ? "/" : redirectTarget;

      navigate(destination, { replace: true });
    } else {
      alert(result.message || "Invalid email or password");
    }
  };

  return (
  <div className="min-h-[100dvh] grid lg:grid-cols-2 bg-gradient-to-r from-black via-gray-900 to-black relative">
        
      
      {/* TOP RIGHT */}
      {/* <div className="absolute top-10 right-10 z-50 text-sm">
         <div className="absolute top-8 left-8 z-50">
    <PageBack />
  </div>
        <span className="text-gray-600">New customer?</span>

        <Link
          to="/register"
          className="ml-2 font-semibold hover:underline"
        >
          Create account
        </Link>
      </div> */}

      {/* LEFT SIDE IMAGE */}
      <div className="relative hidden lg:block">
        <div className="absolute top-8 left-8 z-20">
           <img src={Logotransparent} alt="HAIERAH Logo" className="h-16 w-auto object-contain"/>
        </div>
        <img
          src={loginImage}
          alt="HAIERAH Fashion"
          className="w-full h-screen object-cover"
        />
        <div className="absolute inset-0 bg-black/20"></div>

        <div className="absolute bottom-16 left-12 text-white">
          <p className="uppercase tracking-[6px] text-sm">
            NEW SEASON
          </p>

          <h1 className="font-serif text-6xl leading-tight mt-5">
            Luxury
            <br />
            Redefined.
          </h1>

          <p className="mt-5 text-lg max-w-sm">
            Discover timeless fashion designed for modern elegance.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE FORM */}
      <div className="flex min-w-0 items-center justify-center px-4 py-6 sm:px-8 sm:py-10 bg-white">

        <motion.form
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          onSubmit={handleSubmit}
          className="w-full max-w-md rounded-2xl sm:rounded-3xl border border-white/30 bg-white/70 p-6 shadow-2xl backdrop-blur-2xl sm:p-10 md:p-12"
         >
          <h1 className="text-center font-serif text-4xl text-black sm:text-5xl">
            HAIERAH
          </h1>

          <p className="mt-3 mb-8 text-center text-xs uppercase tracking-[2px] text-gray-500 sm:mb-10 sm:text-base sm:tracking-[4px]">
            Welcome Back
          </p>

          {/* EMAIL */}
          <input
            type="email"
            autoComplete="email"
            placeholder="Email"
            className="mb-4 w-full rounded-xl border border-gray-300 px-4 py-3.5 outline-none focus:ring-2 focus:ring-black sm:mb-5 sm:px-5 sm:py-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* PASSWORD */}
          <input
            type="password"
            autoComplete="current-password"
            placeholder="Password"
            className="mb-3 w-full rounded-xl border border-gray-300 px-4 py-3.5 outline-none focus:ring-2 focus:ring-black sm:px-5 sm:py-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* FORGOT PASSWORD */}
          <div className="text-right mb-6">
            <Link
              to="/forgot-password"
              className="text-sm underline text-gray-600 hover:text-black"
            >
              Forgot Password?
            </Link>
          </div>

          {/* SIGN IN BUTTON */}
          <button
            type="submit"
            className="w-full bg-black text-white py-4 rounded-xl uppercase tracking-widest hover:bg-gray-800 transition"
          >
            Sign In
          </button>

          <div className="mt-4 w-full max-w-full overflow-hidden">
            <div ref={googleButtonRef} className="flex w-full justify-center" />
          </div>

         
            
          {/* REGISTER LINK */}
          <p className="mt-6 text-center text-sm text-gray-600 sm:mt-8 sm:text-base">
            Don't have an account?
            <Link
              to="/register"
              className="ml-1 font-semibold text-black hover:underline sm:ml-2"
            >
              Register
            </Link>
          </p>

        </motion.form>

      </div>

    </div>
  );
}