import { motion } from "framer-motion";
import {
  CreditCard,
  User,
  Calendar,
  Lock,
  Upload,
  Hash,
} from "lucide-react";

export const CardDetails = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 rounded-3xl border border-gray-200 p-8"
    >
      <h3 className="text-2xl font-semibold mb-8">
        Card Details
      </h3>

      <div className="space-y-6">

        {/* Card Number */}

        <div>

          <label className="block mb-2 text-sm font-medium">
            Card Number
          </label>

          <div className="relative">

            <CreditCard
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              autoComplete="cc-number"
              placeholder="1234 5678 9012 3456"
              className="w-full border rounded-2xl py-4 pl-12 pr-24 outline-none focus:ring-2 focus:ring-[#0d2746]"
            />

            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">

              <img
                src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png"
                className="h-5"
                alt="Visa"
              />

              <img
                src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
                className="h-5"
                alt="Mastercard"
              />

            </div>

          </div>

        </div>

        {/* Card Holder */}

        <div>

          <label className="block mb-2 text-sm font-medium">
            Card Holder Name
          </label>

          <div className="relative">

            <User
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              autoComplete="cc-name"
              placeholder="John Doe"
              className="w-full border rounded-2xl py-4 pl-12 outline-none focus:ring-2 focus:ring-[#0d2746]"
            />

          </div>

        </div>

        {/* Expiry + CVV */}

        <div className="grid md:grid-cols-2 gap-6">

          <div>

            <label className="block mb-2 text-sm font-medium">
              Expiry Date
            </label>

            <div className="relative">

              <Calendar
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                autoComplete="cc-exp"
                placeholder="MM / YY"
                className="w-full border rounded-2xl py-4 pl-12 outline-none focus:ring-2 focus:ring-[#0d2746]"
              />

            </div>

          </div>

          <div>

            <label className="block mb-2 text-sm font-medium">
              CVV
            </label>

            <div className="relative">

              <Lock
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="password"
                autoComplete="cc-csc"
                placeholder="***"
                className="w-full border rounded-2xl py-4 pl-12 outline-none focus:ring-2 focus:ring-[#0d2746]"
              />

            </div>

          </div>

        </div>

      </div>

      <div className="mt-8 bg-green-50 rounded-2xl p-4 flex gap-3">

        <Lock className="text-green-600" />

        <div>

          <h4 className="font-semibold">
            Secure Payment
          </h4>

          <p className="text-sm text-gray-500">
            Your payment information is encrypted using SSL.
          </p>

        </div>

      </div>

    </motion.div>
  );
};

export const UpiDetails = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 rounded-3xl border border-gray-200 p-8"
    >
      <h3 className="text-2xl font-semibold mb-8">
        UPI Payment Details
      </h3>

      <div className="space-y-6">

        {/* UPI App */}

        <div>

          <label className="block mb-3 text-sm font-medium">
            Choose UPI App
          </label>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            {["Google Pay", "PhonePe", "Paytm", "BHIM"].map((app) => (

              <button
                key={app}
                className="border rounded-2xl py-4 hover:border-[#0d2746] hover:bg-blue-50 transition"
              >
                {app}
              </button>

            ))}

          </div>

        </div>

        {/* Transaction ID */}

        <div>

          <label className="block mb-2 text-sm font-medium">
            Transaction ID
          </label>

          <div className="relative">

            <Hash
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              placeholder="Enter UPI Transaction ID"
              className="w-full border rounded-2xl py-4 pl-12 outline-none focus:ring-2 focus:ring-[#0d2746]"
            />

          </div>

        </div>

        {/* Upload Screenshot */}

        <div>

          <label className="block mb-3 text-sm font-medium">
            Payment Screenshot (Optional)
          </label>

          <label className="border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-[#0d2746]">

            <Upload size={32} />

            <p className="font-medium mt-3">
              Upload Payment Screenshot
            </p>

            <span className="text-sm text-gray-500 mt-1">
              JPG, PNG or PDF
            </span>

            <input
              type="file"
              accept="image/*,.pdf"
              className="hidden"
            />

          </label>

        </div>

      </div>
    </motion.div>
  );
};