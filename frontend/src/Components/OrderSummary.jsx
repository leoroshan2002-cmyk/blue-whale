import { motion, AnimatePresence } from "framer-motion";
import {
    Tag,
    Truck,
    ShieldCheck,
    ArrowRight,
    CheckCircle2,
    LoaderCircle,
} from "lucide-react";
import { useCart } from "../Context/CartContext";
import { useAuth } from "../Context/AuthContext";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient, buildApiUrl, invalidateProductCache } from "../services/api";
import { toast } from "react-toastify";
import { evaluateCoupon } from "../utils/couponUtils";
import { PAYMENT_METHODS } from "./CheckoutDetails/PaymentMethod";

export default function OrderSummary({ selectedPaymentMethod = "Cash on Delivery", selectedDelivery, onPaymentError, onOrderComplete }) {
    const [showSuccess, setShowSuccess] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderStatusMessage, setOrderStatusMessage] = useState("");
    const [confirmedOrderId, setConfirmedOrderId] = useState("");
    const [couponCode, setCouponCode] = useState("");
    const [couponMessage, setCouponMessage] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const navigate = useNavigate();
    const { user } = useAuth();

    const { cart = [], clearCart } = useCart();

    const subtotal = cart.reduce(
        (sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 1),
        0
    );

    const shipping = subtotal > 0 ? 0 : 0;
    const deliveryCost = (() => {
        if (!selectedDelivery || selectedDelivery.price === "FREE") return 0;
        const match = String(selectedDelivery.price).replace(/[^0-9.]/g, "");
        return Number(match) || 0;
    })();
    const couponResult = useMemo(() => {
        if (!appliedCoupon) {
            return { discountAmount: 0 };
        }

        const result = evaluateCoupon(appliedCoupon, subtotal);
        return result;
    }, [appliedCoupon, subtotal]);
    const discountAmount = Number(couponResult.discountAmount || 0);
    const taxableSubtotal = Math.max(0, subtotal - discountAmount);
    const tax = Number((taxableSubtotal * 0.05).toFixed(2));
    const total = Number((taxableSubtotal + shipping + deliveryCost + tax).toFixed(2));

    const handleApplyCoupon = () => {
        const normalizedCode = String(couponCode || '').trim().toUpperCase();
        let storedCouponsPayload;
        try {
            storedCouponsPayload = localStorage.getItem('hyra_shopify_admin_coupons');
        } catch {
            setCouponMessage('Coupons are temporarily unavailable.');
            return;
        }
        let storedCoupons;

        try {
            if (storedCouponsPayload) {
                storedCoupons = JSON.parse(storedCouponsPayload);
            } else {
                const savedState = JSON.parse(localStorage.getItem('haierah-state') || '{}');
                storedCoupons = Array.isArray(savedState.coupons) ? savedState.coupons : [];
            }
        } catch {
            setCouponMessage('Coupon data is unavailable.');
            setAppliedCoupon(null);
            return;
        }

        if (storedCoupons && !Array.isArray(storedCoupons) && Array.isArray(storedCoupons.coupons)) {
            storedCoupons = storedCoupons.coupons;
        }

        const match = Array.isArray(storedCoupons)
            ? storedCoupons.find((coupon) => String(coupon.code || '').trim().toUpperCase() === normalizedCode)
            : null;

        if (!match) {
            setCouponMessage('Coupon not found.');
            setAppliedCoupon(null);
            return;
        }

        const result = evaluateCoupon(match, subtotal);
        if (!result.isValid) {
            setCouponMessage(result.reason === 'expired' ? 'This coupon has expired.' : result.reason === 'inactive' ? 'This coupon is currently inactive.' : 'This coupon cannot be used for the current order.');
            setAppliedCoupon(null);
            return;
        }

        setAppliedCoupon(match);
        setCouponMessage(`Coupon applied: ${match.code}`);
    };

    const loadRazorpayScript = () => new Promise((resolve, reject) => {
        if (typeof window === "undefined") return reject(new Error("Window is unavailable"));
        if (window.Razorpay) return resolve();

        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Unable to load Razorpay checkout script."));
        document.body.appendChild(script);
    });

    const createOrderPayload = async () => {
        const customerName = [user?.name, user?.firstName, user?.lastName]
            .filter(Boolean)
            .join(" ")
            .trim() || "Customer";
        const customerEmail = String(user?.email || "").trim().toLowerCase();
        const customerPhone = String(user?.phone || "").trim() || "Not provided";
        const customerAddress = [user?.address, user?.city, user?.state, user?.zip]
            .filter(Boolean)
            .join(", ")
            .trim() || "Address not provided";

        if (!customerEmail) {
            throw new Error("Please sign in to place an order with your email address.");
        }

        return {
            id: `HM${Date.now().toString().slice(-6)}`,
            orderId: `HM${Date.now().toString().slice(-6)}`,
            date: new Date().toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }),
            status: "Processing",
            subtotal: Number(subtotal.toFixed(2)),
            total: Number(total.toFixed(2)),
            shipping: Number(shipping.toFixed(2)),
            deliveryCost: Number(deliveryCost.toFixed(2)),
            tax: Number(tax.toFixed(2)),
            couponCode: appliedCoupon?.code || "",
            couponDiscount: Number(couponResult.discountAmount || 0),
            customerName,
            customerEmail,
            customerAvatar: user?.avatar || "",
            paymentStatus: selectedPaymentMethod === PAYMENT_METHODS.cod.value ? "Pending" : "Pending",
            paymentMethod: selectedPaymentMethod,
            shippingAddress: {
                street: user?.address || "Address not provided",
                city: user?.city || "",
                state: user?.state || "",
                zip: user?.zip || "",
                country: "India",
            },
            items: cart.map((item) => {
                const selectedColor = item.color || item.selectedColor || item.variant?.color || item.variant?.name || "";
                const selectedSize = item.size || item.selectedSize || item.variant?.size || "";
                const productIdentifier = String(
                    item.productId || item.product?.id || item.product?._id || item.product?.sku || item.sku || item.id || item._id || ""
                ).trim();

                return {
                    productId: productIdentifier,
                    name: item.name,
                    quantity: Number(item.qty) || 1,
                    price: Number(item.price) || 0,
                    image: item.image || item.images?.[0] || "",
                    color: selectedColor,
                    size: selectedSize,
                    selectedColor,
                    selectedSize,
                    brand: item.brand || item.productBrand || "",
                    category: item.category || item.productCategory || "",
                    material: item.material || item.productMaterial || "",
                };
            }),
            customer: {
                name: customerName,
                phone: customerPhone,
                address: customerAddress,
            },
            payment: {
                method: selectedPaymentMethod,
                transaction: "PENDING",
                status: "Pending",
            },
            courier: {
                partner: "Blue Dart",
                tracking: "Tracking soon",
            },
            delivery: {
                method: selectedDelivery?.title || "Standard Delivery",
                time: selectedDelivery?.time || "3 - 5 Business Days",
                cost: deliveryCost,
            },
        };
    };

    const handlePlaceOrder = async () => {
        if (cart.length === 0 || isProcessing) return;

        const requiredAddressFields = [user?.address, user?.city, user?.state, user?.zip, user?.phone];
        if (requiredAddressFields.some((field) => !String(field || '').trim())) {
            const message = 'Please add your complete shipping address before placing the order.';
            onPaymentError?.(message);
            toast.error(message);
            return;
        }

        let orderPayload;

        try {
            orderPayload = await createOrderPayload();
        } catch (error) {
            toast.error(error.message || "Please sign in to place your order.");
            return;
        }

        try {
            setIsProcessing(true);
            setOrderStatusMessage("Processing your order...");

            if (selectedPaymentMethod === PAYMENT_METHODS.cod.value) {
                await apiClient.post(buildApiUrl("/api/orders"), {
                    orderId: orderPayload.orderId,
                    customerName: orderPayload.customerName,
                    customerEmail: orderPayload.customerEmail,
                    customerAvatar: orderPayload.customerAvatar,
                    items: orderPayload.items,
                    subtotal: orderPayload.subtotal,
                    total: orderPayload.total,
                    shipping: orderPayload.shipping,
                    deliveryCost: orderPayload.deliveryCost,
                    tax: orderPayload.tax,
                    couponDiscount: orderPayload.couponDiscount,
                    paymentStatus: "Pending",
                    status: orderPayload.status,
                    paymentMethod: orderPayload.paymentMethod,
                    shippingAddress: orderPayload.shippingAddress,
                    customerPhone: orderPayload.customer?.phone,
                    customerAddressText: orderPayload.customer?.address,
                    delivery: orderPayload.delivery,
                });

                const existingOrders = JSON.parse(localStorage.getItem("userOrders") || "[]");
                localStorage.setItem("userOrders", JSON.stringify([orderPayload, ...existingOrders]));

                if (typeof window !== "undefined") {
                    invalidateProductCache();
                    window.dispatchEvent(new Event("haierah-order-created"));
                    window.dispatchEvent(new Event("haierah-products-updated"));
                }

                clearCart();
                setIsProcessing(false);
                setConfirmedOrderId(orderPayload.orderId);
                setShowSuccess(true);
                setOrderStatusMessage("Your order was placed successfully.");
                onOrderComplete?.({ orderId: orderPayload.orderId, paymentMethod: selectedPaymentMethod });
                toast.success("Order placed successfully.");

                setTimeout(() => {
                    setShowSuccess(false);
                    navigate("/orders");
                }, 2000);
                return;
            }

            const { data: razorpayOrderData } = await apiClient.post(buildApiUrl("/api/payment/create-order"), {
                amount: orderPayload.total,
                receipt: orderPayload.orderId,
                order: orderPayload,
            });

            await loadRazorpayScript();

            const options = {
                key: razorpayOrderData.razorpayKey,
                amount: razorpayOrderData.order.amount,
                currency: razorpayOrderData.order.currency,
                name: "HAIERAH",
                description: "Purchase from HAIERAH",
                order_id: razorpayOrderData.order.id,
                handler: async (response) => {
                    try {
                        const { data } = await apiClient.post(buildApiUrl("/api/payment/verify"), {
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                            order: orderPayload,
                        });

                        if (data?.success) {
                            const existingOrders = JSON.parse(localStorage.getItem("userOrders") || "[]");
                            localStorage.setItem("userOrders", JSON.stringify([{ ...orderPayload, paymentStatus: "Paid", paymentMethod: "Razorpay", payment: { ...orderPayload.payment, method: "Razorpay", status: "Paid", transaction: response.razorpay_payment_id }, razorpayOrderId: response.razorpay_order_id, razorpayPaymentId: response.razorpay_payment_id, razorpaySignature: response.razorpay_signature, transactionId: response.razorpay_payment_id }, ...existingOrders]));
                            if (typeof window !== "undefined") {
                                invalidateProductCache();
                                window.dispatchEvent(new Event("haierah-order-created"));
                                window.dispatchEvent(new Event("haierah-products-updated"));
                            }
                            clearCart();
                            setIsProcessing(false);
                            setConfirmedOrderId(orderPayload.orderId);
                            setOrderStatusMessage("Your order was placed successfully.");
                            setShowSuccess(true);
                            onOrderComplete?.({ orderId: orderPayload.orderId, paymentMethod: selectedPaymentMethod });
                            toast.success("Payment successful. Order placed.");
                            setTimeout(() => {
                                setShowSuccess(false);
                                navigate("/order-success", { state: { orderId: orderPayload.orderId } });
                            }, 1500);
                        } else {
                            throw new Error(data?.message || "Payment verification failed.");
                        }
                    } catch (error) {
                        const backendMessage = error?.response?.data?.error || error?.response?.data?.message || error?.message || "Unable to verify payment.";
                        console.error("Razorpay verification failed", error?.response?.data || error);
                        onPaymentError?.(backendMessage);
                        toast.error(backendMessage);
                    }
                },
                prefill: {
                    name: orderPayload.customerName,
                    email: orderPayload.customerEmail,
                    contact: orderPayload.customer?.phone || "",
                },
                theme: {
                    color: "#0d2746",
                },
                modal: {
                    ondismiss: () => {
                        onPaymentError?.("Payment cancelled.");
                        toast.warning("Payment cancelled.");
                    },
                },
            };

            const razorpayInstance = new window.Razorpay(options);
            razorpayInstance.open();
        } catch (error) {
            setIsProcessing(false);
            setOrderStatusMessage("Order failed. Please try again.");
            const responseData = error?.response?.data;
            const requestInfo = error?.config ? {
                url: error.config.url,
                method: error.config.method,
                baseURL: error.config.baseURL,
                headers: error.config.headers,
            } : undefined;
            console.error("Failed to place order", {
                message: error?.message,
                code: error?.code,
                requestInfo,
                responseData,
                error,
            });
            const message = responseData?.message || responseData?.error || error.message || "Unable to process payment.";
            onPaymentError?.(message);
            toast.error(message);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: .6 }}
            className="w-full rounded-3xl border border-gray-100 bg-white p-5 shadow-lg sm:p-7 lg:sticky lg:top-24"
        >
            {/* Heading */}

            <h2 className="mb-6 text-3xl font-serif font-bold sm:mb-8 sm:text-4xl">
                Order Summary
            </h2>

            {/* Products */}

            <div className="space-y-5">
                {cart.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
                        Your cart is empty. Add items to see your order summary.
                    </div>
                ) : (
                    cart.map((item) => (
                        <div key={item.id} className="grid min-w-0 grid-cols-[4rem_minmax(0,1fr)_auto] items-center gap-3 sm:grid-cols-[5rem_minmax(0,1fr)_auto] sm:gap-4">
                            <img
                                src={item.image}
                                alt={item.name}
                                className="h-16 w-16 shrink-0 rounded-2xl object-cover sm:h-20 sm:w-20"
                            />

                            <div className="min-w-0 flex-1">
                                <h3 className="break-words font-semibold">{item.name}</h3>
                                <p className="text-gray-500 text-sm">Qty : {item.qty}</p>
                            </div>

                            <span className="shrink-0 text-sm font-semibold sm:text-base">₹{(Number(item.price) || 0).toFixed(2)}</span>
                        </div>
                    ))
                )}
            </div>

            {/* Promo */}

            <div className="mt-8">

                <label className="font-medium mb-2 flex items-center gap-2">
                    <Tag size={18} />

                    Promo Code
                </label>

                <div className="mt-3 flex min-w-0">

                    <input
                        placeholder="Enter Code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="min-w-0 flex-1 rounded-l-2xl border px-3 py-3 outline-none focus:ring-2 focus:ring-[#0d2746] sm:px-4"
                    />

                    <button
                        onClick={handleApplyCoupon}
                        className="rounded-r-2xl bg-[#0d2746] px-4 text-sm text-white duration-300 hover:bg-black sm:px-6"
                    >
                        Apply
                    </button>

                </div>

            </div>

            {/* Price */}

            <div className="mt-8 space-y-4">

                <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
                    <span className="text-gray-500">
                        Subtotal
                    </span>

                    <span>
                        ₹{subtotal.toFixed(2)}
                    </span>
                </div>

            

                {deliveryCost > 0 && (
                    <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
                        <span className="flex items-center gap-2 text-gray-500">
                            <Truck size={18} />
                            Delivery ({selectedDelivery?.title})
                        </span>
                        <span>₹{deliveryCost.toFixed(2)}</span>
                    </div>
                )}

                <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">

                    <span>
                        Tax
                    </span>

                    <span>
                        ₹{tax.toFixed(2)}
                    </span>

                </div>    <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">

                    <span className="flex items-center gap-2 text-gray-500">

                        <Truck size={18} />

                        Shipping

                    </span>

                    <span className="text-green-600">
                        FREE
                    </span>

                </div>

                {couponResult.discountAmount > 0 && (
                    <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 text-green-600">
                        <span>Coupon Discount</span>
                        <span>-₹{couponResult.discountAmount.toFixed(2)}</span>
                    </div>
                )}

            </div>

            {couponMessage && (
                <p className={`mt-3 text-sm ${appliedCoupon ? 'text-green-600' : 'text-amber-600'}`}>
                    {couponMessage}
                </p>
            )}

            <hr className="my-6" />

            {/* Total */}

            <div className="flex items-center justify-between gap-4">

                <span className="text-xl font-semibold sm:text-2xl">
                    Total
                </span>

                <span className="text-2xl font-bold sm:text-3xl">
                    ₹{total.toFixed(2)}
                </span>

            </div>

            {/* Secure */}

            <div className="bg-green-50 rounded-2xl p-4 flex gap-3 mt-8">

                <ShieldCheck
                    className="text-green-600"
                    size={24}
                />

                <div>

                    <h4 className="font-semibold">
                        Secure Checkout
                    </h4>

                    <p className="text-sm text-gray-500">
                        SSL encrypted payment
                    </p>

                </div>

            </div>

            {orderStatusMessage && !showSuccess && (
                <div className="mt-6 rounded-3xl border border-blue-200 bg-blue-50 p-5 text-center text-blue-700">
                    <p className="text-base font-semibold">{orderStatusMessage}</p>
                    {isProcessing && (
                        <p className="mt-2 text-sm text-blue-600">Hang tight while we confirm your order and send the notification.</p>
                    )}
                </div>
            )}

            {/* Button */}

            <motion.button
                whileHover={{ scale: cart.length === 0 || isProcessing ? 1 : 1.03 }}
                whileTap={{ scale: cart.length === 0 || isProcessing ? 1 : 0.98 }}
                onClick={handlePlaceOrder}
                disabled={cart.length === 0 || isProcessing}
                className={`mt-8 w-full rounded-full py-4
    flex justify-center items-center gap-3 text-lg font-medium transition-all
    ${cart.length === 0 || isProcessing
                        ? "bg-gray-300 cursor-not-allowed text-gray-600"
                        : "bg-[#0d2746] hover:bg-black text-white"
                    }`}
            >
                {isProcessing ? (
                    <>
                        <LoaderCircle size={20} className="animate-spin" aria-hidden="true" />
                        Processing Order...
                    </>
                ) : (
                    <>
                        Place Order
                        <ArrowRight size={20} aria-hidden="true" />
                    </>
                )}
            </motion.button>
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            initial={{ scale: 0.6, opacity: 0 }}
                            animate={{
                                scale: 1,
                                opacity: 1,
                            }}
                            exit={{
                                scale: 0.8,
                                opacity: 0,
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 180,
                                damping: 15,
                            }}
                            className="w-[calc(100vw-2rem)] max-w-[420px] rounded-3xl bg-white p-6 text-center shadow-2xl sm:p-10"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{
                                    scale: [0, 1.2, 1],
                                    rotate: [0, 15, -15, 0],
                                }}
                                transition={{ duration: 0.7 }}
                                className="mx-auto mb-6"
                            >
                                <CheckCircle2
                                    size={90}
                                    className="text-green-600 fill-green-600 text-white"
                                />
                            </motion.div>

                            <motion.h2
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="text-3xl font-bold"
                            >
                                Order Placed!
                            </motion.h2>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="text-gray-500 mt-3"
                            >
                                Thank you for shopping with us.
                                <br />
                                {confirmedOrderId ? `Order #${confirmedOrderId} has been placed.` : 'Your order has been placed successfully.'}
                                <br />
                                You’ll receive your confirmation and tracking details via email soon.
                            </motion.p>

                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 3, ease: "linear" }}
                                className="h-1 bg-green-500 rounded-full mt-8"
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </motion.div>
    );
}