import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
    ChevronLeft,
    ChevronRight,
    Star,
    ShoppingBag,
} from "lucide-react";
import gsap from "gsap";

const products = [
    {
        id: 1,
        name: "Leather Handbag",
        price: 2499,
        oldPrice: 3199,
        image:
            "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800",
        rating: 4.8,
    },
    {
        id: 2,
        name: "Leather Scarf",
        price: 1799,
        oldPrice: 2299,
        image:
            "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=800",
        rating: 4.7,
    },
    {
        id: 3,
        name: "Olive Jacket",
        price: 3299,
        oldPrice: 4199,
        image:
            "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800",
        rating: 4.9,
    },
    {
        id: 4,
        name: "Classic Watch",
        price: 5499,
        oldPrice: 6999,
        image:
            "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800",
        rating: 5,
    },
];

export default function RecommendationPage() {
    const sliderRef = useRef(null);

    useEffect(() => {
        gsap.from(".recommend-card", {
            //   opacity: 0,
            y: 50,
            duration: 0.8,
            stagger: 0.15,
            ease: "power3.out",
        });
    }, []);

    const scroll = (value) => {
        sliderRef.current?.scrollBy({
            left: value,
            behavior: "smooth",
        });
    };

    return (
        <section className="mt-20 w-[1000px]">

            <div className="flex items-center justify-between mb-8">

                <div>
                    <p className="uppercase tracking-[5px] text-sm text-gray-500">
                        Recommendations
                    </p>

                    <h2 className="text-5xl font-serif font-bold mt-2">
                        You May Also Like
                    </h2>
                </div>

                <div className="flex gap-3">

                    <button
                        onClick={() => scroll(-320)}
                        className="w-12 h-12 rounded-full border hover:bg-black hover:text-white transition"
                    >
                        <ChevronLeft className="mx-auto" />
                    </button>

                    <button
                        onClick={() => scroll(320)}
                        className="w-12 h-12 rounded-full border hover:bg-black hover:text-white transition"
                    >
                        <ChevronRight className="mx-auto" />
                    </button>

                </div>
            </div>

            <div
                ref={sliderRef}
                className="flex gap-8 overflow-x-auto scrollbar-hide pb-5 scroll-smooth no-scrollbar"
            >
                {products.map((item) => (
                    <motion.div
                        key={item.id}
                        whileHover={{
                            y: -10,
                        }}
                        transition={{ duration: 0.3 }}
                        className="recommend-card min-w-[280px] h-[400px] overflow-hidden bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl"
                    >
                        <div className="relative overflow-hidden">

                            <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-40 object-cover transition duration-500 hover:scale-110"
                            />

                            <span className="absolute top-4 left-4 bg-black text-white text-xs px-3 py-1 rounded-full">
                                NEW
                            </span>

                        </div>

                        <div className="p-6">
                            <div className="flex items-center justify-between gap-4">



                                <h3 className="text-l font-serif font-semibold ">
                                    {item.name}
                                </h3>
                                <div className="flex items-center gap-2 mb-3 ">

                                    <Star
                                        size={16}
                                        className="fill-yellow-400 text-yellow-400"
                                    />

                                    <span className="text-sm font-medium ">
                                        {item.rating}
                                    </span>

                                </div>
                            </div>

                            <p className="text-gray-500 mt-2">
                                Premium Collection
                            </p>

                            <div className="flex items-center gap-3 mt-5">

                                <span className="text-2xl font-bold">
                                    ₹{item.price}
                                </span>

                                <span className="text-gray-400 line-through">
                                    ₹{item.oldPrice}
                                </span>

                            </div>

                            <button
                                className="mt-6 w-full bg-[#0d2746] hover:bg-black text-white py-3 rounded-full flex items-center justify-center gap-2 transition"
                            >
                                <ShoppingBag size={18} />
                                Add to Cart
                            </button>

                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}