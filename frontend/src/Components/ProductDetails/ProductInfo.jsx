import { motion } from "framer-motion";
import {
  Star,
  Heart,
  Truck,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";

export default function ProductInfo({
  product,
  selectedColor,
  selectedSize,
  quantity,
  setQuantity,
  addToCart,
  addToWishlist,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-7"
    >
      {/* Category */}

      <span className="uppercase tracking-[4px] text-sm text-gray-500">
        {product.category}
      </span>

      {/* Name */}

      <h1 className="text-5xl font-serif">
        {product.name}
      </h1>

      {/* Rating */}

      <div className="flex items-center gap-2">
        <div className="flex text-yellow-500">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={18}
              fill="currentColor"
            />
          ))}
        </div>

        <span className="text-gray-500">
          (128 Reviews)
        </span>
      </div>

      {/* Price */}

      <div className="flex items-center gap-4">
        <h2 className="text-4xl font-bold">
          ₹{product.price}
        </h2>

        <span className="line-through text-gray-400 text-xl">
          ₹{product.originalPrice}
        </span>

        <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm">
          {product.discount}% OFF
        </span>
      </div>

      {/* Short Description */}

      <p className="text-gray-600 leading-7">
        {product.desc}
      </p>

      {/* Selected Options */}

      <div className="space-y-2">
        <p>
          <span className="font-semibold">
            Color :
          </span>{" "}
          {selectedColor}
        </p>

        <p>
          <span className="font-semibold">
            Size :
          </span>{" "}
          {selectedSize}
        </p>
      </div>

      {/* Quantity */}

      <div className="flex items-center gap-5">

        <span className="font-medium">
          Quantity
        </span>

        <div className="flex border rounded-xl overflow-hidden">

          <button
            onClick={() =>
              setQuantity(Math.max(1, quantity - 1))
            }
            className="px-4 py-2 hover:bg-gray-100"
          >
            −
          </button>

          <span className="px-5 py-2">
            {quantity}
          </span>

          <button
            onClick={() =>
              setQuantity(quantity + 1)
            }
            className="px-4 py-2 hover:bg-gray-100"
          >
            +
          </button>

        </div>

      </div>

      {/* Buttons */}

      <div className="flex gap-4">

        <button
          onClick={addToCart}
          className="flex-1 bg-[#0d2746] text-white py-4 rounded-xl font-medium hover:bg-black duration-300"
        >
          Add to Cart
        </button>

        <button
          className="w-14 h-14 border rounded-xl flex items-center justify-center hover:bg-red-50"
          onClick={addToWishlist}
        >
          <Heart />
        </button>

      </div>

      {/* Buy Now */}

      <button className="w-full py-4 rounded-xl border-2 border-[#0d2746] text-[#0d2746] hover:bg-[#0d2746] hover:text-white duration-300">
        Buy Now
      </button>

      {/* Features */}

      <div className="border-t pt-6 space-y-4">

        <div className="flex items-center gap-3">
          <Truck size={20} />
          <span>Free Shipping on orders above ₹999</span>
        </div>

        <div className="flex items-center gap-3">
          <RotateCcw size={20} />
          <span>7 Days Easy Return</span>
        </div>

        <div className="flex items-center gap-3">
          <ShieldCheck size={20} />
          <span>100% Original Product</span>
        </div>

      </div>
    </motion.div>
  );
}