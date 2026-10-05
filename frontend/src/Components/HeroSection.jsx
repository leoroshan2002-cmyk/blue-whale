import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import heroVideo from "../assets/herovideo.mp4";
import { useNavigate } from "react-router-dom";

export default function HeroSection() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const { scrollY } = useScroll();

  const textY = useTransform(scrollY, [0, 500], [0, -150]);
  return (
    <section className="relative h-screen overflow-hidden">

  {/* Background Video */}
  <video
    ref={videoRef}
    autoPlay
    muted
    loop
    playsInline
    className="absolute inset-0 w-full h-full object-cover"
  >
    <source src={heroVideo} type="video/mp4" />
  </video>

  {/* Dark Overlay */}
  <div className="absolute inset-0 bg-black/40"></div>

  {/* Hero Content */}
  <motion.div
    style={{ y: textY }}
    className="relative z-10 flex h-full items-center justify-center text-center px-6">

    <div className="max-w-3xl">

      {/* New Season */}

      <motion.span
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="uppercase tracking-[0.35em] text-sm text-white"
      >
        New Season
      </motion.span>

      {/* Heading */}

      <motion.h1
        initial={{ opacity: 0, y: 80 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="mt-6 text-5xl md:text-7xl lg:text-8xl font-serif text-white leading-none"
      >
        The New
        <br />
        Atelier Collection
      </motion.h1>

      {/* Paragraph */}

      <motion.p
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-8 text-lg md:text-xl text-gray-200"
      >
        Discover modern silhouettes and timeless luxury,
        exclusively crafted for the discerning individual.
      </motion.p>

      {/* Buttons */}

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        className="mt-12 flex justify-center gap-6 flex-wrap"
      >

        <button
          onClick={() => navigate("/products")}
          className="bg-white text-black px-10 py-4 rounded-full hover:bg-gray-200 transition"
        >
          Explore Now
        </button>

        <button
          className="border border-white text-white px-10 py-4 rounded-full hover:bg-white hover:text-black transition"
        >
          View Campaign
        </button>

      </motion.div>

    </div>

  </motion.div>

</section>
  );
}