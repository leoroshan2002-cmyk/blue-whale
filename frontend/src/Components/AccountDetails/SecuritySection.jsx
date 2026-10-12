import { motion } from "framer-motion";
import { useState } from "react";
import { Lock, ShieldCheck, ChevronRight } from "lucide-react";
import { useAuth } from "../../Context/AuthContext";
import { buildApiUrl } from "../../services/api";

const cards = [
  {
    icon: Lock,
    title: "Password",
    description: "Keep your account secure by updating your password regularly.",
    button: "Change Password",
  },
  {
    icon: ShieldCheck,
    title: "Two-Factor Authentication",
    description: "Add an extra layer of protection with two-factor authentication.",
    button: "Enable 2FA",
  },
];

export default function SecuritySection() {
  const { user } = useAuth();
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [message, setMessage] = useState("");

  const handlePasswordChange = async (event) => {
    event.preventDefault();

    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      setMessage("New password must be at least 6 characters long.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    if (!user?.id) {
      setMessage("Please log in before changing your password.");
      return;
    }

    try {
      const response = await fetch(buildApiUrl(`/api/users/${user.id}`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({
          password: passwordForm.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update password.");
      }

      setMessage("Password updated successfully. Please use your new password on the next login.");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      setMessage(error.message || "Unable to update password.");
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      className="min-h-full px-2 py-8"
    >
      <div className="mb-8">
        <p className="text-[11px] uppercase tracking-[0.35em] text-zinc-500">
          Personal Account
        </p>
        <h2 className="mt-3 font-serif text-[36px] md:text-[44px]">
          Security & Login
        </h2>
        <p className="mt-3 max-w-2xl text-zinc-500 leading-7">
          Manage your password and security preferences for safe account access.
        </p>
      </div>

      <div className="border-b border-zinc-300 mb-8"></div>

      <div className="grid gap-8 lg:grid-cols-2">
        {cards.map((card, index) => {
          const Icon = card.icon;

          return (
            <motion.div
              key={index}
              whileHover={{ y: -8, boxShadow: "0 18px 40px rgba(0,0,0,0.08)" }}
              transition={{ duration: 0.3 }}
              className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F7F4F2] mb-6">
                <Icon size={24} strokeWidth={1.5} />
              </div>

              <h3 className="font-serif text-[24px] md:text-[28px]">{card.title}</h3>
              <p className="mt-4 text-zinc-500 leading-7">{card.description}</p>

              {card.title === "Password" ? (
                <form onSubmit={handlePasswordChange} className="mt-6 space-y-4">
                  <input
                    type="password"
                    autoComplete="current-password"
                    placeholder="Current password"
                    value={passwordForm.currentPassword}
                    onChange={(event) =>
                      setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-zinc-300 px-4 py-3 outline-none focus:ring-2 focus:ring-black"
                  />
                  <input
                    type="password"
                    autoComplete="new-password"
                    placeholder="New password"
                    value={passwordForm.newPassword}
                    onChange={(event) =>
                      setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-zinc-300 px-4 py-3 outline-none focus:ring-2 focus:ring-black"
                  />
                  <input
                    type="password"
                    autoComplete="new-password"
                    placeholder="Confirm new password"
                    value={passwordForm.confirmPassword}
                    onChange={(event) =>
                      setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-zinc-300 px-4 py-3 outline-none focus:ring-2 focus:ring-black"
                  />

                  <button
                    type="submit"
                    className="rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white"
                  >
                    Update Password
                  </button>
                </form>
              ) : (
                <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Two-factor authentication</p>
                      <p className="mt-1 text-sm text-zinc-500">
                        {twoFactorEnabled ? "Enabled for your account" : "Not enabled yet"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTwoFactorEnabled((prev) => !prev)}
                      className={`rounded-full px-4 py-2 text-sm font-medium ${
                        twoFactorEnabled ? "bg-black text-white" : "bg-white text-zinc-700 border border-zinc-300"
                      }`}
                    >
                      {twoFactorEnabled ? "Enabled" : "Enable"}
                    </button>
                  </div>
                </div>
              )}

              {message && (
                <p className="mt-4 text-sm text-green-600">{message}</p>
              )}

              <motion.button
                whileHover={{ x: 5 }}
                className="mt-8 flex items-center gap-2 uppercase tracking-[0.18em] text-[11px] font-medium"
              >
                {card.button}
                <ChevronRight size={16} strokeWidth={1.7} />
              </motion.button>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}