export default function TrackingTimeline({ status }) {
  const steps = [
    { label: "Pending", key: "Pending", icon: "🛒" },
    { label: "Confirmed", key: "Confirmed", icon: "✓" },
    { label: "Processing", key: "Processing", icon: "⚙️" },
    { label: "Packed", key: "Packed", icon: "📦" },
    { label: "Shipped", key: "Shipped", icon: "🚚" },
    { label: "Out for Delivery", key: "Out for Delivery", icon: "🚛" },
    { label: "Delivered", key: "Delivered", icon: "✅" },
  ];

  const normalize = (value) => {
    const normalized = String(value || "").trim();
    const map = {
      Pending: "Pending",
      Confirmed: "Confirmed",
      Processing: "Processing",
      Packed: "Packed",
      Shipped: "Shipped",
      "Out for Delivery": "Out for Delivery",
      OutForDelivery: "Out for Delivery",
      Delivered: "Delivered",
      Cancelled: "Cancelled",
    };

    return map[normalized] || "Pending";
  };

  const cleanStatus = normalize(status);
  const currentIndex = steps.findIndex((step) => step.key === cleanStatus);
  const safeIndex = currentIndex >= 0 ? currentIndex : 0;

  return (
    <div className="bg-white border rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-6">Order Tracking</h3>

      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-[3px] bg-gray-200 rounded"></div>
        <div
          className="absolute left-4 top-0 w-[3px] bg-green-500 rounded transition-all duration-500"
          style={{
            height: `${cleanStatus === "Cancelled" ? 100 : (safeIndex / (steps.length - 1)) * 100}%`,
          }}
        />

        <div className="flex flex-col gap-8">
          {steps.map((step, index) => {
            const isDone = cleanStatus === "Cancelled"
              ? index <= 0
              : index <= safeIndex;
            const isActive = cleanStatus === "Cancelled"
              ? index === 0
              : index === safeIndex;

            return (
              <div key={step.key} className="flex items-center gap-4">
                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-full z-10 transition-all duration-300 ${
                    isDone ? "bg-green-500 text-white" : "bg-gray-200"
                  } ${isActive ? "ring-4 ring-green-100" : ""}`}
                >
                  {step.icon}
                </div>

                <div>
                  <p className={`font-medium ${isDone ? "text-black" : "text-gray-400"}`}>
                    {step.label}
                  </p>
                  {isActive && (
                    <p className="text-xs text-green-600">
                      {cleanStatus === "Cancelled" ? "Order cancelled" : "Current status"}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}