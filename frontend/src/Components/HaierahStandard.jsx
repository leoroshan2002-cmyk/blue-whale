import React from "react";
import { motion } from "framer-motion";
import {
  Truck,
  ShieldCheck,
  RotateCcw,
  Award,
  Headphones,
} from "lucide-react";

const features = [
  {
    icon: Award,
    title: "Quality First",
    desc: "Hand-picked premium fabrics and materials.",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    desc: "Global express shipping to your doorstep.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payment",
    desc: "Encrypted checkout and payment security.",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    desc: "Hassle-free returns within 30 days.",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    desc: "Dedicated support whenever you need.",
  },
];

export default function HaierahStandard() {
  return (
    <section className="bg-[#faf8f4] py-14">
      <div className="max-w-7xl mx-auto px-6">

        <p className="uppercase tracking-[3px] text-sm text-gray-600 mb-8">
          WHY CHOOSE HAIERAH
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">

          {features.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition p-6 text-center"
              >
                <Icon className="mx-auto h-8 w-8 text-[#0d2746]" />

                <h3 className="mt-4 font-semibold text-base">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm text-gray-500 leading-6">
                  {item.desc}
                </p>

              </motion.div>
            );
          })}

        </div>

      </div>
    </section>
  );
}