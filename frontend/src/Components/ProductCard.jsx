import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useWishlist } from "../Context/WhislistContext";
import { useRequireAuthAction } from "../hooks/useRequireAuthAction";
import { DEFAULT_IMAGE_FALLBACK, getSafeImageUrl, normalizeImageList } from "../utils/productImages";

const ProductCard = ({
    product,
    onAddToCart,
    onWishlist,
    showButtons = true,
}) => {
    const { isWishlisted } = useWishlist();
    const { requireAuthAction } = useRequireAuthAction();
    const sanitizedImages = normalizeImageList(product.images || [product.image]);
    const primaryImage = getSafeImageUrl(sanitizedImages[0] || product.image, DEFAULT_IMAGE_FALLBACK);
    const secondaryImage = getSafeImageUrl(sanitizedImages[1] || '', '');

    return (
        <motion.article
            whileHover={{ y: -6 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="group relative h-[310px] overflow-hidden rounded-[1.35rem] bg-white px-3 pb-3 pt-3 shadow-[0_10px_25px_rgba(28,35,40,0.04)] transition-shadow duration-300 group-hover:shadow-[0_18px_35px_rgba(28,35,40,0.12)] sm:h-[410px] sm:rounded-[1.65rem] sm:px-5 sm:pb-5 sm:pt-4"
        >
            <div className="absolute left-3 top-3 z-20 sm:left-5 sm:top-4">
                {/* Wishlist */}
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!requireAuthAction("toggleWishlist", product)) return;
                    onWishlist?.(product);
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5f6f7] transition hover:scale-105 sm:h-11 sm:w-11"
            >
                <Heart
                    className={`h-5 w-5 transition ${isWishlisted(product.id)
                        ? "fill-red-500 text-red-500"
                        : "text-gray-700 hover:text-red-500"
                        }`}
                />
            </button>

            </div>

            <span className="absolute right-3 top-3 z-20 flex items-center gap-1 rounded-full border border-orange-100 bg-[#fff8f1] px-2 py-1.5 text-[10px] font-medium text-[#343434] sm:right-5 sm:top-4 sm:px-3 sm:py-2 sm:text-xs">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400 sm:h-3.5 sm:w-3.5" />
                    {product.rating || "4.8"}
            </span>

            <Link to={`/product/${product.id}`} className="block">
                <div className="relative mt-1 h-[180px] overflow-hidden sm:h-[265px]">
                    <img
                        src={primaryImage}
                        alt={product.name}
                        className={`h-full w-full object-contain transition duration-700 group-hover:scale-[1.08] ${secondaryImage ? "group-hover:opacity-0" : ""}`}
                        onError={(e) => {
                            e.currentTarget.src = DEFAULT_IMAGE_FALLBACK;
                        }}
                    />
                    {secondaryImage && (
                        <img
                            src={secondaryImage}
                            alt={`${product.name} - Alternate view`}
                            className="absolute inset-0 h-full w-full object-contain opacity-0 transition duration-700 group-hover:scale-[1.08] group-hover:opacity-100"
                            loading="lazy"
                            onError={(e) => {
                                e.currentTarget.style.display = "none";
                            }}
                        />
                    )}
                </div>
            </Link>

            <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2 sm:inset-x-5 sm:bottom-5 sm:gap-3">
                <div className="min-w-0">
                    <Link to={`/product/${product.id || product._id}`} className="block truncate text-[13px] font-medium text-[#3e4246] hover:text-[#946b4c] sm:text-[15px]">{product.name}</Link>
                    <Link to={`/product/${product.id || product._id}`} className="mt-1 inline-block text-[10px] font-semibold tracking-[.13em] text-[#7d624b] underline underline-offset-4 sm:text-xs">VIEW PRODUCT DETAILS ↗</Link>
                    <div className="mt-1 flex items-baseline gap-2">
                        <span className="text-[16px] font-semibold text-[#e64f00] sm:text-[21px]">₹{product.discountPrice || product.price}</span>
                        {product.discountPrice && (
                            <span className="text-[11px] text-[#777] line-through sm:text-sm">₹{product.price}</span>
                        )}
                    </div>
                </div>

                {showButtons && (
                    <button
                        type="button"
                        aria-label={`Add ${product.name} to cart`}
                        onClick={() => {
                            if (!requireAuthAction("addToCart", product)) return;
                            onAddToCart?.(product);
                        }}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#20252a] transition duration-300 hover:scale-110 group-hover:bg-[#ed7818] group-hover:text-white sm:h-10 sm:w-10"
                    >
                        <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.8} />
                    </button>
                )}
            </div>

            </motion.article>
    );
};

export default ProductCard;