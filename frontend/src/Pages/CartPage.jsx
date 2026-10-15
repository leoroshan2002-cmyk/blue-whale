
import { Link, useNavigate } from "react-router-dom";

import {
  Share2,
  Trash2,
  Minus,
  Plus,
  Truck,
  ShieldCheck,
  Award,
} from "lucide-react";

import { useCart } from "../Context/CartContext";
import { useAuth } from "../Context/AuthContext";
import PageBack from "../Components/CommonDetails/PageBack";

import cartBg from "../assets/home/reference/cart-bg.png";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, getTotalPrice } = useCart();
  const { user, isAuthReady } = useAuth();
  const navigate = useNavigate();

  const subtotal = getTotalPrice();
  const tax = subtotal * 0.05;
  const shipping = subtotal > 500 ? 0 : 40;
  const total = subtotal + shipping + tax;

  const formatPrice = (price) =>
    price.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const handleProceedToCheckout = () => {
    if (!cart.length || !isAuthReady) return;

    if (!user) {
      navigate("/login", {
        state: { from: { pathname: "/checkout" } },
        replace: true,
      });
      return;
    }

    navigate("/checkout");
  };

  const handleShareCart = async () => {
    const shareData = {
      title: "Blue Whale Collection",
      text: "Explore my Blue Whale Collection cart.",
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareData.url);
      }
    } catch (error) {
      if (error?.name !== "AbortError") {
        console.error("Unable to share cart:", error);
      }
    }
  };

  return (
    <main className="bw-cart-page relative isolate min-h-screen overflow-x-clip text-[#102944]">
      {/* Fixed background: stays behind the entire scrolling page */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-[#f3e8d7]"
        style={{
          backgroundImage: `url("${cartBg}")`,
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* All cart content stays above the background */}
      <div className="relative z-10">
        {cart.length === 0 ? (
          <section className="flex min-h-screen items-center justify-center px-4 py-12">
            <div className="flex w-full max-w-2xl flex-col items-center rounded-xl border border-[#d8c6ab] bg-[#fffaf0]/80 px-5 py-12 text-center backdrop-blur-[2px] sm:px-10">
              <p className="mb-3 text-xs uppercase tracking-[0.3em] text-[#98703b]">
                Blue Whale Collection
              </p>

              <h1 className="font-serif text-4xl text-[#102944] sm:text-5xl">
                Your Cart Awaits
              </h1>

              <p className="mt-4 max-w-md text-sm leading-7 text-[#705e4b]">
                Discover timeless sarees and traditional dhotis crafted
                for your special moments.
              </p>

              <Link
                to="/products"
                className="mt-8 inline-flex items-center justify-center rounded-full bg-[#102944] px-8 py-4 text-sm text-white transition-colors hover:bg-[#234667]"
              >
                Explore the Collection
              </Link>
            </div>
          </section>
        ) : (
          <div className="mx-auto max-w-6xl px-3 pb-10 pt-5 sm:px-6 sm:pb-14 sm:pt-8 lg:px-8">
            {/* Back navigation */}
            <div className="mb-5">
              <PageBack />
            </div>

            {/* Page heading and actions */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.3em] text-[#98703b] sm:text-xs">
                  Blue Whale Collection
                </p>

                <h1 className="font-serif text-4xl font-medium tracking-tight text-[#102944] sm:text-5xl lg:text-6xl">
                  My Cart
                </h1>

                <p className="mt-2 font-serif text-sm italic text-[#594b3c] sm:text-base">
                  Timeless traditions. Yours to take home.
                </p>

                <div className="mt-4 flex items-center gap-3">
                  <span className="h-px w-9 bg-[#b58a4b]" />
                  <span className="text-sm text-[#b58a4b]">✦</span>
                  <span className="h-px w-9 bg-[#b58a4b]" />
                </div>

                <p className="mt-4 text-sm text-[#78654f]">
                  {cart.length} {cart.length === 1 ? "item" : "items"} selected
                  for you
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleShareCart}
                  className="inline-flex items-center gap-2 rounded-full border border-[#c6a875] bg-[#fffaf0]/85 px-4 py-3 text-sm transition-colors hover:bg-[#f0dfc3]"
                >
                  <Share2 size={16} />
                  Share Cart
                </button>

                <button
                  type="button"
                  onClick={handleProceedToCheckout}
                  disabled={!isAuthReady}
                  className="rounded-full bg-[#102944] px-5 py-3 text-sm tracking-wide text-white transition-colors hover:bg-[#234667] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  BUY ALL
                </button>
              </div>
            </div>

            {/* Product list and order summary */}
            <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.8fr)_minmax(280px,0.95fr)]">
              {/* Cart products */}
              <section className="min-w-0 rounded-xl border border-[#d8c6ab] bg-[#fffaf0]/80 p-3 backdrop-blur-[2px] sm:p-6">
                <div className="mb-2 flex items-center justify-between border-b border-[#e5d8c5] pb-4">
                  <h2 className="font-serif text-xl font-semibold sm:text-2xl">
                    Your Selection
                  </h2>

                  <span className="text-xs text-[#78654f] sm:text-sm">
                    {cart.length} {cart.length === 1 ? "item" : "items"}
                  </span>
                </div>

                <div>
                  {cart.map((item) => {
                    const itemId = item.cartItemKey || item.id;

                    return (
                      <article
                        key={itemId}
                        className="grid grid-cols-[76px_minmax(0,1fr)] gap-3 border-b border-[#e5d8c5] py-4 last:border-b-0 sm:grid-cols-[108px_minmax(0,1fr)_auto] sm:gap-5 sm:py-5"
                      >
                        {/* Product image */}
                        <div className="h-[104px] overflow-hidden rounded-lg bg-[#eadfce] sm:h-[126px]">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              loading="lazy"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center px-2 text-center text-xs text-[#78654f]">
                              Blue Whale Collection
                            </div>
                          )}
                        </div>

                        {/* Product details */}
                        <div className="min-w-0">
                          <h3 className="break-words font-serif text-base font-medium leading-snug sm:text-lg">
                            {item.name}
                          </h3>

                          <p className="mt-2 text-xs text-[#78654f] sm:text-sm">
                            Size: {item.selectedSize || "M"}
                            <span className="mx-1.5 sm:mx-2">|</span>
                            Color: {item.selectedColor || item.color || "Cream"}
                          </p>

                          <div className="mt-3 flex flex-wrap items-center gap-2 sm:gap-3">
                            {/* Quantity controls */}
                            <div className="inline-flex items-center overflow-hidden rounded-full border border-[#d6c3a6] bg-white/80">
                              <button
                                type="button"
                                aria-label={`Decrease quantity of ${item.name}`}
                                disabled={item.qty <= 1}
                                onClick={() =>
                                  updateQuantity(itemId, item.qty - 1)
                                }
                                className="p-2.5 transition-colors hover:bg-[#eee0ca] disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                <Minus size={12} />
                              </button>

                              <span className="min-w-7 text-center text-sm">
                                {item.qty}
                              </span>

                              <button
                                type="button"
                                aria-label={`Increase quantity of ${item.name}`}
                                onClick={() =>
                                  updateQuantity(itemId, item.qty + 1)
                                }
                                className="p-2.5 transition-colors hover:bg-[#eee0ca]"
                              >
                                <Plus size={12} />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeFromCart(itemId)}
                              aria-label={`Remove ${item.name} from cart`}
                              className="inline-flex items-center gap-1.5 rounded px-1 py-2 text-xs text-[#8e392d] transition-colors hover:text-red-800"
                            >
                              <Trash2 size={14} />
                              Remove
                            </button>
                          </div>
                        </div>

                        {/* Product price */}
                        <div className="col-span-2 flex items-center justify-between gap-3 sm:col-span-1 sm:block sm:text-right">
                          <span className="text-xs text-[#78654f] sm:hidden">
                            Item total
                          </span>

                          <p className="font-serif text-lg font-semibold sm:text-base lg:text-lg">
                            ₹{formatPrice(item.price * item.qty)}
                          </p>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>

              {/* Order summary */}
              <aside className="min-w-0 rounded-xl border border-[#243f59] bg-[#102944]/95 p-5 text-white sm:p-7 lg:sticky lg:top-24">
                <h2 className="font-serif text-2xl sm:text-3xl">
                  Order Summary
                </h2>

                <div className="my-5 flex items-center gap-2">
                  <span className="h-px flex-1 bg-[#b58a4b]/70" />
                  <span className="text-[#d6ac69]">⌁</span>
                  <span className="h-px flex-1 bg-[#b58a4b]/70" />
                </div>

                <div className="space-y-4 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-white/75">Subtotal</span>
                    <span>₹{formatPrice(subtotal)}</span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-white/75">Shipping</span>
                    <span>
                      {shipping === 0 ? "Free" : `₹${formatPrice(shipping)}`}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-white/75">Taxes (5%)</span>
                    <span>₹{formatPrice(tax)}</span>
                  </div>
                </div>

                <div className="my-5 border-t border-white/20" />

                <div className="flex items-center justify-between gap-3">
                  <span className="font-serif text-xl">Total</span>
                  <span className="text-right font-serif text-2xl font-semibold sm:text-3xl">
                    ₹{formatPrice(total)}
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-3 text-xs leading-5 text-white/65">
                  <Truck size={25} className="shrink-0 text-[#d6ac69]" />
                  <span>Free shipping on orders above ₹500.</span>
                </div>

                <button
                  type="button"
                  onClick={handleProceedToCheckout}
                  disabled={!isAuthReady}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#d8ae6b] px-5 py-4 text-sm font-medium text-[#102944] transition-colors hover:bg-[#e9c58a] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isAuthReady ? "Proceed to Checkout" : "Please wait..."}
                  <span aria-hidden="true">→</span>
                </button>

                <Link
                  to="/products"
                  className="mt-3 flex w-full items-center justify-center rounded-full border border-[#d8ae6b] px-5 py-3 text-sm text-white transition-colors hover:bg-white/10"
                >
                  Continue Shopping
                </Link>

                <div className="mt-6 grid grid-cols-3 divide-x divide-white/20">
                  <div className="flex flex-col items-center gap-2 px-1 text-center">
                    <ShieldCheck size={22} className="text-[#d8ae6b]" />
                    <span className="text-[10px] leading-4 text-white/80">
                      Secure Payments
                    </span>
                  </div>

                  <div className="flex flex-col items-center gap-2 px-1 text-center">
                    <Truck size={22} className="text-[#d8ae6b]" />
                    <span className="text-[10px] leading-4 text-white/80">
                      Fast Delivery
                    </span>
                  </div>

                  <div className="flex flex-col items-center gap-2 px-1 text-center">
                    <Award size={22} className="text-[#d8ae6b]" />
                    <span className="text-[10px] leading-4 text-white/80">
                      Premium Quality
                    </span>
                  </div>
                </div>
              </aside>
            </div>

            {/* No recommendations section */}
          </div>
        )}
      </div>
    </main>
  );
}
