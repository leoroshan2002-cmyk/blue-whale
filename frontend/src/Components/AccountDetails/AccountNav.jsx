import { motion } from "framer-motion";
import {
  ShoppingBag,
  Heart,
} from "lucide-react";

export default function AccountNav() {
  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: .6 }}
      className="w-full border-b border-zinc-200 bg-[#faf8f6]"
    >
      <div className="max-w-[1600px] mx-auto h-20 px-12 flex items-center justify-between">

        {/* Left */}

        <div className="flex items-center gap-12">

          <h1 className="text-[54px] tracking-tight font-serif leading-none">
            HAIRA
          </h1>

          <nav className="hidden lg:flex items-center gap-8">

            <a
              href="#"
              className="text-[13px] tracking-[0.2em] uppercase hover:text-black text-zinc-600 transition"
            >
              Collections
            </a>

            <a
              href="#"
              className="text-[13px] tracking-[0.2em] uppercase hover:text-black text-zinc-600 transition"
            >
              Boutiques
            </a>

            <a
              href="#"
              className="text-[13px] tracking-[0.2em] uppercase hover:text-black text-zinc-600 transition"
            >
              About
            </a>

          </nav>

        </div>

        {/* Right */}

        <div className="flex items-center gap-8">

          <ShoppingBag
            size={19}
            strokeWidth={1.4}
            className="cursor-pointer"
          />

          <Heart
            size={19}
            strokeWidth={1.4}
            className="cursor-pointer"
          />

          <button className="text-sm border-b border-black pb-1 tracking-wide">
            Account
          </button>

        </div>

      </div>
    </motion.header>
  );
}