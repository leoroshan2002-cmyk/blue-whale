import { useEffect, useState } from "react";

import birdLogo from "../assets/BirdLogo.png";

const BRAND = "HAIERAH".split("");

export default function LoadingScreen({ onComplete }) {
  const [finished, setFinished] = useState(false);
  const [showScene2, setShowScene2] = useState(false);

  useEffect(() => {
    const enterTimer = window.setTimeout(() => setShowScene2(true), 180);
    const finishTimer = window.setTimeout(() => {
      setFinished(true);
      onComplete?.();
    }, 1800);

    return () => {
      window.clearTimeout(enterTimer);
      window.clearTimeout(finishTimer);
    };
  }, [onComplete]);

  if (finished) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden">
      <div className="relative h-full w-full overflow-hidden bg-white transition-transform duration-700 ease-out">
        <div
          className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ${
            showScene2 ? "scale-[0.95] opacity-0" : "scale-100 opacity-100"
          }`}
        >
          <div className="relative">
            <div className="relative h-56 w-56 sm:h-72 sm:w-72 md:h-[24rem] md:w-[24rem] lg:h-[30rem] lg:w-[30rem]">
              <img
                src={birdLogo}
                alt="Bird Logo"
                className={`h-full w-full object-contain select-none transition-all duration-700 ${
                  showScene2 ? "scale-90 blur-md opacity-0" : "scale-100 blur-0 opacity-100"
                }`}
              />

              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div
                  className={`absolute left-[-40%] top-0 h-full w-20 rotate-[25deg] bg-gradient-to-r from-transparent via-white/90 to-transparent transition-transform duration-700 ${
                    showScene2 ? "translate-x-[220%]" : "translate-x-0"
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        <div
          className={`absolute inset-0 flex flex-col items-center justify-center px-6 transition-all duration-700 ${
            showScene2 ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
          }`}
        >
          <h1
            className="flex max-w-full select-none text-4xl font-semibold tracking-[0.18em] text-black sm:text-6xl sm:tracking-[0.30em] md:text-8xl lg:text-9xl"
            style={{
              fontFamily: '"Cormorant Garamond", serif',
            }}
          >
            {BRAND.map((letter, index) => (
              <span key={index} className="inline-block">
                {letter}
              </span>
            ))}
          </h1>

          <p className="mt-5 uppercase text-[10px] tracking-[0.35em] text-neutral-500 sm:mt-6 sm:text-xs sm:tracking-[0.55em]">
            Luxury Fashion
          </p>

          <div className="mt-7 h-[1px] w-40 overflow-hidden bg-neutral-200 sm:mt-8 sm:w-56">
            <div className="h-full w-full bg-black transition-transform duration-700 ease-out" />
          </div>
        </div>
      </div>
    </div>
  );
}