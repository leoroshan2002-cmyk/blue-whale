import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ShoppingBag, Star } from "lucide-react";
import { fetchProducts } from "../services/api";
import { useCart } from "../Context/CartContext";
import { useRequireAuthAction } from "../hooks/useRequireAuthAction";
import { DEFAULT_IMAGE_FALLBACK, getSafeImageUrl } from "../utils/productImages";

export default function RecommendationPage() {
    const sliderRef = useRef(null);
    const [products, setProducts] = useState([]);
    const [loadError, setLoadError] = useState("");
    const { addToCart } = useCart();
    const { requireAuthAction } = useRequireAuthAction();

    useEffect(() => {
        let cancelled = false;
        fetchProducts()
            .then((items) => {
                if (!cancelled) {
                    setProducts(items.filter((item) => item.status !== "Inactive").slice(0, 8));
                    setLoadError("");
                }
            })
            .catch((error) => {
                if (!cancelled) {
                    console.error("Failed to load recommended products:", error);
                    setProducts([]);
                    setLoadError(error?.response?.data?.message || error?.message || "Unable to load recommendations.");
                }
            });
        return () => { cancelled = true; };
    }, []);

    const scroll = (value) => {
        sliderRef.current?.scrollBy({ left: value, behavior: "smooth" });
    };

    return (
        <section className="mt-20 w-full">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <p className="text-sm uppercase tracking-[5px] text-gray-500">Recommendations</p>
                    <h2 className="mt-2 font-serif text-5xl font-bold">You May Also Like</h2>
                </div>
                <div className="flex gap-3">
                    <button type="button" onClick={() => scroll(-320)} aria-label="Scroll recommendations left" className="h-12 w-12 rounded-full border transition hover:bg-black hover:text-white">
                        <ChevronLeft className="mx-auto" />
                    </button>
                    <button type="button" onClick={() => scroll(320)} aria-label="Scroll recommendations right" className="h-12 w-12 rounded-full border transition hover:bg-black hover:text-white">
                        <ChevronRight className="mx-auto" />
                    </button>
                </div>
            </div>
            {loadError ? (
                <p role="alert" className="py-8 text-gray-600">{loadError}</p>
            ) : products.length === 0 ? (
                <p className="py-8 text-gray-600">No recommendations are available right now.</p>
            ) : (
                <div ref={sliderRef} className="no-scrollbar flex gap-8 overflow-x-auto scroll-smooth pb-5">
                    {products.map((item) => {
                        const id = item.id || item._id;
                        const price = Number(item.discountPrice ?? item.salePrice ?? item.price ?? 0);
                        const image = getSafeImageUrl(item.images?.[0] || item.image, DEFAULT_IMAGE_FALLBACK);
                        return (
                            <motion.article key={id} whileHover={{ y: -10 }} transition={{ duration: 0.3 }} className="min-w-[280px] overflow-hidden rounded-3xl bg-white shadow-sm hover:shadow-xl">
                                <Link to={`/product/${id}`} className="block h-40 overflow-hidden">
                                    <img src={image} alt={item.name} loading="lazy" className="h-full w-full object-cover transition duration-500 hover:scale-110" onError={(event) => { event.currentTarget.src = DEFAULT_IMAGE_FALLBACK; }} />
                                </Link>
                                <div className="p-6">
                                    <div className="flex items-center justify-between gap-4">
                                        <Link to={`/product/${id}`} className="font-serif font-semibold">{item.name}</Link>
                                        {item.rating && <span className="flex items-center gap-2 text-sm font-medium"><Star size={16} className="fill-yellow-400 text-yellow-400" />{item.rating}</span>}
                                    </div>
                                    <p className="mt-2 text-gray-500">{item.subCategory || item.category}</p>
                                    <div className="mt-5 flex items-center gap-3">
                                        <span className="text-2xl font-bold">₹{price.toLocaleString("en-IN")}</span>
                                        {price < Number(item.price) && <span className="text-gray-400 line-through">₹{Number(item.price).toLocaleString("en-IN")}</span>}
                                    </div>
                                    <button type="button" disabled={Number(item.stock) <= 0} onClick={() => {
                                        if (requireAuthAction("addToCart", item)) addToCart(item);
                                    }} className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#0d2746] py-3 text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50">
                                        <ShoppingBag size={18} />
                                        {Number(item.stock) > 0 ? "Add to Cart" : "Out of Stock"}
                                    </button>
                                </div>
                            </motion.article>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
