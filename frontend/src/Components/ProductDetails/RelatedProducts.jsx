import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  Heart,
  Eye,
} from "lucide-react";

import { useCart } from "../../Context/CartContext";
import { useWishlist } from "../../Context/WhislistContext";
import { useRequireAuthAction } from "../../hooks/useRequireAuthAction";

const relatedProducts = [
  {
    id: 31,
    name: "Premium Oxford Shirt",
    price: 1599,
    image:
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=700",
    category: "Men",
  },
  {
    id: 32,
    name: "Relaxed Fit Hoodie",
    price: 1999,
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=700",
    category: "Men",
  },
  {
    id: 33,
    name: "Classic Denim Jacket",
    price: 2499,
    image:
      "https://images.unsplash.com/photo-1542272604-787c62d465d1?w=700",
    category: "Outerwear",
  },
  {
    id: 34,
    name: "Slim Fit Chinos",
    price: 1799,
    image:
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=700",
    category: "Bottom Wear",
  },
];

export default function RelatedProducts() {
  const { addToCart } = useCart();
  const { requireAuthAction } = useRequireAuthAction();

  const {
    toggleWishlist,
    removeFromWishlist,
    isWishlisted,
  } = useWishlist();

  return (
    <section className="w-full max-w-7xl mx-auto px-6 py-20">

      <div className="w-full h-full">

        <div>

          <h2 className="text-5xl font-serif">
            You May Also Like
          </h2>

          <p className="text-gray-500 mt-2">
            Discover similar styles picked for you.
          </p>

        </div>

        <Link
          to="/products"
          className="text-lg font-medium hover:underline"
        >
          View All →
        </Link>

      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

        {relatedProducts.map((product) => (

          <motion.div
            key={product.id}
            whileHover={{ y: -8 }}
            transition={{ duration: 0.3 }}
            className="group overflow-hidden rounded-3xl shadow-xl bg-white"
          >

            <div className="relative h-80 overflow-hidden bg-slate-900">
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

              <div className="absolute left-6 bottom-6 right-6 text-white">
                <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-slate-100 mb-3">
                  {product.category}
                </span>
                <h3 className="text-2xl font-serif font-semibold leading-tight">
                  {product.name}
                </h3>
                <p className="mt-2 text-lg font-semibold">₹{product.price}</p>
              </div>

              <button
                onClick={() => {
                  if (!requireAuthAction("toggleWishlist", product)) return;
                  isWishlisted(product.id)
                    ? removeFromWishlist(product.id)
                    : toggleWishlist(product);
                }}
                className="absolute top-4 right-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 shadow transition hover:bg-white"
              >
                <Heart
                  size={18}
                  className={
                    isWishlisted(product.id)
                      ? "fill-red-500 text-red-500"
                      : "text-slate-800"
                  }
                />
              </button>
            </div>

            <div className="border-t border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between gap-3">
                <Link
                  to={`/product/${product.id}`}
                  className="text-sm font-semibold text-slate-700 hover:text-black"
                >
                  View details
                </Link>
                <button
                  onClick={() => {
                    if (!requireAuthAction("addToCart", product)) return;
                    addToCart(product);
                  }}
                  className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Add
                </button>
              </div>
            </div>

          </motion.div>

        ))}

      </div>

    </section>
  );
}