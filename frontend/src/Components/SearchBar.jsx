import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { normalizeSearchText } from "../utils/searchUtils";

export default function SearchBar({ open, setOpen }) {
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") setOpen(false);
        };

        window.addEventListener("keydown", handleEsc);

        document.body.style.overflow = open ? "hidden" : "auto";

        return () => {
            window.removeEventListener("keydown", handleEsc);
            document.body.style.overflow = "auto";
        };
    }, [open, setOpen]);
    const [search, setSearch] = useState("");
    const navigate = useNavigate();
    const handleSearch = () => {
        const normalizedSearch = normalizeSearchText(search);
        if (!normalizedSearch) return;

        navigate(`/products?search=${encodeURIComponent(normalizedSearch)}`);
        setOpen(false);
    };

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Overlay */}

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setOpen(false)}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                    />

                    {/* Sidebar */}

                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{
                            duration: 0.5,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                        className="
              fixed
              top-0
              right-0
              h-screen
              w-full
              sm:w-[500px]
              bg-black
              z-50
              text-white
              p-8
              flex
              flex-col
            "
                    >
                        {/* Header */}

                        <div className="flex items-center justify-between mb-10">
                            <h2 className="text-3xl tracking-widest uppercase">
                                Search
                            </h2>

                            <button
                                onClick={() => setOpen(false)}
                                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Search Input */}

                        <div className="relative">
                            <Search
                                size={20}
                                className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-400"
                            />

                            <input
                                autoFocus
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        handleSearch();
                                    }
                                }}
                                placeholder="Search products..."
                                className="
    w-full
    bg-transparent
    border-b
    border-zinc-700
    pl-8
    pb-4
    text-xl
    outline-none
    placeholder:text-zinc-500
  "
                            />
                        </div>

                        {/* Popular Searches */}

                        <div className="mt-12">
                            <p className="text-zinc-500 uppercase text-xs tracking-[0.2em] mb-5">
                                Popular Searches
                            </p>

                            <div className="flex flex-wrap gap-3">
                                {[
                                    "Shirts",
                                    "Jeans",
                                    "Sneakers",
                                    "Dresses",
                                    "New Arrivals",
                                    "Bags",
                                ].map((item) => (
                                    <button
                                        key={item}
                                        onClick={() => {
                                            const normalizedSearch = normalizeSearchText(item);
                                            if (!normalizedSearch) return;
                                            navigate(`/products?search=${encodeURIComponent(normalizedSearch)}`);
                                            setOpen(false);
                                        }}
                                        className="
                      border
                      border-zinc-700
                      px-4
                      py-2
                      rounded-full
                      hover:bg-white
                      hover:text-black
                      transition
                    "
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Empty State */}

                        <div className="flex-1 flex items-center justify-center">
                            <p className="text-zinc-600 text-lg">
                                Start typing to search...
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}