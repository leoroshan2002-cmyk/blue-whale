
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
  const { cart, isCartReady, cartError, removeFromCart, updateQuantity, getTotalPrice } = useCart();
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

  if (!isCartReady) {
    return (
      <section className="flex min-h-[calc(100dvh-80px)] items-center justify-center bg-[#fbf5eb] px-4">
        <p role="status" className="text-sm text-[#6b3019]">Loading your saved cart…</p>
      </section>
    );
  }

  if (cartError) {
    return (
      <section className="flex min-h-[calc(100dvh-80px)] items-center justify-center bg-[#fbf5eb] px-4">
        <p role="alert" className="text-center text-red-700">{cartError}</p>
      </section>
    );
  }

  if (cart.length === 0) {
    return (
      <div
  className="bw-heritage-cart flex min-h-[calc(100dvh-80px)] flex-col items-center justify-center px-4 text-center"
  style={{
    backgroundImage: "url('/cart.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundAttachment: "fixed",
  }}
>
        <h1 className="mb-4 text-4xl font-serif font-semibold text-[#4b2115] sm:text-5xl">
          Your Cart
        </h1>

        <p className="mb-8 text-gray-500">
          Your shopping cart is empty.
        </p>

        <Link
          to="/products"
          className="rounded-full border border-[#9a622d] bg-[#6b3019] px-8 py-4 text-white shadow-md transition duration-300 hover:bg-[#4b2115]"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
  

<section
  className="bw-heritage-cart relative min-h-screen overflow-hidden py-8 text-[#43271b] sm:py-12"
  style={{
    backgroundImage:
      "linear-gradient(rgba(65, 31, 14, 0.12), rgba(65, 31, 14, 0.12)), url('/cart.png')",
    backgroundSize: "cover",
    backgroundPosition: "center top",
    backgroundRepeat: "no-repeat",
    backgroundAttachment: "fixed",
  }}
>


      {/* Back Button */}
      <div className="mx-auto mb-4 max-w-6xl px-4 sm:px-6">
        <PageBack />
      </div>

      {/* Main Cart Container */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Cart Header */}
        <div className="mb-8 flex flex-col gap-5 border-b border-[#d8bd96] pb-6 md:mb-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.28em] text-[#986b42]">
              Blue Whale Collection · Your selection
            </p>

            <h1 className="font-serif text-4xl font-normal tracking-tight text-[#542817] sm:text-5xl lg:text-6xl">
              My Cart
            </h1>
          </div>

          <div className="flex flex-wrap gap-3 md:gap-4">
            <button
              type="button"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: "Blue Whale Collection",
                    text: "Explore my Blue Whale Collection cart.",
                    url: window.location.href,
                  }).catch(() => {});
                } else if (navigator.clipboard) {
                  navigator.clipboard
                    .writeText(window.location.href)
                    .catch(() => {});
                }
              }}
              className="flex items-center gap-2 rounded-full border border-[#c9a77d] bg-[#fffaf2] px-4 py-3 text-sm text-[#6b3019] transition hover:bg-[#f0dfc5] sm:px-6"
            >
              Share Cart
              <Share2 size={18} />
            </button>

            <button
              type="button"
              onClick={handleProceedToCheckout}
              className="rounded-full bg-[#6b3019] px-6 py-3 text-sm tracking-wide text-white transition hover:bg-[#4b2115] sm:px-8"
            >
              BUY ALL
            </button>
          </div>
        </div>

        {/* Cart Products and Order Summary */}
        <div className="grid gap-8 p-0 lg:grid-cols-3 lg:gap-6">
          {/* Left: Cart Items */}
          <div ref={cartLeftRef} className="lg:col-span-2">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-serif font-medium text-[#4b2115]">
                Your Selection
              </h2>

              <span className="text-sm text-[#8a6c54]">
                {cart.length} {cart.length === 1 ? "item" : "items"}
              </span>
            </div>

            <div className="space-y-4">
              {cart.map((item) => (
                <motion.div
                  key={item.cartItemKey || item.id}
                  whileHover={{ scale: 1.01 }}
                  className="flex flex-col gap-4 rounded-xl border border-[#d8b88c] bg-[#fffaf0]/95 p-4 shadow-[0_8px_30px_rgba(65,35,18,0.12)] transition sm:flex-row sm:gap-6 sm:p-5"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-36 w-32 shrink-0 rounded-xl border border-[#e3c9a5] object-cover sm:h-40 sm:w-36"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
                      <div className="min-w-0">
                        <h3 className="break-words font-serif text-xl font-medium leading-snug text-[#542817] sm:text-2xl">
                          {item.name}
                        </h3>

                        <p className="mt-2 text-sm text-[#8a6c54]">
                          Size: {item.selectedSize || "M"}
                        </p>

                        <p className="text-sm text-[#8a6c54]">
                          Color: {item.selectedColor || item.color || "Cream"}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-3">
                          <span className="text-sm text-[#755840]">
                            Quantity:
                          </span>

                          <div className="flex overflow-hidden rounded-full border border-[#c9a77d] bg-[#fffdf8]">
                            <button
                              type="button"
                              aria-label={`Decrease quantity of ${item.name}`}
                              onClick={() =>
                                updateQuantity(
                                  item.cartItemKey || item.id,
                                  item.qty - 1
                                )
                              }
                              disabled={item.qty <= 1}
                              className="px-3 py-1 transition hover:bg-[#f0dfc5] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              −
                            </button>

                            <span className="min-w-10 px-3 py-1 text-center text-sm">
                              {item.qty}
                            </span>

                            <button
                              type="button"
                              aria-label={`Increase quantity of ${item.name}`}
                              onClick={() =>
                                updateQuantity(
                                  item.cartItemKey || item.id,
                                  item.qty + 1
                                )
                              }
                              className="px-3 py-1 transition hover:bg-[#f0dfc5]"
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              removeFromCart(item.cartItemKey || item.id)
                            }
                            aria-label={`Remove ${item.name} from cart`}
                            className="rounded-full p-2 text-[#a42d22] transition hover:bg-[#f5e2d8] hover:text-red-700"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            removeFromCart(item.cartItemKey || item.id)
                          }
                          className="mt-4 text-sm text-[#8b4c25] underline underline-offset-4 transition hover:text-[#4b2115]"
                        >
                          Remove from Cart
                        </button>
                      </div>

                      <div className="shrink-0 text-2xl font-serif font-semibold text-[#6b3019] sm:text-right sm:text-3xl">
                        ₹{(item.price * item.qty).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: Order Summary */}
          <div ref={cartRightRef}>
            <motion.div
              whileHover={{ y: -4 }}
              className="w-full rounded-xl border-2 border-[#d8b88c] bg-[#fff8e9]/95 p-5 shadow-[0_12px_40px_rgba(65,35,18,0.16)] sm:p-7 lg:sticky lg:top-24"
            >
              <h2 className="mb-6 border-b border-[#d8b88c] pb-4 font-serif text-2xl font-medium text-[#542817] sm:text-3xl">
                Order Summary
              </h2>

              <div className="space-y-4 text-sm text-[#755840] sm:text-base">
                <div className="flex justify-between gap-4">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between gap-4">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Free" : `₹${shipping.toFixed(2)}`}</span>
                </div>

                <div className="flex justify-between gap-4">
                  <span>Taxes</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
              </div>

              <hr className="my-6 border-[#dfc8a8]" />

              <div className="flex justify-between gap-4 text-2xl font-semibold text-[#4b2115] sm:text-3xl">
                <span>Total</span>
                <span className="text-right">₹{total.toFixed(2)}</span>
              </div>

              <p className="mt-4 text-xs leading-5 text-[#8a6c54]">
                Shipping is free on orders above ₹500.
              </p>

              <button
                type="button"
                onClick={handleProceedToCheckout}
                disabled={!isAuthReady}
                className="mt-8 block w-full rounded-full border border-[#b17b3d] bg-gradient-to-r from-[#7a3b1d] via-[#8b4a24] to-[#6b3019] px-6 py-4 text-center font-medium tracking-wide text-[#fff8e9] shadow-[0_8px_18px_rgba(93,43,19,0.2)] transition duration-300 hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isAuthReady ? "Proceed to Checkout" : "Please wait..."}
              </button>

              <Link
                to="/products"
                className="mt-4 block text-center text-sm text-[#8b4c25] underline underline-offset-4 transition hover:text-[#4b2115]"
              >
                Continue Shopping
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Recommended Products */}
        <div className="mt-12 lg:mt-16">
          <RecommendationPage />
        </div>
      </div>
    </section>
  );
}
