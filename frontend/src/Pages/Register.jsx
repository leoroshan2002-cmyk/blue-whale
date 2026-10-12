import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../Context/AuthContext";
import { renderGoogleButton } from "../utils/googleAuth";
import { buildApiUrl } from "../services/api";

import registerImage from "../assets/register.jpg";
import Logotransparent from "../assets/HaierahLogoTransparent.png";

import PageBack from "../Components/CommonDetails/PageBack";
export default function Register() {
  const navigate = useNavigate();
  const { user, register, updateUser, isAuthReady } = useAuth();
  const googleButtonRef = useRef(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [googleCredential, setGoogleCredential] = useState(null);
  const [googleSignedIn, setGoogleSignedIn] = useState(false);
  const [googleAccountLoaded, setGoogleAccountLoaded] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationStage, setVerificationStage] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('');

  useEffect(() => {
    if (!isAuthReady || !user) return;
    navigate('/', { replace: true });
  }, [isAuthReady, user, navigate]);

  const decodeJwtPayload = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (googleCredential) {
      const googlePayload = decodeJwtPayload(googleCredential);
      if (googlePayload?.email_verified !== true) {
        alert('Google account email is not verified. Please use a verified Google account.');
        return;
      }
    }

    const allowedEmails = import.meta.env.VITE_AUTHORIZED_EMAILS?.split(',').map((item) => item.trim().toLowerCase()).filter(Boolean) || [];
    const allowedDomains = import.meta.env.VITE_AUTHORIZED_EMAIL_DOMAINS?.split(',').map((item) => item.trim().toLowerCase()).filter(Boolean) || [];
    const trimmedEmail = email.trim().toLowerCase();
    const isAuthorizedEmail = () => {
      if (!trimmedEmail) return false;
      if (allowedEmails.length && allowedEmails.includes(trimmedEmail)) return true;
      if (
        allowedDomains.length &&
        allowedDomains.some((domain) => trimmedEmail.endsWith(`@${domain}`))
      ) return true;
      return allowedEmails.length === 0 && allowedDomains.length === 0;
    };

    if (!isAuthorizedEmail()) {
      alert('Email is not authorized for registration. Use an approved email address.');
      return;
    }

    const result = await register(name, email, password, confirmPassword);
    if (!result.success) {
      alert(result.message || "Email already exists!");
      return;
    }

    if (result.emailVerificationSent) {
      setVerificationStage(true);
      setVerificationMessage('A 6-digit verification code was sent to your email. Enter it below to verify your account.');
      return;
    }

    alert("Account created successfully!");
    navigate("/login");
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      alert('Please enter the verification code.');
      return;
    }

    const response = await fetch(buildApiUrl('/api/auth/email/verify/confirm'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, code: verificationCode.trim() }),
    });

    const data = await response.json();
    if (!response.ok) {
      alert(data.message || 'Verification failed.');
      return;
    }

    alert(data.message || 'Email verified successfully. You can now log in.');
    navigate('/login');
  };

  const handleResendCode = async () => {
    const response = await fetch(buildApiUrl('/api/auth/email/verify/request'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    if (!response.ok) {
      alert(data.message || 'Could not resend verification code.');
      return;
    }

    alert(data.message || 'Verification code resent to your email.');
  };

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId || !googleButtonRef.current) return;

    renderGoogleButton({
      clientId,
      container: googleButtonRef.current,
      onSuccess: async (credential) => {
        try {
          const result = await fetch(buildApiUrl('/api/auth/google'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ credential, createIfMissing: true }),
          });

          const contentType = result.headers.get('content-type') || '';
          const data = contentType.includes('application/json') ? await result.json() : {};

          if (!result.ok) {
            alert(data.message || 'Google sign-up failed.');
            return;
          }

          const nextUser = data?.user || null;
          if (nextUser) {
            updateUser(nextUser);
            localStorage.setItem('user', JSON.stringify(nextUser));
          }
          navigate('/', { replace: true });
        } catch (error) {
          alert(error?.message || 'Google sign-up failed.');
        }
      },
      onError: (message) => {
        alert(message || 'Google sign-up failed.');
      },
    });
  }, [navigate, updateUser]);

  if (!isAuthReady) {
    return <div className="min-h-screen flex items-center justify-center bg-[#f8f7f5] text-gray-500">Loading…</div>;
  }

  return (
    <div className="min-h-screen relative">
      

      {/* TOP RIGHT LINK */}
      {/* <div className="absolute top-10 right-10 z-50 text-sm">
        <span className="text-gray-600">Already have an account?</span>

        <Link to="/login" className="ml-2 font-semibold hover:underline">
          Sign In
        </Link>
      </div> */}

      {/* MAIN GRID */}
      <div className="min-h-screen grid lg:grid-cols-2 bg-[#F8F7F5]">
           
        {/* LEFT SIDE */}
        <div className="relative hidden lg:block">
            
           <div className="absolute top-8 left-8 z-20">
             <img src={Logotransparent} alt="HAIERAH Logo" className="h-16 w-auto object-contain" />
            </div>
          <img
            src={registerImage}
            alt="HAIERAH Register"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20"></div>

          <div className="absolute bottom-16 left-12 text-white">
            <p className="uppercase tracking-[6px] text-sm">
              JOIN HAIERAH
            </p>

            <h1 className="font-serif text-6xl leading-tight mt-5">
              Create
              <br />
              Your Style.
            </h1>

            <p className="mt-5 text-lg max-w-sm">
              Join HAIERAH and discover premium fashion made for every occasion.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center justify-center px-8 py-10">
            
      
          <motion.form
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl shadow-2xl p-12 w-full max-w-md"
          >

            <h1 className="text-5xl font-serif text-center text-black">
              HAIERAH
            </h1>

            <p className="text-center text-gray-500 uppercase tracking-[4px] mt-3 mb-10">
              Create Your Account
            </p>

            {/* FORM FIELDS */}
            <input
              type="text"
              autoComplete="name"
              placeholder="Full Name"
              className="w-full border border-gray-300 rounded-xl px-5 py-4 mb-5 outline-none focus:ring-2 focus:ring-black"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              readOnly={googleSignedIn}
            />

            <input
              type="email"
              autoComplete="email"
              placeholder="Email"
              className="w-full border border-gray-300 rounded-xl px-5 py-4 mb-5 outline-none focus:ring-2 focus:ring-black"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              readOnly={googleSignedIn}
            />
            {googleSignedIn && (
              <p className="text-sm text-green-600 mb-5">
                Google account loaded. Complete registration by entering a new password and confirming it.
              </p>
            )}

            <input
              type="password"
              autoComplete="new-password"
              placeholder="Password"
              className="w-full border border-gray-300 rounded-xl px-5 py-4 mb-5 outline-none focus:ring-2 focus:ring-black"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <input
              type="password"
              autoComplete="new-password"
              placeholder="Confirm Password"
              className="w-full border border-gray-300 rounded-xl px-5 py-4 mb-6 outline-none focus:ring-2 focus:ring-black"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            {verificationStage && (
              <>
                <p className="text-sm text-gray-700 mb-4">{verificationMessage}</p>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Enter verification code"
                  className="w-full border border-gray-300 rounded-xl px-5 py-4 mb-5 outline-none focus:ring-2 focus:ring-black"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleVerifyCode}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl uppercase tracking-widest hover:bg-blue-700 transition mb-4"
                >
                  Verify Email
                </button>
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="w-full bg-gray-100 text-black py-4 rounded-xl uppercase tracking-widest hover:bg-gray-200 transition"
                >
                  Resend Code
                </button>
              </>
            )}

            {/* TERMS */}
            <div className="flex items-start gap-3 mb-6">
              <input type="checkbox" required className="mt-1" />
              <p className="text-sm text-gray-600">
                I agree to the{" "}
                <Link to="/terms" className="underline mx-1">
                  Terms & Conditions
                </Link>
                and
                <Link to="/privacy" className="underline ml-1">
                  Privacy Policy
                </Link>
              </p>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              className="w-full bg-black text-white py-4 rounded-xl uppercase tracking-widest hover:bg-gray-800 transition"
            >
              {googleAccountLoaded ? 'Finish Registration' : 'Create Account'}
            </button>
            <br />

            {googleAccountLoaded ? (
              <div className="mt-4 text-center text-sm text-gray-600">
                Google account loaded. Enter a new password to finish registration.
              </div>
            ) : (
              <div className="mt-4 w-full">
                <div ref={googleButtonRef} className="w-full flex justify-center" />
              </div>
            )}

            <p className="text-center mt-2 text-gray-600">
              Already have an account?
              <Link to="/login" className="ml-2 font-semibold hover:underline">
                Sign In
              </Link>
            </p>
            
          </motion.form>
        </div>
      </div>
    </div>
  );
}