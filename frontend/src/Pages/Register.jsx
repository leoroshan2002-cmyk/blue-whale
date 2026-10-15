import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../Context/AuthContext";
import { renderGoogleButton } from "../utils/googleAuth";
import { buildApiUrl } from "../services/api";

import registerImage from "../assets/HomeHero.png";
import BlueWhaleLogo from "../assets/BlueWhaleLogoTransparent.png";
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
      <div className="grid min-h-screen bg-[#f6f4ef] lg:grid-cols-2">
           
        {/* LEFT SIDE */}
        <div className="relative hidden min-h-screen overflow-hidden lg:block">
            
           <div className="absolute left-10 top-10 z-20 rounded-2xl bg-white/95 px-4 py-2 shadow-lg">
             <img src={BlueWhaleLogo} alt="Blue Whale" className="h-14 w-auto object-contain" />
            </div>
          <img
            src={registerImage}
            alt="Blue Whale traditional saree collection"
            className="h-full min-h-screen w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#071d35]/85 via-[#071d35]/10 to-[#071d35]/15"></div>

          <div className="absolute bottom-16 left-12 max-w-xl text-white">
            <p className="text-sm uppercase tracking-[0.35em] text-[#e7c984]">
              BLUE WHALE · MADE FOR YOUR MOMENTS
            </p>

            <h1 className="mt-5 font-serif text-6xl leading-tight">
              Celebrate
              <br />
              every tradition.
            </h1>

            <p className="mt-5 max-w-sm text-lg text-white/85">
              Create your account and find timeless styles for every celebration.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE */}
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
              Join Blue Whale
            </h1>
            <p className="mb-8 mt-3 text-center text-xs uppercase tracking-[0.2em] text-[#6b7785] sm:mb-10 sm:text-sm">
              Create your account
            </p>

            {/* FORM FIELDS */}
            <input
              type="text"
              autoComplete="name"
              placeholder="Full Name"
              className="mb-5 w-full rounded-xl border border-[#cbd4df] px-5 py-4 outline-none transition focus:border-[#0c4b82] focus:ring-2 focus:ring-[#0c4b82]/20"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              readOnly={googleSignedIn}
            />

            <input
              type="email"
              autoComplete="email"
              placeholder="Email"
              className="mb-5 w-full rounded-xl border border-[#cbd4df] px-5 py-4 outline-none transition focus:border-[#0c4b82] focus:ring-2 focus:ring-[#0c4b82]/20"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              readOnly={googleSignedIn}
            />
            {googleSignedIn && (
              <p className="mb-5 text-sm text-[#16734b]">
                Google account loaded. Complete registration by entering a new password and confirming it.
              </p>
            )}

            <input
              type="password"
              autoComplete="new-password"
              placeholder="Password"
              className="mb-5 w-full rounded-xl border border-[#cbd4df] px-5 py-4 outline-none transition focus:border-[#0c4b82] focus:ring-2 focus:ring-[#0c4b82]/20"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <input
              type="password"
              autoComplete="new-password"
              placeholder="Confirm Password"
              className="mb-6 w-full rounded-xl border border-[#cbd4df] px-5 py-4 outline-none transition focus:border-[#0c4b82] focus:ring-2 focus:ring-[#0c4b82]/20"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            {verificationStage && (
              <>
                <p className="mb-4 text-sm text-[#536171]">{verificationMessage}</p>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Enter verification code"
                  className="mb-5 w-full rounded-xl border border-[#cbd4df] px-5 py-4 outline-none transition focus:border-[#0c4b82] focus:ring-2 focus:ring-[#0c4b82]/20"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleVerifyCode}
                  className="mb-4 w-full rounded-xl bg-[#092440] py-4 uppercase tracking-[0.16em] text-white transition hover:bg-[#123d63]"
                >
                  Verify Email
                </button>
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="w-full rounded-xl bg-[#eaf0f5] py-4 uppercase tracking-[0.16em] text-[#092440] transition hover:bg-[#dce6ef]"
                >
                  Resend Code
                </button>
              </>
            )}

            {/* TERMS */}
            <div className="flex items-start gap-3 mb-6">
              <input type="checkbox" required className="mt-1" />
              <p className="text-sm text-[#687482]">
                I agree to the{" "}
                <Link to="/terms-of-service" className="mx-1 underline underline-offset-4">
                  Terms & Conditions
                </Link>
                and
                <Link to="/privacy-policy" className="ml-1 underline underline-offset-4">
                  Privacy Policy
                </Link>
              </p>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              className="w-full rounded-xl bg-[#092440] py-4 uppercase tracking-[0.16em] text-white transition hover:bg-[#123d63]"
            >
              {googleAccountLoaded ? 'Finish Registration' : 'Create Account'}
            </button>
            <br />

            {googleAccountLoaded ? (
              <div className="mt-4 text-center text-sm text-[#687482]">
                Google account loaded. Enter a new password to finish registration.
              </div>
            ) : (
              <div className="mt-4 w-full">
                <div ref={googleButtonRef} className="w-full flex justify-center" />
              </div>
            )}

            <p className="mt-2 text-center text-[#687482]">
              Already have an account?
              <Link to="/login" className="ml-2 font-semibold text-[#174c79] hover:underline">
                Sign In
              </Link>
            </p>
            
          </motion.form>
        </div>
      </div>
    </div>
  );
}