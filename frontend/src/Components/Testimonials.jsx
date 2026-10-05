import { Star } from "lucide-react";
import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Alexandra Reed",
    text: "The quality exceeded my expectations. Every detail feels premium and refined.",
  },
  {
    name: "James Morrison",
    text: "Elegant designs with excellent customer service and fast delivery.",
  },
  {
    name: "Elena Petrova",
    text: "A luxury shopping experience from browsing to delivery.",
  },
];

export default function Testimonials() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-24">
      <h2 className="text-center text-4xl font-bold mb-16">
        Customer Voices
      </h2>

      <div className="grid md:grid-cols-3 gap-8">
        {testimonials.map((item) => (
          <motion.div
            key={item.name}
            whileHover={{ y: -8 }}
            className="bg-white rounded-3xl p-8 shadow-sm"
          >
            <div className="flex gap-1 text-amber-400 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  fill="currentColor"
                />
              ))}
            </div>

            <p className="text-slate-600 leading-relaxed">
              "{item.text}"
            </p>

            <div className="mt-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-200" />

              <div>
                <h4 className="font-semibold">
                  {item.name}
                </h4>

                <p className="text-xs text-slate-500">
                  Verified Buyer
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}