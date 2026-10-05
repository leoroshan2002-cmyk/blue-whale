import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, ShoppingBag } from "lucide-react";

import { useCart } from "../../Context/CartContext";
import { useRequireAuthAction } from "../../hooks/useRequireAuthAction";

const recentProducts = [
  {
    id: 41,
    name: "Essential Cotton Tee",
    price: 999,
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=700",
    category: "Men",
  },
  {
    id: 42,
    name: "Oversized Hoodie",
    price: 1899,
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=700",
    category: "Women",
  },
  {
    id: 43,
    name: "Relaxed Fit Jeans",
    price: 1799,
    image:
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=700",
    category: "Denim",
  },
  {
    id: 44,
    name: "Linen Summer Shirt",
    price: 1499,
    image:
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=700",
    category: "Shirts",
  },
];

export default function RecentlyViewed() {
  const { addToCart } = useCart();
  const { requireAuthAction } = useRequireAuthAction();

  return (
    <section className="max-w-7xl mx-auto px-6 py-20">

      <div className="flex justify-between items-center mb-12">

        <div>
          <h2 className="text-5xl font-serif">
            Recently Viewed
          </h2>

          <p className="text-gray-500 mt-2">
            Continue shopping where you left off.
          </p>
        </div>

        <Eye size={30} />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

        {recentProducts.map((product) => (

          <motion.div
            key={product.id}
            whileHover={{ y: -8 }}
            className="group bg-white rounded-3xl overflow-hidden shadow"
          >

            <Link to={`/product/${product.id}`}>

              <img
                src={product.image}
                alt={product.name}
                className="h-[350px] w-full object-cover group-hover:scale-105 duration-500"
              />

            </Link>

            <div className="p-5">

              <span className="text-sm uppercase text-gray-500">
                {product.category}
              </span>

              <h3 className="text-2xl font-serif mt-2">
                {product.name}
              </h3>

              <p className="text-xl font-semibold mt-2">
                ₹{product.price}
              </p>

              <button
                onClick={() => {
                  if (!requireAuthAction("addToCart", product)) return;
                  addToCart(product);
                }}
                className="mt-5 w-full bg-black text-white py-3 rounded-xl flex justify-center items-center gap-2 hover:bg-neutral-800 transition"
              >
                <ShoppingBag size={18} />

                Add to Bag
              </button>

            </div>

          </motion.div>

        ))}

      </div>

    </section>
  );
}