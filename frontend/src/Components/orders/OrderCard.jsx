import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import TrackingTimeline from "./TrackingTimeline";
import { resolveBackendImageUrl } from "../../services/api";

const escapeHtml = (value) => String(value ?? "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#039;");

export default function OrderCard({ order, onDeleteOrder, onCancelOrder }) {
  const timelineRef = useRef(null);
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);
  const [shouldScrollToTracking, setShouldScrollToTracking] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (!showDetails || !shouldScrollToTracking) return;

    timelineRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setShouldScrollToTracking(false);
  }, [showDetails, shouldScrollToTracking]);

  if (!order || !order.items) return null;

  const resolveImageUrl = (image) => resolveBackendImageUrl(image);

  const getItemQuantity = (item) => Number(item.quantity ?? item.qty ?? 1) || 1;
  const getItemUnitPrice = (item) => Number(item.price ?? 0) || 0;
  const getItemTotal = (item) => getItemUnitPrice(item) * getItemQuantity(item);
  const itemSubtotal = order.items.reduce((sum, item) => sum + getItemTotal(item), 0);
  const itemCount = order.items.reduce((sum, item) => sum + getItemQuantity(item), 0);
  const orderSubtotal = Number(order.subtotal) > 0 ? Number(order.subtotal) : itemSubtotal;
  const orderTotal = Number(order.total ?? 0) || 0;
  const couponDiscount = Number(order.couponDiscount ?? 0) || 0;
  const deliveryCost = Number(order.deliveryCost ?? 0) || 0;
  const shippingCost = Number(order.shipping ?? 0) || 0;
  const savedTax = Number(order.tax ?? 0) || 0;
  const orderTax = savedTax > 0
    ? savedTax
    : Math.max(0, orderTotal - orderSubtotal + couponDiscount - deliveryCost - shippingCost);

  const handleBuyAgain = () => {
    navigate("/products");
    setFeedback("Redirecting you to products to reorder this item.");
  };

  const getAddressText = () => {
    const shippingAddress = order?.shippingAddress || {};
    const addressParts = [
      shippingAddress.fullName,
      shippingAddress.address || shippingAddress.street,
      shippingAddress.city,
      shippingAddress.state,
      shippingAddress.pincode || shippingAddress.zip,
      shippingAddress.country,
    ].filter(Boolean);

    return addressParts.join(", ") || order?.customerAddressText || order?.customer?.address || "Address not available";
  };

  const getEstimatedDelivery = () => {
    if (!order?.estimatedDelivery) return "To be confirmed";
    const date = new Date(order.estimatedDelivery);
    return Number.isNaN(date.getTime()) ? "To be confirmed" : date.toLocaleDateString();
  };

  const handleDownloadInvoice = () => {
    const invoiceWindow = window.open("", "_blank", "width=900,height=1000");
    if (!invoiceWindow) {
      setFeedback("Please allow pop-ups to download your invoice.");
      return;
    }

    const customerName = order.shippingAddress?.fullName || order.customerName || "Customer";
    const customerEmail = order.customerEmail || "Not provided";
    const orderDate = order.date || new Date(order.createdAt || Date.now()).toLocaleDateString();
    const orderId = order.id || order.orderId || order._id || "N/A";
    const itemRows = order.items.map((item) => `
      <tr>
        <td>${escapeHtml(item.name || "Product")}</td>
        <td class="center">${getItemQuantity(item)}</td>
        <td class="right">₹${getItemUnitPrice(item).toFixed(2)}</td>
        <td class="right">₹${getItemTotal(item).toFixed(2)}</td>
      </tr>
    `).join("");

    invoiceWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>Invoice ${escapeHtml(orderId)}</title>
          <style>
            * { box-sizing: border-box; }
            body { margin: 0; background: #f3f4f6; color: #172033; font: 14px Arial, sans-serif; }
            .invoice { width: 210mm; min-height: 297mm; margin: 24px auto; padding: 22mm 18mm; background: white; }
            .top { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #0d2746; padding-bottom: 22px; }
            .brand { color: #0d2746; font-size: 30px; font-weight: 800; letter-spacing: 3px; }
            .label { color: #6b7280; font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }
            h1 { margin: 0; color: #0d2746; font-size: 28px; letter-spacing: 2px; }
            .meta { margin-top: 10px; color: #4b5563; line-height: 1.8; text-align: right; }
            .addresses { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; margin: 42px 0; }
            .address { line-height: 1.8; }
            .address strong { display: block; margin-bottom: 5px; color: #0d2746; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
            table { width: 100%; border-collapse: collapse; }
            th { background: #0d2746; color: white; font-size: 11px; letter-spacing: .5px; text-align: left; text-transform: uppercase; }
            th, td { border: 1px solid #d1d5db; padding: 12px 10px; }
            .center { text-align: center; }
            .right { text-align: right; }
            .summary { width: 290px; margin: 28px 0 0 auto; }
            .summary div { display: flex; justify-content: space-between; padding: 8px 0; }
            .summary .total { border-top: 2px solid #0d2746; color: #0d2746; font-size: 18px; font-weight: 800; margin-top: 8px; padding-top: 14px; }
            .footer { margin-top: 70px; border-top: 1px solid #d1d5db; padding-top: 18px; color: #6b7280; text-align: center; }
            @media print { body { background: white; } .invoice { width: auto; min-height: auto; margin: 0; padding: 12mm; } }
          </style>
        </head>
        <body>
          <main class="invoice">
            <header class="top">
              <div class="brand">HAIERAH</div>
              <div><h1>INVOICE</h1><div class="meta">Invoice #: ${escapeHtml(orderId)}<br>Issue Date: ${escapeHtml(orderDate)}</div></div>
            </header>
            <section class="addresses">
              <div class="address"><strong>Bill To</strong>${escapeHtml(customerName)}<br>${escapeHtml(getAddressText())}<br>${escapeHtml(customerEmail)}</div>
              <div class="address"><strong>Payment Information</strong>Method: ${escapeHtml(order.paymentMethod || "Cash on Delivery")}<br>Status: ${escapeHtml(order.paymentStatus || "Pending")}</div>
            </section>
            <table>
              <thead><tr><th>Description</th><th class="center">Qty</th><th class="right">Price</th><th class="right">Total</th></tr></thead>
              <tbody>${itemRows}</tbody>
            </table>
            <section class="summary">
              <div><span>Subtotal</span><strong>₹${orderSubtotal.toFixed(2)}</strong></div>
              ${couponDiscount > 0 ? `<div><span>Discount</span><strong>-₹${couponDiscount.toFixed(2)}</strong></div>` : ""}
              <div><span>Tax</span><strong>₹${orderTax.toFixed(2)}</strong></div>
              <div class="total"><span>Balance Due</span><span>₹${orderTotal.toFixed(2)}</span></div>
            </section>
            <footer class="footer">Thank you for shopping with HAIERAH.</footer>
          </main>
        </body>
      </html>
    `);
    invoiceWindow.document.close();
    invoiceWindow.focus();
    setTimeout(() => {
      invoiceWindow.focus();
      invoiceWindow.print();
      invoiceWindow.onafterprint = () => invoiceWindow.close();
    }, 250);
    setFeedback("Invoice opened. Choose Save as PDF or Print from the dialog.");
  };

  const handleNeedHelp = () => {
    setFeedback("Our support team will assist you shortly.");
  };

  const handleDeleteOrder = () => {
    if (!order) return;
    if (window.confirm("Delete this order from your history?")) {
      onDeleteOrder?.(order.id || order.orderId || order._id);
      setFeedback("Order removed from your history.");
    }
  };

  const handleCancelOrder = () => {
    if (!order) return;
    if (window.confirm("Cancel this order?")) {
      onCancelOrder?.(order.id || order.orderId || order._id);
      setFeedback("Cancellation request sent.");
    }
  };

  const canCancel = ["Pending", "Confirmed", "Processing"].includes(String(order?.status || "").trim());

  return (
    <div className="bg-white rounded-2xl border shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden mb-8">

      {/* HEADER */}
      <div className="flex items-center justify-between border-b bg-gray-50 px-4 py-4 sm:px-6 sm:py-5 md:px-8">

        <div className="grid w-full grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4 md:gap-14">

          <div>
            <p className="text-xs uppercase text-gray-500">Order Placed</p>
            <p className="mt-1 font-semibold">{order.date || new Date(order.createdAt || Date.now()).toLocaleDateString()}</p>
          </div>

          <div>
            <p className="text-xs uppercase text-gray-500">Total</p>
            <p className="mt-1 font-semibold">₹{order.total}</p>
          </div>

          <div>
            <p className="text-xs uppercase text-gray-500">Status</p>

            <span
              className={`inline-flex mt-1 px-3 py-1 rounded-full text-xs font-semibold ${
                order.status === "Delivered"
                  ? "bg-green-100 text-green-700"
                  : order.status === "Cancelled"
                  ? "bg-red-100 text-red-700"
                  : order.status === "Shipped" || order.status === "Out for Delivery"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {order.status || "Pending"}
            </span>

          </div>

          <div>
            <p className="text-xs uppercase text-gray-500">Order ID</p>
            <p className="mt-1 break-all font-semibold">{order.id || order.orderId}</p>
          </div>

        </div>
      </div>

      {/* PRODUCTS */}
      {order.items.map((item) => (
        <div
          key={item.id || item.name}
          className="flex flex-col items-stretch gap-6 border-b px-4 py-6 sm:px-6 md:flex-row md:items-center md:justify-between md:px-8 md:py-8"
        >

          {/* LEFT */}
          <div className="flex min-w-0 gap-4 sm:gap-6">

            <img
              src={resolveImageUrl(item.image)}
              alt={item.name}
              className="h-28 w-24 shrink-0 rounded-xl border object-cover sm:h-36 sm:w-32"
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80";
              }}
            />

            <div className="min-w-0">

              <h2 className="break-words text-lg font-semibold sm:text-xl">{item.name}</h2>

              <div className="flex items-center gap-2 mt-2">
                <span className="text-yellow-500 text-lg">★★★★★</span>
                <span className="text-gray-500 text-sm">4.8 (286 Reviews)</span>
              </div>

              <p className="mt-4 text-gray-600">
                <strong>Color:</strong> {item.color || item.selectedColor || "N/A"}
              </p>

              <p className="text-gray-600">
                <strong>Size:</strong> {item.size || item.selectedSize || "N/A"}
              </p>

              {item.category && (
                <p className="text-gray-600">
                  <strong>Category:</strong> {item.category}
                </p>
              )}

              {item.brand && (
                <p className="text-gray-600">
                  <strong>Brand:</strong> {item.brand}
                </p>
              )}

              {item.material && (
                <p className="text-gray-600">
                  <strong>Material:</strong> {item.material}
                </p>
              )}

              <p className="text-gray-600">
                <strong>Quantity:</strong> {item.quantity || item.qty || 1}
              </p>

              <p className="text-2xl font-bold mt-4">
                ₹{getItemTotal(item).toFixed(2)}
              </p>

              <p className="text-green-600 font-medium mt-3">
                ✓ Delivered on {order.date}
              </p>

            </div>
          </div>

          {/* RIGHT */}
          <div className="grid w-full grid-cols-2 gap-2 sm:gap-3 md:w-44 md:grid-cols-1">
            <button
              onClick={handleBuyAgain}
              className="rounded-lg border px-2 py-3 text-sm transition hover:bg-black hover:text-white sm:text-base"
            >
              Buy Again
            </button>

            <button
              onClick={() => {
                setShowDetails(true);
                setShouldScrollToTracking(true);
                setFeedback("Tracking details opened below.");
              }}
              className="rounded-lg border px-2 py-3 text-sm transition hover:bg-black hover:text-white sm:text-base"
            >
              Track Package
            </button>

            <button
              onClick={handleDownloadInvoice}
              className="rounded-lg border px-2 py-3 text-sm transition hover:bg-black hover:text-white sm:text-base"
            >
              Download Invoice
            </button>

            <button
              onClick={handleNeedHelp}
              className="rounded-lg border px-2 py-3 text-sm transition hover:bg-black hover:text-white sm:text-base"
            >
              Need Help
            </button>
          </div>

        </div>
      ))}
            {/* VIEW DETAILS BUTTON */}
      <div className="flex flex-col items-center gap-3 border-b px-4 py-5 sm:px-8">
              <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={handleCancelOrder}
            disabled={!canCancel}
            className={`rounded-lg px-6 py-2.5 transition ${
              canCancel
                ? "border border-red-200 text-red-600 hover:bg-red-50"
                : "border border-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            {canCancel ? "Cancel Order" : "Cancel Unavailable"}
          </button>
        </div>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="border rounded-lg px-8 py-3 hover:bg-black hover:text-white transition"
        >
          {showDetails ? "Hide Details" : "View Details"}
        </button>

        {feedback && (
          <p className="text-sm text-green-600">{feedback}</p>
        )}
      </div>


      {/* SHIPPING + PAYMENT + COURIER + SUMMARY */}

      {showDetails && (

        <div className="border-t bg-[#fafafa] p-4 sm:p-6 md:p-8">

          <div className="grid lg:grid-cols-2 gap-8">


            {/* Shipping */}
            <div className="rounded-xl border bg-white p-4 shadow-sm sm:p-6">
              <h3 className="text-lg font-semibold mb-5">Shipping Address</h3>
              <p className="font-semibold">{order.shippingAddress?.fullName || order.customer?.name || order.customerName || "Customer"}</p>
              <p className="text-gray-600 mt-1">{order.shippingAddress?.phone || order.customer?.phone || order.customerPhone || "Phone not available"}</p>
              <p className="text-gray-500 mt-4 leading-7">{getAddressText()}</p>
            </div>



            {/* Payment */}
            <div className="rounded-xl border bg-white p-4 shadow-sm sm:p-6">

              <h3 className="text-lg font-semibold mb-5">
                 Payment Information
              </h3>


              <div className="space-y-4">

                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Method
                  </span>

                  <span className="font-medium">
                    {order.paymentMethod || order.payment?.method || "Cash on Delivery"}
                  </span>
                </div>


                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Status
                  </span>

                  <span className="text-green-600 font-semibold">
                    {order.paymentStatus || order.payment?.status || "Pending"}
                  </span>
                </div>


                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Transaction ID
                  </span>

                  <span className="max-w-full break-all text-right font-medium">
                    {order.transactionId || order.payment?.transaction || order.razorpayPaymentId || "Pending"}
                  </span>
                </div>

                {order.razorpayPaymentId ? (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Razorpay Payment ID</span>
                    <span className="max-w-full break-all text-right font-medium">{order.razorpayPaymentId}</span>
                  </div>
                ) : null}

                {order.razorpayOrderId ? (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Razorpay Order ID</span>
                    <span className="max-w-full break-all text-right font-medium">{order.razorpayOrderId}</span>
                  </div>
                ) : null}


              </div>

            </div>




            {/* Courier */}

            <div className="rounded-xl border bg-white p-4 shadow-sm sm:p-6">

              <h3 className="text-lg font-semibold mb-5">
                 Courier Details
              </h3>


              <div className="space-y-4">


                <div className="flex justify-between">
                  <span className="text-gray-500">Partner</span>
                  <span className="font-medium">{order.courier || "Not Assigned"}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Tracking No.</span>
                  <span className="max-w-full break-all text-right font-medium">{order.trackingNumber || "Generating..."}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Estimated Delivery</span>
                  <span className="font-medium">{getEstimatedDelivery()}</span>
                </div>


              </div>

            </div>





            {/* Summary */}

            <div className="rounded-xl border bg-white p-4 shadow-sm sm:p-6">


              <h3 className="text-lg font-semibold mb-5">
                 Order Summary
              </h3>



              <div className="space-y-4">


                <div className="flex justify-between">

                  <span>
                    Items
                  </span>

                  <span>
                    {itemCount}
                  </span>

                </div>



                <div className="flex justify-between">

                  <span>
                    Subtotal
                  </span>

                  <span>
                    ₹{orderSubtotal.toFixed(2)}
                  </span>

                </div>



                <div className="flex justify-between">

                  <span>
                    Shipping
                  </span>

                  <span className="text-green-600">
                    FREE
                  </span>

                </div>

                <div className="flex justify-between">

                  <span>
                    Tax
                  </span>

                  <span>
                    ₹{orderTax.toFixed(2)}
                  </span> 

                </div>

                <div className="flex justify-between font-bold text-lg border-t pt-4">

                  <span>
                    Total
                  </span>

                  <span>
                    ₹{order.total}
                  </span>

                </div>


              </div>


            </div>


          </div>




          {/* TRACKING TIMELINE */}

          <div ref={timelineRef} className="mt-10">
            <TrackingTimeline status={order.status} />
          </div>



        </div>

      )}


    </div>

  );
}