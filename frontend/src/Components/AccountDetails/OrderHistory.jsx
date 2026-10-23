import { useCallback, useEffect, useState } from "react";
import { apiClient, buildApiUrl, invalidateProductCache } from "../../services/api";
import OrderCard from "../orders/OrderCard";
import { useAuth } from "../../Context/AuthContext";

const normalizeOrder = (order) => ({
  ...order,
  id: order.id || order.orderId || order._id || "",
  items: Array.isArray(order.items)
    ? order.items.map((item) => {
        const imageValue = item.image || item.images?.[0] || item.productImage || item.imageUrl || "";
        const selectedColor = item.color || item.selectedColor || item.variant?.color || item.variant?.name || "";
        const selectedSize = item.size || item.selectedSize || item.variant?.size || "";

        return {
          ...item,
          image: imageValue,
          color: selectedColor,
          size: selectedSize,
          selectedColor,
          selectedSize,
          quantity: Number(item.quantity || item.qty || 1),
          price: Number(item.price || 0),
          brand: item.brand || item.productBrand || "",
          category: item.category || item.productCategory || "",
          material: item.material || item.productMaterial || "",
        };
      })
    : [],
  shippingAddress: order.shippingAddress || {},
  trackingHistory: Array.isArray(order.trackingHistory) ? order.trackingHistory : [],
  estimatedDelivery: order.estimatedDelivery || null,
  trackingNumber: order.trackingNumber || "",
  courier: order.courier || "Not Assigned",
  paymentMethod: order.paymentMethod || order.payment?.method || "Cash on Delivery",
  paymentStatus: order.paymentStatus || order.payment?.status || "Pending",
  transactionId: order.transactionId || order.payment?.transaction || order.razorpayPaymentId || "",
  razorpayOrderId: order.razorpayOrderId || "",
  razorpayPaymentId: order.razorpayPaymentId || "",
  createdAt: order.createdAt || new Date().toISOString(),
});

export default function OrderHistory() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const refreshOrdersFromBackend = useCallback(async () => {
    if (!user?.id) {
      setOrders([]);
      setIsLoading(false);
      setLoadError("Please sign in to view your orders.");
      return;
    }
    setIsLoading(true);
    setLoadError("");
    try {
      const { data } = await apiClient.get(buildApiUrl(`/api/orders/user/${encodeURIComponent(user.id)}`));
      const nextOrders = Array.isArray(data?.orders) ? data.orders.map(normalizeOrder) : [];
      setOrders(nextOrders);
    } catch (error) {
      console.error("Failed to load orders from backend", error);
      setOrders([]);
      setLoadError(error?.response?.data?.message || "Unable to load your orders. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void refreshOrdersFromBackend();
  }, [refreshOrdersFromBackend]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOrdersChanged = () => refreshOrdersFromBackend();

    window.addEventListener("haierah-order-created", handleOrdersChanged);
    window.addEventListener("haierah-order-cancelled", handleOrdersChanged);
    window.addEventListener("haierah-order-deleted", handleOrdersChanged);

    return () => {
      window.removeEventListener("haierah-order-created", handleOrdersChanged);
      window.removeEventListener("haierah-order-cancelled", handleOrdersChanged);
      window.removeEventListener("haierah-order-deleted", handleOrdersChanged);
    };
  }, [refreshOrdersFromBackend]);

  const handleCancelOrder = async (orderId) => {
    const normalizedId = String(orderId || "").trim();
    if (!normalizedId) return;

    const targetOrder = orders.find((order) => String(order.id || order.orderId || order._id || "") === normalizedId);
    const currentStatus = String(targetOrder?.status || "").trim();
    const cancellableStatuses = ["Pending", "Confirmed", "Processing"];

    if (!cancellableStatuses.includes(currentStatus)) {
      alert("This order can no longer be cancelled because it has already moved to shipping or delivery.");
      return;
    }

    try {
      const { data } = await apiClient.patch(buildApiUrl(`/api/orders/${encodeURIComponent(normalizedId)}/cancel`), { status: "Cancelled" });
      if (data?.order) {
        setOrders((current) => current.map((order) => (
          String(order.id || order.orderId || order._id || "") === normalizedId
            ? normalizeOrder({ ...order, ...data.order })
            : order
        )));
      }
      await refreshOrdersFromBackend();
      if (typeof window !== "undefined") {
        invalidateProductCache();
        window.dispatchEvent(new Event("haierah-order-cancelled"));
        window.dispatchEvent(new Event("haierah-order-created"));
      }
    } catch (error) {
      console.error("Failed to cancel order", error);
      alert(error?.response?.data?.message || "Unable to cancel this order right now.");
    }
  };

  const filteredOrders = orders.filter((order) => {
    const orderId = String(order.id || order.orderId || order._id || "").toLowerCase();
    const customerName = String(order.customer?.name || order.customerName || "").toLowerCase();

    const matchSearch =
      orderId.includes(search.toLowerCase()) ||
      customerName.includes(search.toLowerCase());

    const matchFilter = filter === "All" || order.status === filter;

    return matchSearch && matchFilter;
  });

  return (

    <div className="min-h-full bg-[#fafafa] py-8 md:pt-28 md:pb-20">

      <div className="mx-auto max-w-7xl px-0 sm:px-2 md:px-8">

        <h1 className="mb-7 text-4xl font-light sm:text-5xl md:mb-10">
          My Orders
        </h1>

        {/* SEARCH + FILTER */}
        <div className="mb-8 flex flex-col items-stretch gap-4 md:flex-row md:items-center md:justify-between">

          <input
            type="text"
            placeholder="Search all orders"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border px-4 py-3 outline-none md:w-[420px] md:px-5"
          />

          <div className="flex flex-wrap gap-2 sm:gap-3">

            <button
              onClick={() => setFilter("All")}
              className={`px-5 py-2 rounded-full ${
                filter === "All"
                  ? "bg-black text-white"
                  : "border"
              }`}
            >
              All
            </button>

            <button
              onClick={() => setFilter("Delivered")}
              className={`px-5 py-2 rounded-full ${
                filter === "Delivered"
                  ? "bg-black text-white"
                  : "border"
              }`}
            >
              Delivered
            </button>

            <button
              onClick={() => setFilter("Cancelled")}
              className={`px-5 py-2 rounded-full ${
                filter === "Cancelled"
                  ? "bg-black text-white"
                  : "border"
              }`}
            >
              Cancelled
            </button>

          </div>

        </div>

        {/* ORDERS */}
        {isLoading ? (
          <p role="status" className="mt-10 text-center text-gray-500">Loading your orders…</p>
        ) : loadError ? (
          <p role="alert" className="mt-10 text-center text-red-700">{loadError}</p>
        ) : filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <OrderCard
              key={order.id || order.orderId || order._id}
              order={order}
              onCancelOrder={handleCancelOrder}
            />
          ))
        ) : (
          <p className="text-gray-500 text-center mt-10">
            No orders found
          </p>
        )}

      </div>

    </div>

  );
}