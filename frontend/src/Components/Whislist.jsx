import React, { useRef } from "react";
import { motion } from "framer-motion";

import CompleteLook from "./WishlistDetails/CompleteLook";
import EmptyWishlist from "./WishlistDetails/EmpltWishlist";
import {
    X,
    Share2,
    ShoppingBag,
} from "lucide-react";
import { useWishlist } from "../Context/WhislistContext";
import { useCart } from "../Context/CartContext";

export default function Wishlist() {
    const { wishlist, removeFromWishlist } = useWishlist();
    const { addToCart } = useCart();

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: "My Wishlist",
                    text: "Check out my wishlist!",
                    url: window.location.href,
                });
            } catch (_err) {
        }
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert("Wishlist link copied!");
        }
    };

    const handleBuyAll = () => {
        wishlist.forEach((item) => addToCart(item));
    };

    const cards = useRef([]);

    // useEffect(() => {
    //     gsap.from(cards.current, {
    //         opacity: 100,
    //         y: 40,
    //         duration: 0.7,
    //         stagger: 0.1,
    //         ease: "power3.out",
    //     });
    // }, []);

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">

            {/* Header */}

            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">

                <h1 className="text-6xl font-serif">
                    My Wishlist
                </h1>

                <div className="flex gap-4 mt-6 md:mt-0">

                    <button
                        onClick={handleShare}
                        className="border rounded-xl px-6 py-3 flex items-center gap-2 hover:bg-gray-100 transition"
                    >
                        Share Wishlist
                        <Share2 size={18} />
                    </button>

                    <button
                        onClick={handleBuyAll}
                        className="bg-black text-white rounded-xl px-8 py-3 hover:bg-neutral-800 transition"
                    >
                        BUY ALL
                    </button>

                </div>

            </div>

            {wishlist.length === 0 ? (

                <EmptyWishlist/>

            ) : (

                <>
                    {/* Wishlist Grid */}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">

                        {wishlist.map((item, index) => (

                            <motion.div
                                ref={(el) => (cards.current[index] = el)}
                                key={item.id}
                                whileHover={{ y: -8 }}
                                className="group"
                            >

                                <div className="relative overflow-hidden rounded-xl bg-[#f5f5f5]">

                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-[330px] object-cover group-hover:scale-105 duration-500"
                                    />

                                    <button
                                        onClick={() => removeFromWishlist(item.id)}
                                        className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white shadow flex items-center justify-center hover:bg-red-500 hover:text-white transition"
                                    >
                                        <X size={18} />
                                    </button>

                                    <motion.button
                                        whileTap={{ scale: .95 }}
                                        onClick={() => addToCart(item)}
                                        className="absolute bottom-4 left-4 right-4 bg-black text-white py-3 rounded-lg opacity-0 group-hover:opacity-100 duration-300 flex items-center justify-center gap-2"
                                    >
                                        <ShoppingBag size={18} />
                                        Add to Bag
                                    </motion.button>

                                </div>

                                <h3 className="mt-4 text-3xl font-serif">
                                    {item.name}
                                </h3>

                                <p className="text-xl font-medium">
                                    ₹{item.price}
                                </p>

                            </motion.div>

                        ))}

                    </div>

                    <CompleteLook />
                </>
            )}
        </div>
    );
}