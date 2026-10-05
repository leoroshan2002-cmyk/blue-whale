import { motion } from "framer-motion";
import { useState } from "react";
import {
  Bell,
  Mail,
  Smartphone,
} from "lucide-react";

export default function Preferences() {
  const [emailNews, setEmailNews] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);

  const Toggle = ({ enabled, setEnabled }) => (
    <button
      onClick={() => setEnabled(!enabled)}
      className={`relative h-7 w-14 rounded-full transition-all duration-300 ${
        enabled ? "bg-black" : "bg-zinc-300"
      }`}
    >
      <motion.div
        layout
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 35,
        }}
        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow ${
          enabled ? "left-8" : "left-1"
        }`}
      />
    </button>
  );

  const items = [
    {
      icon: Mail,
      title: "Email Newsletter",
      subtitle: "Receive exclusive collections and seasonal offers.",
      enabled: emailNews,
      setEnabled: setEmailNews,
    },
    {
      icon: Bell,
      title: "Order Notifications",
      subtitle: "Shipping updates, delivery status and order activity.",
      enabled: orderUpdates,
      setEnabled: setOrderUpdates,
    },
    {
      icon: Smartphone,
      title: "SMS Alerts",
      subtitle: "Receive important updates directly on your phone.",
      enabled: smsAlerts,
      setEnabled: setSmsAlerts,
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="min-h-full px-2 py-8"
    >
      <div className="mb-8">
        <p className="text-[11px] uppercase tracking-[0.35em] text-zinc-500">
          Personal Account
        </p>
        <h2 className="mt-3 font-serif text-[36px] md:text-[44px]">
          Communication Preferences
        </h2>
        <p className="mt-3 max-w-2xl text-zinc-500 leading-7">
          Choose how you want to receive updates about your orders, offers, and account activity.
        </p>
      </div>

      <div className="border-b border-zinc-300 mb-8"></div>

      <div className="space-y-4">

        {items.map((item, index) => {
          const Icon = item.icon;

          return (
            <motion.div
              key={index}
              whileHover={{
                y: -3,
                backgroundColor: "#ffffff",
              }}
              className="flex flex-col gap-6 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition-all md:flex-row md:items-center md:justify-between md:p-8"
            >
              <div className="flex items-center gap-6">

                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F7F4F2] text-zinc-700">
                  <Icon size={22} strokeWidth={1.5} />
                </div>

                <div>
                  <h3 className="font-serif text-xl md:text-2xl">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-zinc-500 leading-7 text-sm md:text-base">
                    {item.subtitle}
                  </p>
                </div>

              </div>

              <Toggle
                enabled={item.enabled}
                setEnabled={item.setEnabled}
              />
            </motion.div>
          );
        })}

      </div>
    </motion.section>
  );
}