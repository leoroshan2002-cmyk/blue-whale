import { useState } from "react";
import { motion } from "framer-motion";
import {
  Truck,
  Zap,
  Bike,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";

const deliveryOptions = [
  {
    id: "standard",
    title: "Standard Delivery",
    time: "3 - 5 Business Days",
    price: "FREE",
    icon: Truck,
  },
  {
    id: "express",
    title: "Express Delivery",
    time: "Next Business Day",
    price: "₹299",
    icon: Zap,
  },
  {
    id: "same",
    title: "Same Day Delivery",
    time: "Within 6 Hours",
    price: "₹499",
    icon: Bike,
  },
];

export default function DeliverySection({ onSelectDelivery }) {
  const [selected, setSelected] = useState("standard");
  const [show, setShow] = useState(false);

  const handleSelect = (id) => {
    setSelected(id);
    onSelectDelivery?.(deliveryOptions.find((o) => o.id === id));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="border-b border-gray-200 p-5 sm:p-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <h2 className="text-2xl font-semibold sm:text-3xl">
             Delivery Method
          </h2>

          <CheckCircle2
            size={26}
            className="text-green-600 fill-green-600"
          />
        </div>

        <button onClick={() => setShow(!show)}>
          <ChevronDown
            size={24}
            className={`transition-transform duration-300 cursor-pointer ${
              show ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Delivery Options */}
      {show && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.4 }}
          className="space-y-5 mt-8 overflow-hidden"
        >
          {deliveryOptions.map((item) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.id}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelect(item.id)}
                className={`cursor-pointer rounded-2xl border p-5 transition
                  ${
                    selected === item.id
                      ? "border-[#0d2746] bg-blue-50"
                      : "border-gray-200 hover:border-[#0d2746]"
                  }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 gap-3 sm:gap-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl sm:h-14 sm:w-14
                        ${
                          selected === item.id
                            ? "bg-[#0d2746] text-white"
                            : "bg-gray-100"
                        }`}
                    >
                      <Icon size={26} />
                    </div>

                    <div>
                      <h3 className="text-base font-semibold sm:text-xl">
                        {item.title}
                      </h3>

                      <p className="text-gray-500">
                        {item.time}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-base font-bold sm:text-lg">
                      {item.price}
                    </p>

                    <div
                      className={`w-6 h-6 rounded-full border-2 mt-2 ml-auto flex items-center justify-center
                        ${
                          selected === item.id
                            ? "border-[#0d2746]"
                            : "border-gray-300"
                        }`}
                    >
                      {selected === item.id && (
                        <div className="w-3 h-3 rounded-full bg-[#0d2746]" />
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}