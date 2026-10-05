import {
  Award,
  Truck,
  ShieldCheck,
  RotateCcw,
  Headphones,
} from "lucide-react";

import { motion } from "framer-motion";

const features = [
  {
    icon: Award,
    title: "Quality First",
    desc: "Hand-picked premium fabrics and materials.",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    desc: "Global express shipping worldwide.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payment",
    desc: "Protected encrypted transactions.",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    desc: "30 day hassle-free returns.",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    desc: "Dedicated customer care team.",
  },
];

export default function Features() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-24">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold">
          The BlueWhale Standard
        </h2>

        <p className="text-slate-500 mt-3">
          Committed to providing an unparalleled luxury shopping
          experience.
        </p>
      </div>

      <div className="grid md:grid-cols-5 gap-6">
        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <motion.div
              whileHover={{ y: -10 }}
              key={feature.title}
              className="bg-white rounded-2xl p-6 text-center shadow-sm"
            >
              <Icon
                size={28}
                className="mx-auto text-[#0B2545]"
              />

              <h3 className="font-semibold mt-4">
                {feature.title}
              </h3>

              <p className="text-sm text-slate-500 mt-2">
                {feature.desc}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}