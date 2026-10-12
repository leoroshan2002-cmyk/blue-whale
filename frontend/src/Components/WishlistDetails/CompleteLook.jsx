import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ShoppingBag, Heart } from "lucide-react";

const products = [
  {
    id: 1,
    name: "Structured Blazer",
    category: "Outerwear",
    price: 3499,
    image:
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600",
  },
  {
    id: 2,
    name: "Slim Fit Chinos",
    category: "Bottom Wear",
    price: 1899,
    image:
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600",
  },
  {
    id: 3,
    name: "Premium Cotton Shirt",
    category: "Shirts",
    price: 1599,
    image:
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600",
  },
  {
    id: 4,
    name: "Classic Denim Jacket",
    category: "Jackets",
    price: 2799,
    image:
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600",
  },
];

export default function CompleteLook() {
  const cardsRef = useRef([]);

  useEffect(() => {
    gsap.from(cardsRef.current, {
      opacity: 0,
      y: 60,
      stagger: 0.15,
      duration: 0.8,
      ease: "power3.out",
    });
  }, []);

  return (
    <section className="mt-24">

      <div className="flex justify-between items-end mb-10">

        <div>
          <h2 className="text-5xl font-serif font-semibold">
            Complete the Look
          </h2>

          <p className="text-gray-500 mt-3">
            Hand-picked pieces that perfectly match your wishlist.
          </p>
        </div>

        <button className="text-[#0d2746] font-semibold hover:underline">
          View All →
        </button>

      </div>

      <div className="grid md:grid-cols-4 gap-8">

        {products.map((item, index) => (
          <motion.div
            key={item.id}
            ref={(el) => (cardsRef.current[index] = el)}
            whileHover={{ y: -8 }}
            className="group bg-white rounded-3xl overflow-hidden shadow hover:shadow-xl transition"
          >

            <div className="relative overflow-hidden">

              <img
                src={item.image}
                alt={item.name}
                className="w-full h-80 object-cover group-hover:scale-110 duration-500"
              />

              <button
                className="absolute top-4 right-4
                           w-10 h-10
                           rounded-full
                           bg-white
                           shadow
                           flex
                           items-center
                           justify-center
                           hover:bg-red-500
                           hover:text-white
                           transition"
              >
                <Heart size={18} />
              </button>

            </div>

            <div className="p-5">

              <span className="text-sm text-gray-500">
                {item.category}
              </span>

              <h3 className="text-xl font-semibold mt-2">
                {item.name}
              </h3>

              <p className="text-2xl font-bold text-[#0d2746] mt-3">
                ₹{item.price}
              </p>

              <motion.button
                whileTap={{ scale: 0.95 }}
                className="mt-5
                           w-full
                           bg-[#0d2746]
                           text-white
                           rounded-xl
                           py-3
                           flex
                           items-center
                           justify-center
                           gap-2
                           hover:bg-black
                           duration-300"
              >
                <ShoppingBag size={18} />
                Add to Bag
              </motion.button>

            </div>

          </motion.div>
        ))}

      </div>
    </section>
  );
}