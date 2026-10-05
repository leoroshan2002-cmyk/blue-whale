import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Share2, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { useCart } from "../Context/CartContext";
import { useAuth } from "../Context/AuthContext";
import RecommendationPage from "../Components/RecommendationPage";
import PageBack from "../Components/CommonDetails/PageBack";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, getTotalPrice } = useCart();
  const { user, isAuthReady } = useAuth();
  const navigate = useNavigate();
  const cartLeftRef = useRef(null);
  const cartRightRef = useRef(null);

  useEffect(() => {
    if (cart.length === 0) return;

    const left = cartLeftRef.current;
    const right = cartRightRef.current;

    if (!left || !right) return;

    const ctx = gsap.context(() => {
      gsap.from(left, {
        x: -80,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      });

      gsap.from(right, {
        x: 80,
        opacity: 0,
        duration: 1,
        delay: 0.2,
        ease: "power3.out",
      });
    });

    return () => ctx.revert();
  }, [cart.length]);

  const subtotal = getTotalPrice();
  const tax = subtotal * 0.05;
  const shipping = subtotal > 500 ? 0 : 40;
  const total = subtotal + shipping + tax;

  const handleProceedToCheckout = () => {
    if (cart.length === 0) return;
    if (!isAuthReady) return;

    if (!user) {
      navigate("/login", {
        state: { from: { pathname: "/checkout" } },
        replace: true,
      });
      return;
    }

    navigate("/checkout");
  };

  if (cart.length === 0) {
    return (
      <div className="flex min-h-[calc(100dvh-80px)] flex-col items-center justify-center bg-[#faf8f6] px-4 text-center">
        <h1 className="mb-4 text-4xl font-serif font-bold sm:text-5xl">
          Your Cart
        </h1>

        <p className="text-gray-500 mb-8">
          Your shopping cart is empty.
        </p>

        <Link
          to="/products"
          className="bg-[#0d2746] text-white px-8 py-4 rounded-full hover:bg-black duration-300"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-[#faf8f6] py-8 sm:py-12">

  {/* Back Button */}
  <div className="mx-auto mb-4 max-w-6xl px-4 sm:px-6">
    <PageBack />
  </div>

    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <div className="mb-8 flex flex-col md:mb-10 md:flex-row md:items-center md:justify-between">

          <h1 className="text-4xl font-serif sm:text-6xl">
            My Cart
          </h1>

          <div className="mt-5 flex flex-wrap gap-3 md:mt-0 md:gap-4">

            <button
              className="flex items-center gap-2 rounded-xl border px-4 py-3 text-sm transition hover:bg-gray-100 sm:px-6"
            >
              Share Cart
              <Share2 size={18} />
            </button>

            <button
              className="rounded-xl bg-black px-6 py-3 text-sm text-white transition hover:bg-neutral-800 sm:px-8"
            >
              BUY ALL
            </button>

          </div>

        </div>

        <div className="grid gap-8 p-0 lg:grid-cols-3 lg:gap-6">

          {/* LEFT */}


          <div ref={cartLeftRef} className="lg:col-span-2">

            {/* <h1 className="text-5xl font-serif font-bold">
              Your Cart
            </h1>

            <p className="text-gray-500 mt-2 mb-10">
              {cart.length} items in your cart
            </p> */}

            <div className="space-y-4">

              {cart.map((item) => (

                <motion.div
                  key={item.cartItemKey || item.id}
                  whileHover={{ scale: 1.01 }}
                  className="flex flex-col gap-4 border-t pt-5 sm:flex-row sm:gap-6 sm:pt-6"
                >

                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-32 w-28 shrink-0 rounded-lg object-cover sm:h-36 sm:w-32"
                  />

                  <div className="flex-1">

                    <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:justify-between">

                      <div>

                        <h2 className="break-words text-2xl font-serif font-semibold sm:text-3xl">
                          {item.name}
                        </h2>

                        <p className="text-gray-600 mt-2">
                          Size : {item.selectedSize || "M"}
                        </p>

                        <p className="text-gray-600">
                          Color : {item.selectedColor || item.color || "Cream"}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-3">

                          <span>Quantity :</span>

                          <div className="flex  rounded-full overflow-hidden">

                            <button
                              onClick={() =>
                                updateQuantity(item.cartItemKey || item.id, item.qty - 1)
                              }
                              className="px-3 py-1 hover:bg-gray-100"
                            >
                              -
                            </button>

                            <span className="px-4 py-1">
                              {item.qty}
                            </span>

                            <button
                              onClick={() =>
                                updateQuantity(item.cartItemKey || item.id, item.qty + 1)
                              }
                              className="px-3 py-1 hover:bg-gray-100"
                            >
                              +
                            </button>

                          </div>

                          <button
                            onClick={() => removeFromCart(item.cartItemKey || item.id)}
                            className="text-red-500"
                          >
                            <Trash2 size={18} />
                          </button>

                        </div>

                        <button className="underline mt-4 text-sm">
                          Save for Later
                        </button>

                      </div>

                      <div className="text-2xl font-serif font-bold sm:text-3xl">
                        ₹
                        {(item.price * item.qty).toFixed(2)}
                      </div>

                    </div>

                  </div>

                </motion.div>

              ))}

            </div>



          </div>


          {/* RIGHT */}


          <div ref={cartRightRef}>

            <motion.div
              whileHover={{ y: -4 }}
              className="w-full rounded-3xl bg-white p-5 shadow sm:p-8 lg:sticky lg:top-24"
            >

              <h2 className="mb-6 text-3xl font-serif font-bold sm:mb-8 sm:text-4xl">
                Order Summary
              </h2>

              <div className="space-y-4 text-base sm:text-lg">

                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{subtotal > 500 ? "Free" : "₹40"}</span>
                </div>

                <div className="flex justify-between">
                  <span>Taxes</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>

              </div>

              <hr className="my-6" />

              <div className="flex justify-between gap-4 text-2xl font-bold sm:text-3xl">

                <span>Total</span>

                <span>₹{total.toFixed(2)}</span>

              </div>

              {/* <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Promo Code
                </label>

                <div className="flex gap-3">
                  <input
                    value={promoCode}
                    onChange={(event) => setPromoCode(event.target.value)}
                    placeholder="Enter code"
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-0 transition focus:border-[#0d2746]"
                  />

                  <button
                    type="button"
                    className="rounded-xl bg-[#0d2746] px-4 py-3 text-sm font-medium text-white transition hover:bg-black"
                  >
                    Apply
                  </button>
                </div>
              </div> */}

              <button
                type="button"
                onClick={handleProceedToCheckout}
                className="mt-8 block w-full rounded-full bg-[#0d2746] px-6 py-4 text-center text-white transition hover:bg-black duration-300"
              >
                Proceed to Checkout
              </button>

            </motion.div>

          </div>



        </div>
        <div className="mt-8 lg:mt-0">
          <RecommendationPage />
        </div>

      </div>
    </section>
  );
}