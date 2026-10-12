import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function OrderSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const orderId = location.state?.orderId || "N/A";

  return (
    <section className="min-h-screen bg-[#faf8f6] px-6 py-20 flex items-center justify-center">
      <div className="w-full max-w-2xl rounded-3xl border border-emerald-200 bg-white p-10 text-center shadow-xl">
        <div className="flex justify-center">
          <CheckCircle2 size={90} className="text-emerald-600" />
        </div>
        <h1 className="mt-6 text-4xl font-semibold text-gray-900">Order placed successfully</h1>
        <p className="mt-4 text-lg text-gray-600">
          Your order is confirmed and will be processed shortly.
        </p>
        <p className="mt-2 text-sm text-gray-500">Order ID: {orderId}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => navigate("/orders")}
            className="rounded-full bg-[#0d2746] px-6 py-3 text-white font-medium"
          >
            View Orders
          </button>
          <button
            type="button"
            onClick={() => navigate("/products")}
            className="rounded-full border border-gray-300 px-6 py-3 font-medium text-gray-700"
          >
            Continue Shopping
            <ArrowRight className="ml-2 inline" size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
