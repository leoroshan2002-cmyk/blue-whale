import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useAuth } from "../../Context/AuthContext";

export default function LoginSection() {
  const { user } = useAuth();

  const displayName = user?.name ||
    (user?.firstName || user?.lastName
      ? `${user?.firstName || ""} ${user?.lastName || ""}`.trim()
      : "Guest");
  const displayEmail = user?.email || "No email available";

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="border-b p-5 sm:p-6"
    >
      {/* Header */}

      <div className="flex items-center justify-between gap-3">

        <div className="flex min-w-0 items-center gap-2 sm:gap-3">

          <h2 className="text-2xl font-semibold sm:text-3xl">
             Account Details
          </h2>

          <CheckCircle2
            size={28}
            className="text-green-600 fill-green-600"
          />

        </div>

       

      </div>

      {/* User */}

      <p className="mt-4 break-words text-base text-gray-600 sm:text-xl">
        Logged in as
        <span className="ml-1 font-medium text-black sm:ml-2">
          {displayName} ({displayEmail})
        </span>
      </p>

    </motion.div>
  );
}