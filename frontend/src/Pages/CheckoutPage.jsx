
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Truck,
  Award,
  LockKeyhole,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

import { useAuth } from "../Context/AuthContext";
import { useCart } from "../Context/CartContext";
import LoginSection from "../Components/CheckoutDetails/LoginSection";
import AddressSection from "../Components/CheckoutDetails/AddressSection";
import PaymentSection from "../Components/CheckoutDetails/PaymentMethod";
import DeliverySection from "../Components/CheckoutDetails/DeliverySection";
import OrderReview from "../Components/OrderReview";
import OrderSummary from "../Components/OrderSummary";
import PageBack from "../Components/CommonDetails/PageBack";

import cartHero from "../assets/home/reference/cart-hero.png";

function CheckoutBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        backgroundImage: `url("${cartHero}")`,
        backgroundSize: "cover",
        backgroundPosition: "center center",
        backgroundRepeat: "no-repeat",
        backgroundColor: "#f3e8d7",
      }}
    />
  );
}

function LoadingCheckout() {
  return (
    <section className="relative isolate min-h-screen">
      <CheckoutBackground />
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 h-10 w-52 animate-pulse rounded-lg bg-[#fffaf0]/80" />
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-8">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="space-y-4 rounded-2xl border border-[#d8c6ab] bg-[#fffaf0]/90 p-6"
              >
                <div className="h-6 w-40 animate-pulse rounded bg-[#e5d8c5]" />
                <div className="h-10 animate-pulse rounded bg-[#f0e5d5]" />
                <div className="h-10 animate-pulse rounded bg-[#f0e5d5]" />
              </div>
            ))}
          </div>
          <div className="h-96 animate-pulse rounded-2xl bg-[#102944]/90 lg:col-span-4" />
        </div>
      </div>
    </section>
  );
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user, isAuthReady } = useAuth();
  const { cart, isCartReady } = useCart();

  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState("Cash on Delivery");

  const [selectedDelivery, setSelectedDelivery] = useState({
    id: "standard",
    title: "Standard Delivery",
    time: "3 - 5 Business Days",
    price: "FREE",
  });

  const [orderCompleted, setOrderCompleted] = useState(false);

  useEffect(() => {
    if (!isAuthReady) return;

    if (!user) {
      navigate("/login", {
        state: { from: { pathname: "/checkout" } },
        replace: true,
      });
    }
  }, [isAuthReady, user, navigate]);

  if (!isAuthReady || !user || !isCartReady) {
    return <LoadingCheckout />;
  }

  if (cart.length === 0) {
    return (
      <section className="relative isolate flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
        <CheckoutBackground />

        <div className="relative z-10 w-full max-w-xl rounded-3xl border border-[#d8c6ab] bg-[#fffaf0]/95 p-8 text-center shadow-2xl backdrop-blur-md sm:p-12">
          <Sparkles className="mx-auto mb-5 text-[#b58a4b]" size={34} />

          <p className="text-xs uppercase tracking-[0.3em] text-[#98703b]">
            Blue Whale Collection
          </p>

          <h1 className="mt-4 font-serif text-4xl text-[#102944] sm:text-5xl">
            Your Cart Awaits
          </h1>

          <p className="mt-4 text-sm leading-7 text-[#705e4b]">
            Discover timeless sarees and traditional collections made
            for your special moments.
          </p>

          <Link
            to="/products"
            className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#102944] px-8 py-4 text-sm text-white transition hover:bg-[#234667]"
          >
            Explore the Collection <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="bw-checkout relative isolate min-h-screen overflow-x-clip text-[#102944]">
      <CheckoutBackground />

      <style>{`
        .bw-checkout {
          --bw-navy: #102944;
          --bw-gold: #c49a58;
          --bw-cream: #fffaf0;
          --bw-border: #dfccb0;
        }

        .bw-checkout .checkout-panel {
          background: rgba(255, 250, 240, 0.91);
          border: 1px solid var(--bw-border);
          border-radius: 20px;
          box-shadow: 0 14px 45px rgba(35, 31, 24, 0.10);
          backdrop-filter: blur(12px);
        }

        .bw-checkout .checkout-heading {
          font-family: serif, 'Times New Roman', serif;
          letter-spacing: -0.045em;
          font-weight: 500;
        }

        /* Restyle existing child sections without replacing their logic. */
        .bw-checkout .checkout-details > * {
          border-color: #e7d9c5 !important;
        }

        .bw-checkout .checkout-details input,
        .bw-checkout .checkout-details select,
        .bw-checkout .checkout-details textarea {
          max-width: 100%;
          min-width: 0;
          border-radius: 10px;
        }

        .bw-checkout .checkout-details button {
          overflow-wrap: anywhere;
        }

        /* Make product photos fully visible in both review and summary. */
        .bw-checkout .checkout-product-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: center;
        }

        .bw-checkout .right-side img {
          object-fit: contain !important;
          object-position: center !important;
        }

        /* Improve the summary's form and coupon controls. */
        .bw-checkout .right-side input,
        .bw-checkout .right-side select {
          box-sizing: border-box;
          min-width: 0;
          max-width: 100%;
        }

        .bw-checkout .right-side input {
          color: #102944;
          background: #fffdf8;
        }

        .bw-checkout .right-side button {
          max-width: 100%;
          overflow-wrap: anywhere;
        }

        .bw-checkout .right-side input::placeholder {
          color: #897d6c;
          opacity: 1;
        }

        @media (max-width: 640px) {
          .bw-checkout .checkout-panel {
            border-radius: 15px;
          }

          .bw-checkout .checkout-details {
            min-width: 0;
          }

          .bw-checkout .checkout-details > * {
            max-width: 100%;
          }

          .bw-checkout .right-side {
            min-width: 0;
            width: 100%;
          }

          .bw-checkout .right-side > div {
            position: static;
          }

          .bw-checkout .right-side img {
            max-width: 100%;
          }

          .bw-checkout .checkout-heading {
            letter-spacing: -0.035em;
          }
          
/* Match checkout typography with the Cart page */
.bw-checkout .checkout-details {
  font-family: Georgia, "Times New Roman", serif;
}

/* Account Details, Shipping Address, Payment Method headings */
.bw-checkout .checkout-details h1,
.bw-checkout .checkout-details h2,
.bw-checkout .checkout-details h3,
.bw-checkout .checkout-details h4 {
  font-family: Georgia, "Times New Roman", serif !important;
  font-weight: 500;
  letter-spacing: -0.025em;
  color: #102944;
}

/* User details, address information and descriptive text */
.bw-checkout .checkout-details p,
.bw-checkout .checkout-details span,
.bw-checkout .checkout-details label {
  font-family: Georgia, "Times New Roman", serif;
}

/* Form fields */
.bw-checkout .checkout-details input,
.bw-checkout .checkout-details select,
.bw-checkout .checkout-details textarea {
  font-family: Georgia, "Times New Roman", serif;
  font-size: 15px;
}

/* Buttons */
.bw-checkout .checkout-details button {
  font-family: Georgia, "Times New Roman", serif;
}

        }
      `}</style>

      <div className="relative z-10">
        {/* Navigation */}
        <div className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 lg:px-8">
          <PageBack />
        </div>

        {/* Editorial checkout header */}
        <div className="mx-auto max-w-7xl px-4 pb-12 pt-7 sm:px-6 sm:pt-10 lg:px-8">
          <motion.header
            className="mb-8 flex flex-wrap items-end justify-between gap-5 sm:mb-10"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.34em] text-[#98703b] sm:text-xs">
                Blue Whale Collection
              </p>

              <h1 className="checkout-heading text-5xl text-[#102944] sm:text-6xl lg:text-7xl">
                Checkout
              </h1>

              <p className="mt-3 font-serif text-base italic text-[#594b3c] sm:text-lg">
                Timeless traditions. Yours to take home.
              </p>

              <div className="mt-5 flex items-center gap-3">
                <span className="h-px w-12 bg-[#b58a4b]" />
                <span className="text-sm text-[#b58a4b]">✦</span>
                <span className="h-px w-12 bg-[#b58a4b]" />
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-full border border-[#c6a875] bg-[#fffaf0]/90 px-5 py-3 text-sm text-[#102944] shadow-sm backdrop-blur-md">
              <LockKeyhole size={16} className="text-[#98703b]" />
              Secure Checkout
            </div>
          </motion.header>

          
{/* Main checkout grid */}
<div className="grid min-w-0 grid-cols-1 items-start gap-5 lg:grid-cols-12 lg:gap-7">

  {/* LEFT: Existing backend-connected information */}
  <motion.div
    className="checkout-details min-w-0 w-full lg:col-span-8"
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    {orderCompleted ? (
      <div className="rounded-2xl border border-[#dfccb0] bg-[#fffaf0]/95 p-8 text-center">
        <h2 className="font-serif text-3xl text-[#102944]">
          Order Received
        </h2>
        <p className="mt-4 text-[#705e4b]">
          Thank you for your purchase.
        </p>
      </div>
    ) : (
      <div className="overflow-hidden rounded-2xl border border-[#dfccb0] bg-[#fffaf0]/90 shadow-xl backdrop-blur-md">

        {/* Do not remove or replace these existing components */}
        <LoginSection />
        <AddressSection />

        <PaymentSection
          selectedMethodValue={selectedPaymentMethod}
          onSelectMethod={setSelectedPaymentMethod}
        />

        <DeliverySection
          onSelectDelivery={setSelectedDelivery}
        />

        <OrderReview />

      </div>
    )}
  </motion.div>

  {/* RIGHT: Existing order summary and product images */}
  {!orderCompleted && (
    <motion.aside
      className="right-side min-w-0 w-full lg:col-span-4"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className="min-w-0 overflow-hidden rounded-2xl border border-[#c49a58]/40 bg-[#102944]/[0.97] p-4 text-white shadow-2xl sm:p-6 lg:sticky lg:top-24">

        <p className="text-[10px] uppercase tracking-[0.3em] text-[#d8ae6b]">
          Blue Whale Collection
        </p>

        <h2 className="mt-2 font-serif text-2xl sm:text-3xl">
          Order Summary
        </h2>

        <div className="my-5 flex items-center gap-2">
          <span className="h-px flex-1 bg-[#b58a4b]/70" />
          <span className="text-[#d6ac69]">⌁</span>
          <span className="h-px flex-1 bg-[#b58a4b]/70" />
        </div>

        {/* Preserve the existing coupon, totals and order functionality */}
        <div className="min-w-0 overflow-hidden rounded-xl bg-[#fffaf0] p-3 text-[#102944] sm:p-4">
          <OrderSummary
            selectedPaymentMethod={selectedPaymentMethod}
            selectedDelivery={selectedDelivery}
            onPaymentError={(message) => console.warn(message)}
            onOrderComplete={() => setOrderCompleted(true)}
          />
        </div>

        <div className="mt-5 grid grid-cols-3 divide-x divide-white/20 border-t border-white/15 pt-5">
          <div className="px-1 text-center">
            <ShieldCheck className="mx-auto mb-2 text-[#d8ae6b]" size={21} />
            <span className="text-[10px] leading-4 text-white/80">
              Secure Payments
            </span>
          </div>

          <div className="px-1 text-center">
            <Truck className="mx-auto mb-2 text-[#d8ae6b]" size={21} />
            <span className="text-[10px] leading-4 text-white/80">
              Fast Delivery
            </span>
          </div>

          <div className="px-1 text-center">
            <Award className="mx-auto mb-2 text-[#d8ae6b]" size={21} />
            <span className="text-[10px] leading-4 text-white/80">
              Premium Quality
            </span>
          </div>
        </div>

      </div>
    </motion.aside>
  )}
</div>

        </div>
      </div>
    </section>
  );
}
