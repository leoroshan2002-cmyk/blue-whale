import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
    ChevronRight,
    Footprints,
    Shirt,
    ShoppingBag,
    Sparkles,
    X,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { fetchCategories } from "../services/api";
import { DEFAULT_IMAGE_FALLBACK, getSafeImageUrl } from "../utils/productImages";

const defaultMenuData = {
    MEN: [
        {
            name: "NEW ARRIVALS",
            icon: Sparkles,
            image:
                "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800",
        },
        {
            name: "SHIRTS",
            icon: Shirt,
            image:
                "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800",
        },
        {
            name: "T-SHIRTS",
            icon: ShoppingBag,
            image:
                "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800",
        },
        {
            name: "JEANS",
            icon: ShoppingBag,
            image:
                "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800",
        },
        {
            name: "FOOTWEAR",
            icon: Footprints,
            image:
                "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
        },
    ],

    WOMEN: [
        {
            name: "DRESSES",
            icon: Sparkles,
            image:
                "https://images.unsplash.com/photo-1520975916090-3105956dac38?w=800",
        },
        {
            name: "TOPS",
            icon: Shirt,
            image:
                "https://images.unsplash.com/photo-1521334884684-d80222895322?w=800",
        },
        {
            name: "JEANS",
            icon: ShoppingBag,
            image:
                "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800",
        },
        {
            name: "HANDBAGS",
            icon: ShoppingBag,
            image:
                "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800",
        },
    ],

    KIDS: [
        {
            name: "BOYS",
            icon: Shirt,
            image:
                "https://images.unsplash.com/photo-1503919005314-30d93d07d823?w=800",
        },
        {
            name: "GIRLS",
            icon: Sparkles,
            image:
                "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=800",
        },
        {
            name: "TOYS",
            icon: ShoppingBag,
            image:
                "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800",
        },
    ],

    NEW: [
        {
            name: "TRENDING",
            icon: Sparkles,
            image:
                "https://images.unsplash.com/photo-1521334884684-d80222895322?w=800",
        },
        {
            name: "BEST SELLERS",
            icon: ShoppingBag,
            image:
                "https://images.unsplash.com/photo-1520975916090-3105956dac38?w=800",
        },
    ],
};

const categoryNameMap = {
    MEN: 'Men',
    WOMEN: 'Women',
    KIDS: 'Kids',
    NEW: 'New Arrivals',
};

const CategoriesSidebar = ({ open, setOpen, activeMenu }) => {
    const [activeImage, setActiveImage] = useState("");
    const [categories, setCategories] = useState([]);

    const navigate = useNavigate();
    const pageCategory = categoryNameMap[activeMenu] || activeMenu;
    const activeCategory = useMemo(
        () => categories.find((cat) => cat.name?.toLowerCase() === pageCategory.toLowerCase()),
        [categories, pageCategory]
    );

    const menuItems = useMemo(() => {
        if (activeCategory) {
            const subCategories = Array.isArray(activeCategory.subCategories)
                ? activeCategory.subCategories
                : activeCategory.subCategory
                    ? [activeCategory.subCategory]
                    : [];

            return subCategories.map((subCategory, index) => ({
                name: subCategory,
                icon: subCategory.toUpperCase().includes('JEANS') ? Shirt : Sparkles,
                image: activeCategory.image || defaultMenuData[activeMenu]?.[index]?.image || defaultMenuData[activeMenu]?.[0]?.image,
            }));
        }

        return defaultMenuData[activeMenu] || [];
    }, [activeCategory, activeMenu]);

    useEffect(() => {
        const loadCategories = async () => {
            const response = await fetchCategories();
            setCategories(response);
        };

        loadCategories();
    }, []);

    useEffect(() => {
        if (menuItems.length > 0) {
            setActiveImage(menuItems[0].image);
        }
    }, [menuItems]);

    const categoriesToRender = menuItems;
    const isStaticMenu = ["MEN", "WOMEN", "KIDS", "NEW"].includes(activeMenu);

    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "auto";
        return () => (document.body.style.overflow = "auto");
    }, [open]);

    const handleCategorySelect = (itemName) => {
        setOpen(false);

        if (activeCategory?.slug) {
            const targetPath = `/category/${activeCategory.slug}`;
            const query = itemName ? `?subcategory=${encodeURIComponent(itemName)}` : '';
            navigate(`${targetPath}${query}`);
            return;
        }

        if (activeMenu === "MEN") {
            navigate('/products');
        } else if (activeMenu === "WOMEN") {
            navigate('/products');
        } else if (activeMenu === "KIDS") {
            navigate('/products');
        } else if (activeMenu === "NEW") {
            navigate('/products');
        }
    };

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* OVERLAY */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}

                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                    />

                    {/* SIDEBAR */}
                    <motion.div
                        initial={{ x: -500, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -500, opacity: 0 }}
                        onMouseLeave={() => setOpen(false)}
                        transition={{
                            duration: 0.8,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                        //onMouseLeave={() => setOpen(false)}
                        className="
              fixed
              top-0
              left-0
              h-screen
              w-full md:w-[900px]
              bg-[#0a0a0a]
              z-50
              flex
              overflow-hidden
              shadow-2xl
            "
                    >
                        {/* CLOSE */}
                        <div className="    absolute    top-2    right-2    w-7    h-7    flex    items-center    justify-center    bg-white/10    text-white    rounded-full    cursor-pointer    transition-all    duration-300    hover:bg-white/20    hover:rotate-90    hover:scale-110  ">
                            <X
                                size={20}
                                onClick={() => setOpen(false)}
                                className=" text-white cursor-pointer hover:rotate-90 transition-all"
                            />
                        </div>

                        {/* LEFT PANEL */}
                        <div
                            className="
                w-[360px]
                h-full
                overflow-y-auto
                no-scrollbar
                p-10
                border-r
                border-white/10
              "
                        >
                            <h1
                                className="text-[#F5F1E8] text-3xl tracking-[0.2em]"
                                style={{ fontFamily: "Cormorant Garamond" }}
                            >
                                HAIERAH
                            </h1>

                            <p className="text-zinc-500 mt-2 text-sm uppercase tracking-[0.12em]">
                                Modern Essentials For {activeMenu}
                            </p>

                            {/* ITEMS */}
                            <div className="mt-12 space-y-2">
                                {categoriesToRender.map((item, index) => {
                                    const Icon = item.icon || (item.name?.toUpperCase().includes('JEANS') ? Shirt : Sparkles);

                                    return (
                                        <motion.div
                                            key={`${item.name}-${index}`}
                                            initial={{ opacity: 0, x: -30 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            onMouseEnter={() => setActiveImage(item.image)}
                                            className="
                        group flex items-center justify-between
                        py-4 px-4 rounded-xl cursor-pointer
                        hover:bg-[#181818]
                      "
                                            onClick={() => handleCategorySelect(item.name)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Icon size={16} className="text-[#D6C6A8]" />
                                                <span className="text-zinc-400 group-hover:text-white uppercase text-sm tracking-[0.12em]">
                                                    {item.name}
                                                </span>
                                            </div>

                                            <ChevronRight
                                                size={16}
                                                className="text-white opacity-0 group-hover:opacity-100 transition-all"
                                            />
                                        </motion.div>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => handleCategorySelect('')}
                                className="mt-10 border border-[#D6C6A8] text-[#F5F1E8] px-8 py-4 rounded-full hover:bg-[#D6C6A8] hover:text-black transition-all">
                                Explore Collection
                            </button>
                        </div>

                        {/* RIGHT IMAGE */}
                        <div className="flex-1 h-full p-8 flex items-center justify-center">
                            <motion.img
                                key={activeImage}
                                src={getSafeImageUrl(activeImage, DEFAULT_IMAGE_FALLBACK)}
                                onError={(event) => {
                                    event.currentTarget.src = DEFAULT_IMAGE_FALLBACK;
                                }}
                                initial={{ opacity: 0, scale: 1.05 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4 }}
                                className="w-full h-full object-cover rounded-3xl"
                            />
                        </div>
                    </motion.div>
                </>
            )
            }
        </AnimatePresence >
    );
};

export default CategoriesSidebar;