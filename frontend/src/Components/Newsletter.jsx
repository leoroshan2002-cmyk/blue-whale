import { motion } from "framer-motion";

export default function Newsletter() {
  return (
    <section className="max-w-5xl mx-auto px-6 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 80 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-[#082A4F] rounded-3xl p-14 text-center text-white"
      >
        <h2 className="text-3xl font-bold">
          Join the Inner Circle
        </h2>

        <p className="text-slate-300 mt-4">
          Subscribe to receive exclusive access to new
          collections, limited releases and private seasonal
          sales.
        </p>

        <div className="flex flex-col md:flex-row justify-center gap-4 mt-8">
          <input
            type="email"
            placeholder="Your email address"
            className="md:w-[400px] px-6 py-4 rounded-full text-black outline-none"
          />

          <button className="bg-amber-500 px-8 py-4 rounded-full font-semibold">
            SUBSCRIBE NOW
          </button>
        </div>

        <p className="text-xs text-slate-400 mt-4">
          By subscribing, you agree to our Privacy Policy.
        </p>
      </motion.div>
    </section>
  );
}