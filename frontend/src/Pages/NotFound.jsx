import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Compass,
  Home,
} from "lucide-react";
import PageBack from "../Components/CommonDetails/PageBack";

export default function NotFound() {
  return (
    <div className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-[#f8fafc]">
      
      {/* Background Decorations */}
      <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-[#c9a227]/10 blur-3xl" />
      <div className="absolute -right-32 bottom-10 h-96 w-96 rounded-full bg-[#0b1f3a]/10 blur-3xl" />

      {/* Grid Background */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(#0b1f3a 1px, transparent 1px), linear-gradient(90deg, #0b1f3a 1px, transparent 1px)",
          backgroundSize: "45px 45px",
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-80px)] max-w-7xl items-center justify-center px-6 py-16">
        <div className="w-full max-w-4xl text-center">

          {/* Back */}
          <div className="mb-10 flex justify-center">
            <PageBack />
          </div>

        

          {/* 404 */}
          <div className="relative">
            <h1 className="select-none text-[130px] font-black leading-none tracking-[-0.08em] text-[#0b1f3a] sm:text-[180px] lg:text-[220px]">
              404
            </h1>

            {/* Gold accent */}
            <div className="absolute left-1/2 top-1/2 h-2 w-28 -translate-x-1/2 rotate-[-4deg] rounded-full bg-[#c9a227] sm:w-40" />
          </div>

          {/* Content */}
          <div className="mx-auto -mt-2 max-w-2xl sm:-mt-5">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#0b1f3a] shadow-sm">
              <Compass className="h-4 w-4 text-[#c9a227]" />
              Page Not Found
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Looks like this project
              <span className="text-[#c9a227]"> isn’t here.</span>
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-slate-500 sm:text-lg">
              The page you’re looking for may have been moved, removed, or
              never existed. Let’s get you back to the right place.
            </p>
          </div>

          {/* Buttons */}
          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">

            <Link
              to="/"
              className="group inline-flex w-full items-center justify-center gap-3 rounded-xl bg-[#0b1f3a] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#0b1f3a]/20 transition-all duration-300 hover:-translate-y-1 hover:bg-[#132d52] sm:w-auto"
            >
              <Home className="h-4 w-4" />
              Back to Home
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            <button
              onClick={() => window.history.back()}
              className="group inline-flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-7 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#c9a227]/50 hover:text-[#0b1f3a] sm:w-auto"
            >
              <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
              Go Back
            </button>

          </div>

          {/* Bottom Info */}
          <div className="mx-auto mt-14 flex max-w-lg items-center justify-center gap-4 text-xs text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />

            <span className="whitespace-nowrap font-medium">
              Building better experiences
            </span>

            <span className="h-px flex-1 bg-slate-200" />
          </div>

        </div>
      </div>
    </div>
  );
}