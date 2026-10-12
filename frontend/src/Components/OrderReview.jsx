import { Minus, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "../Context/CartContext";

export default function OrderReview() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
  } = useCart();

  return (
    <div className="p-5 sm:p-8">

      <h2 className="mb-6 text-2xl font-serif font-semibold sm:mb-8 sm:text-3xl">
        Review Your Order
      </h2>

      <div className="space-y-8">
        {cart.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center text-gray-500">
            Your cart is empty. Add items to review your order.
          </div>
        ) : (
          cart.map((item) => {
            const itemKey = item.cartItemKey || item.id || item._id;
            const sizeLabel = item.selectedSize || item.size || "M";
            const colorLabel = item.selectedColor || item.color || "Black";

            return (
              <motion.div
                whileHover={{ y: -3 }}
                key={itemKey}
                className="flex min-w-0 flex-col gap-4 rounded-3xl border p-4 sm:flex-row sm:gap-6 sm:p-5"
              >
                <img
                  src={item.image}
                  className="h-28 w-24 shrink-0 rounded-2xl object-cover sm:h-32 sm:w-28"
                  alt={item.name}
                />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="break-words text-xl font-serif font-semibold sm:text-2xl">
                        {item.name}
                      </h3>
                      <p className="text-gray-500 mt-2">Size : {sizeLabel}</p>
                      <p className="text-gray-500">Color : {colorLabel}</p>
                    </div>

                    <div className="text-xl font-bold sm:text-2xl">
                      ₹{((item.price || 0) * (item.qty || 0)).toFixed(2)}
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-4 sm:mt-6">
                    <div className="flex border rounded-full overflow-hidden">
                      <button
                        onClick={() => updateQuantity(itemKey, (item.qty || 1) - 1)}
                        className="px-4 py-2 hover:bg-gray-100"
                      >
                        <Minus size={16} />
                      </button>

                      <span className="px-5 py-2">{item.qty || 1}</span>

                      <button
                        onClick={() => updateQuantity(itemKey, (item.qty || 1) + 1)}
                        className="px-4 py-2 hover:bg-gray-100"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(itemKey)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

    </div>
  );
}