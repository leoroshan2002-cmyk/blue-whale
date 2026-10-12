import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Camera, Pencil, Check, X } from "lucide-react";
import { useAuth } from "../../Context/AuthContext";
import { buildApiUrl } from "../../services/api";

const defaultData = [
  { label: "First Name", key: "firstName", value: "" },
  { label: "Last Name", key: "lastName", value: "" },
  { label: "Email Address", key: "email", value: "" },
  { label: "Phone Number", key: "phone", value: "" },
  { label: "Gender", key: "gender", value: "" },
  { label: "Date of Birth", key: "birthday", value: "" },
  { label: "Address", key: "address", value: "" },
  { label: "City", key: "city", value: "" },
  { label: "State", key: "state", value: "" },
  { label: "Zip Code", key: "zip", value: "" },
];

const mapUserToDetails = (user) => {
  return [
    { label: "First Name", key: "firstName", value: user?.firstName || "" },
    { label: "Last Name", key: "lastName", value: user?.lastName || "" },
    { label: "Email Address", key: "email", value: user?.email || "" },
    { label: "Phone Number", key: "phone", value: user?.phone || "" },
    { label: "Gender", key: "gender", value: user?.gender || "" },
    { label: "Date of Birth", key: "birthday", value: user?.birthday || "" },
    { label: "Address", key: "address", value: user?.address || "" },
    { label: "City", key: "city", value: user?.city || "" },
    { label: "State", key: "state", value: user?.state || "" },
    { label: "Zip Code", key: "zip", value: user?.zip || "" },
  ];
};

export default function PersonalInfo() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [details, setDetails] = useState(defaultData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const avatarInputRef = useRef(null);

  useEffect(() => {
    const syncProfile = async () => {
      if (!user) return;

      const mergedUser = {
        ...user,
        firstName: user?.firstName || user?.name?.split(" ")[0] || "",
        lastName: user?.lastName || user?.name?.split(" ").slice(1).join(" ") || "",
      };

      setDetails(mapUserToDetails(mergedUser));
      setAvatarPreview(mergedUser?.avatar || "");
      setAvatarFile(null);

      if (user?.id) {
        try {
          const response = await fetch(buildApiUrl(`/api/users/${user.id}`), { credentials: 'include' });
          const data = await response.json();

          if (response.ok && data.customer) {
            const refreshedUser = {
              ...mergedUser,
              ...data.customer,
              firstName: data.customer?.firstName || mergedUser.firstName || "",
              lastName: data.customer?.lastName || mergedUser.lastName || "",
              name: data.customer?.name || mergedUser.name || "",
            };

            setDetails(mapUserToDetails(refreshedUser));
            setAvatarPreview(refreshedUser?.avatar || mergedUser?.avatar || "");
          }
        } catch {
          // Ignore and keep the locally available profile data visible.
        }
      }
    };

    syncProfile();
  }, [user?.id]);

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      setAvatarFile(file);
      const objectUrl = URL.createObjectURL(file);
      setAvatarPreview(objectUrl);
    }
  };

  const handleChange = (key, newValue) => {
    setDetails((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, value: newValue } : item
      )
    );
  };

  const getSavePayload = () => {
    const payload = {};
    details.forEach((item) => {
      if (item.key !== "email") {
        payload[item.key] = item.value;
      }
    });

    if (payload.firstName || payload.lastName) {
      payload.name = `${payload.firstName || ""} ${payload.lastName || ""}`.trim();
    }

    return payload;
  };

  const handleSave = async () => {
    if (!user?.id) {
      setError("Unable to save: logged-in user not found.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      const payload = getSavePayload();

      Object.entries(payload).forEach(([key, value]) => {
        formData.append(key, value);
      });

      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const response = await fetch(buildApiUrl(`/api/users/${user.id}`), {
        method: "PUT",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update profile.");
      }

      const updatedUser = {
        ...user,
        ...data.customer,
        firstName: data.customer?.firstName || user?.firstName || "",
        lastName: data.customer?.lastName || user?.lastName || "",
        name: data.customer?.name || user?.name || "",
      };

      updateUser(updatedUser);
      setDetails(mapUserToDetails(updatedUser));
      setAvatarPreview(updatedUser.avatar || "");
      setAvatarFile(null);
      setSuccess("Profile updated successfully.");
      setIsEditing(false);
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setDetails(mapUserToDetails(user));
    setIsEditing(false);
    setError("");
    setSuccess("");
  };

    return (
        <div className="min-h-full overflow-y-auto no-scrollbar px-0 mt-6 md:mt-10">

            {/* HEADER */}
            <motion.section
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-10"
            >
                <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">

                    {/* PROFILE IMAGE */}
                    <div className="relative shrink-0">
                        {avatarPreview ? (
                          <img
                              src={avatarPreview}
                              alt="Profile"
                              className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-[6px] border-[#E5DFDA]"
                          />
                        ) : (
                          <div
                            aria-label="No profile image"
                            className="w-32 h-32 md:w-40 md:h-40 rounded-full border-[6px] border-[#E5DFDA] bg-white"
                          />
                        )}

                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => avatarInputRef.current?.click()}
                            className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-white border flex items-center justify-center"
                          >
                            <Camera size={18} />
                          </button>
                        )}

                        <input
                          ref={avatarInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarChange}
                        />
                    </div>

                    {/* INFO */}
                    <div className="text-center md:text-left">
                        <h1 className="font-serif text-3xl md:text-5xl">
                            {details[0].value} {details[1].value}
                        </h1>

                        <p className="mt-3 text-zinc-500 max-w-md">
                            Manage your personal information and profile settings.
                        </p>

                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="mt-6 px-8 py-2 border border-black rounded-full uppercase text-[11px]"
                            >
                                Edit Profile
                            </button>
                        ) : (
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={handleSave}
                                    className="flex items-center gap-2 px-6 py-2 bg-black text-white rounded-full text-[11px] uppercase"
                                >
                                    <Check size={14} /> Save
                                </button>

                                <button
                                    onClick={handleCancel}
                                    className="flex items-center gap-2 px-6 py-2 border rounded-full text-[11px] uppercase"
                                >
                                    <X size={14} /> Cancel
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </motion.section>

            {/* DETAILS */}
            <motion.section
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="mt-14 md:mt-24"
            >
                <div className="flex items-center justify-between">
                    <h2 className="font-serif text-3xl sm:text-[38px] md:text-[44px]">
                        Personal Information
                    </h2>

                    <button
                        onClick={() => setIsEditing((p) => !p)}
                        className="flex items-center gap-2 text-[11px] uppercase text-zinc-500"
                        disabled={loading}
                    >
                        <Pencil size={14} />
                        {isEditing ? "Close Editor" : "Edit Details"}
                    </button>
                </div>

                <div className="border-b border-zinc-300 mt-6" />

                {error && (
                    <div className="mt-6 text-sm text-red-600">{error}</div>
                )}
                {success && (
                    <div className="mt-6 text-sm text-green-600">{success}</div>
                )}

                {/* GRID */}
                <div className="mt-10 mb-16 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 md:mt-12 md:gap-x-16 md:gap-y-16 md:mb-20">
                    {details.map((item, index) => (
                        <motion.div
                            key={index}
                            whileHover={{ y: -3 }}
                            className="font-bold"
                        >
                            <p className="uppercase tracking-[0.25em] text-[10px] text-zinc-500 mb-3">
                                {item.label}
                            </p>

                            {isEditing ? (
                                item.key === "gender" ? (
                                  <select
                                    value={item.value}
                                    onChange={(e) => handleChange(item.key, e.target.value)}
                                    className="text-[28px] font-semibold text-zinc-800 border-b border-zinc-300 outline-none bg-transparent w-full"
                                  >
                                    <option value="">Select gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Non-binary">Non-binary</option>
                                    <option value="Other">Other</option>
                                  </select>
                                ) : item.key === "birthday" ? (
                                  <input
                                    type="date"
                                    value={item.value}
                                    onChange={(e) =>
                                        handleChange(item.key, e.target.value)
                                    }
                                    className="text-[28px] font-semibold text-zinc-800 border-b border-zinc-300 outline-none bg-transparent w-full"
                                  />
                                ) : (
                                  <input
                                    value={item.value}
                                    onChange={(e) =>
                                        handleChange(item.key, e.target.value)
                                    }
                                    disabled={item.key === "email"}
                                    className="text-[28px] font-semibold text-zinc-800 border-b border-zinc-300 outline-none bg-transparent w-full disabled:opacity-50"
                                  />
                                )
                            ) : (
                                <p className="text-[32px] font-semibold text-zinc-800">
                                    {item.value || "-"}
                                </p>
                            )}
                        </motion.div>
                    ))}
                </div>
            </motion.section>
        </div>
    );
}   