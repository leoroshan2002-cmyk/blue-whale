import { motion } from "framer-motion";
import { ShoppingBag, Heart } from "lucide-react";
import { useWishlist } from "../Context/WhislistContext";
import { useCart } from "../Context/CartContext";
import { useRequireAuthAction } from "../hooks/useRequireAuthAction";

export default function RecommendationCard({ product }) {
  const { addToCart } = useCart();
  const { requireAuthAction } = useRequireAuthAction();

  const {
    toggleWishlist,
    isWishlisted,
  } = useWishlist();

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="group bg-white rounded-3xl overflow-hidden shadow hover:shadow-xl"
    >
      {/* Image */}

      <div className="relative overflow-hidden">

        <img
          src={product.image}
          alt={product.name}
          className="w-full h-80 object-cover group-hover:scale-105 duration-500"
        />

        {/* Wishlist */}

        <button
          onClick={() => {
            if (!requireAuthAction("toggleWishlist", product)) return;
            toggleWishlist(product);
          }}
          className="absolute top-4 right-4
          w-10 h-10 rounded-full
          bg-white shadow
          flex items-center justify-center
          hover:bg-red-500 hover:text-white
          duration-300"
        >
          <Heart
            size={18}
            className={
              isWishlisted(product.id)
                ? "fill-red-500 text-red-500"
                : ""
            }
          />
        </button>

        {/* Category */}

        <span
          className="absolute top-4 left-4
          bg-black/80 text-white
          px-3 py-1 rounded-full
          text-xs"
        >
          {product.category}
        </span>

      </div>

      {/* Content */}

      <div className="p-5">

        <h3 className="text-xl font-semibold">
          {product.name}
        </h3>

        <p className="text-gray-500 mt-2">
          {product.brand}
        </p>

        <div className="flex items-center justify-between mt-4">

          <span className="text-2xl font-bold text-[#0d2746]">
            ₹{product.price}
          </span>

          {product.oldPrice && (
            <span className="text-gray-400 line-through">
              ₹{product.oldPrice}
            </span>
          )}

        </div>

        {/* Rating */}

        <div className="flex items-center gap-1 mt-3">

          {"★★★★★".split("").map((star, index) => (
            <span
              key={index}
              className="text-yellow-500"
            >
              {star}
            </span>
          ))}

          <span className="text-sm text-gray-500 ml-2">
            ({product.reviews})
          </span>

        </div>

        {/* Button */}

        <motion.button
          whileTap={{ scale: .95 }}
          onClick={() => {
            if (!requireAuthAction("addToCart", product)) return;
            addToCart(product);
          }}
          className="mt-6 w-full
          bg-[#0d2746]
          text-white
          rounded-xl
          py-3
          flex items-center justify-center gap-2
          hover:bg-black duration-300"
        >
          <ShoppingBag size={18} />

          Add to Bag

        </motion.button>

      </div>
    </motion.div>
  );
}