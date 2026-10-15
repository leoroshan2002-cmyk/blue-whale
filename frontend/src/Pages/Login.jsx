import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { useCart } from "../Context/CartContext";
import { useWishlist } from "../Context/WhislistContext";
import { consumePendingAuthAction } from "../utils/authActionUtils";
import { renderGoogleButton } from "../utils/googleAuth";
import { buildApiUrl } from "../services/api";
import { motion } from "framer-motion";
import loginImage from "../assets/HomeHero.png";
import BlueWhaleLogo from "../assets/BlueWhaleLogoTransparent.png";
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

    const fromLocation = location.state?.from;
    const fallbackDestination = fromLocation?.pathname ? `${fromLocation.pathname}${fromLocation.search || ""}` : "/";
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
  <div className="relative grid min-h-[100dvh] bg-[#f6f4ef] lg:grid-cols-2">
        
      
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
      <div className="relative hidden min-h-[100dvh] overflow-hidden lg:block">
        <div className="absolute left-10 top-10 z-20 rounded-2xl bg-white/95 px-4 py-2 shadow-lg">
           <img src={BlueWhaleLogo} alt="Blue Whale" className="h-14 w-auto object-contain"/>
        </div>
        <img
          src={loginImage}
          alt="Blue Whale traditional saree collection"
          className="h-full min-h-[100dvh] w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#071d35]/85 via-[#071d35]/10 to-[#071d35]/15"></div>

        <div className="absolute bottom-16 left-12 max-w-xl text-white">
          <p className="text-sm uppercase tracking-[0.35em] text-[#e7c984]">
            BLUE WHALE · TRADITIONAL WEAR
          </p>

          <h1 className="mt-5 font-serif text-6xl leading-tight">
            Tradition,
            <br />
            beautifully worn.
          </h1>

          <p className="mt-5 max-w-sm text-lg text-white/85">
            Sarees for her. Dhotis for him. Discover pieces made for every celebration.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE FORM */}
      <div className="flex min-w-0 items-center justify-center px-4 py-8 sm:px-8 sm:py-10">

        <motion.form
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          onSubmit={handleSubmit}
          className="w-full max-w-md rounded-2xl border border-[#d9e0e8] bg-white p-6 shadow-[0_24px_70px_rgba(7,29,53,0.12)] sm:rounded-3xl sm:p-10 md:p-12"
         >
          <div className="mb-5 flex justify-center">
            <img src={BlueWhaleLogo} alt="Blue Whale" className="h-16 w-auto object-contain" />
          </div>

          <h1 className="text-center font-serif text-3xl text-[#092440] sm:text-4xl">
            Welcome back
          </h1>
          <p className="mb-8 mt-3 text-center text-xs uppercase tracking-[0.22em] text-[#6b7785] sm:mb-10 sm:text-sm">
            Sign in to your Blue Whale account
          </p>

          {/* EMAIL */}
          <input
            type="email"
            autoComplete="email"
            placeholder="Email"
            className="mb-4 w-full rounded-xl border border-[#cbd4df] px-4 py-3.5 outline-none transition focus:border-[#0c4b82] focus:ring-2 focus:ring-[#0c4b82]/20 sm:mb-5 sm:px-5 sm:py-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* PASSWORD */}
          <input
            type="password"
            autoComplete="current-password"
            placeholder="Password"
            className="mb-3 w-full rounded-xl border border-[#cbd4df] px-4 py-3.5 outline-none transition focus:border-[#0c4b82] focus:ring-2 focus:ring-[#0c4b82]/20 sm:px-5 sm:py-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* FORGOT PASSWORD */}
          <div className="text-right mb-6">
            <Link
              to="/forgot-password"
              className="text-sm text-[#174c79] underline underline-offset-4 hover:text-[#092440]"
            >
              Forgot Password?
            </Link>
          </div>

          {/* SIGN IN BUTTON */}
          <button
            type="submit"
            className="w-full rounded-xl bg-[#092440] py-4 uppercase tracking-[0.16em] text-white transition hover:bg-[#123d63]"
          >
            Sign In
          </button>

          <div className="mt-4 w-full max-w-full overflow-hidden">
            <div ref={googleButtonRef} className="flex w-full justify-center" />
          </div>

         
            
          {/* REGISTER LINK */}
          <p className="mt-6 text-center text-sm text-[#687482] sm:mt-8 sm:text-base">
            Don't have an account?
            <Link
              to="/register"
              className="ml-1 font-semibold text-[#174c79] hover:underline sm:ml-2"
            >
              Register
            </Link>
          </p>

        </motion.form>

      </div>

    </div>
  );
}