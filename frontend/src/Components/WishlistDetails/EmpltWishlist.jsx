import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Heart,
  ShoppingBag,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function EmptyWishlist() {
    const navigate=useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">

      {/* Animated Icon */}

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          duration: 0.7,
          type: "spring",
        }}
        className="relative"
      >

        <div
          className="w-40 h-40 rounded-full
          bg-red-50
          flex items-center justify-center"
        >

          <Heart
            size={80}
            className="text-red-500 fill-red-500"
          />

        </div>

        {/* Floating Hearts */}

        <motion.div
          animate={{
            y: [-10, 10, -10],
            rotate: [-10, 10, -10],
          }}
          transition={{
            repeat: Infinity,
            duration: 4,
          }}
          className="absolute -top-4 -left-6"
        >
          ❤️
        </motion.div>

        <motion.div
          animate={{
            y: [10, -10, 10],
          }}
          transition={{
            repeat: Infinity,
            duration: 3,
          }}
          className="absolute -right-5 top-6"
        >
          ✨
        </motion.div>

      </motion.div>

      {/* Title */}

      <motion.h1
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: .3 }}
        className="text-5xl font-serif mt-10"
      >
        Your Wishlist is Empty
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: .5 }}
        className="text-gray-500 text-lg mt-6 max-w-xl leading-8"
      >
        Save your favorite clothing pieces here and
        never lose track of the styles you love.
        Start exploring our latest collections today.
      </motion.p>

      {/* Feature Cards */}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: .7 }}
        className="grid md:grid-cols-3 gap-6 mt-14"
      >

        <div className="bg-white rounded-2xl shadow p-6">

          <Heart
            className="text-red-500 mx-auto"
            size={32}
          />

          <h3 className="font-semibold mt-4">
            Save Favorites
          </h3>

          <p className="text-gray-500 text-sm mt-2">
            Keep track of your most-loved products.
          </p>

        </div>

        <div className="bg-white rounded-2xl shadow p-6">

          <ShoppingBag
            className="text-[#0d2746] mx-auto"
            size={32}
          />

          <h3 className="font-semibold mt-4">
            Shop Anytime
          </h3>

          <p className="text-gray-500 text-sm mt-2">
            Easily move wishlist items to your cart.
          </p>

        </div>

        <div className="bg-white rounded-2xl shadow p-6">

          <Sparkles
            className="text-yellow-500 mx-auto"
            size={32}
          />

          <h3 className="font-semibold mt-4">
            New Arrivals
          </h3>

          <p className="text-gray-500 text-sm mt-2">
            Discover fresh styles every week.
          </p>

        </div>

      </motion.div>

      {/* Buttons */}

      <div className="flex flex-wrap justify-center gap-5 mt-14">

      

          <motion.button
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{
              scale: .95,
            }}
            className="bg-[#0d2746]
            text-white
            px-8
            py-4
            rounded-full
            flex
            items-center
            gap-3
            hover:bg-black
            transition"
            onClick={()=>navigate(-1)}
          >

            <ShoppingBag size={20} />

            Continue Shopping

          </motion.button>

       

        <Link to="/category/new-arraival">

          <motion.button
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{
              scale: .95,
            }}
            className="border-2
            border-[#0d2746]
            text-[#0d2746]
            px-8
            py-4
            rounded-full
            flex
            items-center
            gap-3
            hover:bg-[#0d2746]
            hover:text-white
            transition"
          >

            Explore New Arrivals

            <ArrowRight size={20} />

          </motion.button>

        </Link>

      </div>

    </div>
  );
}