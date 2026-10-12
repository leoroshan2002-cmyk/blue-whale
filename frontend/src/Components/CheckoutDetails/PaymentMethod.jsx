import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ChevronDown, CreditCard, Wallet } from "lucide-react";

export const PAYMENT_METHODS = {
    online: {
        id: "online",
        title: "Pay Online",
        desc: "Secure Razorpay checkout with cards, UPI, and net banking",
        value: "Razorpay",
    },
    cod: {
        id: "cod",
        title: "Cash on Delivery",
        desc: "Pay with cash when your order arrives",
        value: "Cash on Delivery",
    },
};

const methods = [
    {
        id: PAYMENT_METHODS.online.id,
        title: PAYMENT_METHODS.online.title,
        desc: PAYMENT_METHODS.online.desc,
        icon: CreditCard,
        value: PAYMENT_METHODS.online.value,
    },
    {
        id: PAYMENT_METHODS.cod.id,
        title: PAYMENT_METHODS.cod.title,
        desc: PAYMENT_METHODS.cod.desc,
        icon: Wallet,
        value: PAYMENT_METHODS.cod.value,
    },
];

export default function PaymentMethod({ selectedMethodValue, onSelectMethod }) {
    const resolveInitialMethod = () => {
        if (selectedMethodValue === PAYMENT_METHODS.cod.value) {
            return PAYMENT_METHODS.cod.id;
        }
        return PAYMENT_METHODS.online.id;
    };

    const [selected, setSelected] = useState(resolveInitialMethod);
    const [show, setShow] = useState(true);
    const [confirmedMethod, setConfirmedMethod] = useState(resolveInitialMethod);

    useEffect(() => {
        const nextMethod = selectedMethodValue === PAYMENT_METHODS.cod.value ? PAYMENT_METHODS.cod.id : PAYMENT_METHODS.online.id;
        setSelected(nextMethod);
        setConfirmedMethod((current) => current || nextMethod);
    }, [selectedMethodValue]);

    const selectedMethod = methods.find((item) => item.id === selected) || methods[0];

    const handleSelect = (methodId) => {
        setSelected(methodId);
        onSelectMethod?.(PAYMENT_METHODS[methodId]?.value || PAYMENT_METHODS.online.value);
    };

    const handleConfirm = () => {
        setConfirmedMethod(selected);
        onSelectMethod?.(PAYMENT_METHODS[selected]?.value || PAYMENT_METHODS.online.value);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="border-b border-gray-200 p-5 sm:p-8"
        >
            <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                    <h2 className="text-2xl font-semibold sm:text-3xl">Payment Method</h2>
                    <CheckCircle2 size={26} className="text-green-600 fill-green-600" />
                </div>

                <button type="button" onClick={() => setShow(!show)}>
                    <ChevronDown
                        size={24}
                        className={`transition-transform duration-300 cursor-pointer ${show ? "rotate-180" : ""}`}
                    />
                </button>
            </div>

            {show && (
                <>
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        transition={{ duration: 0.4 }}
                        className="mt-8 grid gap-4 md:grid-cols-2 md:gap-5"
                    >
                        {methods.map((item) => {
                            const Icon = item.icon;

                            return (
                                <motion.button
                                    key={item.id}
                                    type="button"
                                    whileHover={{ y: -4 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleSelect(item.id)}
                                    className={`min-h-[150px] w-full rounded-3xl border-2 p-4 text-left transition-all sm:p-5 ${
                                        selected === item.id
                                            ? "border-[#0d2746] bg-blue-50"
                                            : "border-gray-200 hover:border-[#0d2746]"
                                    }`}
                                >
                                    <div className="flex justify-between gap-3">
                                        <div className="flex min-w-0 gap-3 sm:gap-4">
                                            <div
                                                className={`flex h-9 w-12 shrink-0 items-center justify-center rounded-2xl ${
                                                    selected === item.id ? "bg-[#0d2746] text-white" : "bg-gray-100"
                                                }`}
                                            >
                                                <Icon size={20} />
                                            </div>

                                            <div>
                                                <h3 className="text-lg font-semibold">{item.title}</h3>
                                                <p className="text-gray-500 mt-1 text-sm">{item.desc}</p>
                                            </div>
                                        </div>

                                        <div
                                            className={`w-6 h-5 rounded-full border-2 flex items-center justify-center ${
                                                selected === item.id ? "border-[#0d2746]" : "border-gray-300"
                                            }`}
                                        >
                                            {selected === item.id && <div className="w-3 h-3 rounded-full bg-[#0d2746]" />}
                                        </div>
                                    </div>
                                </motion.button>
                            );
                        })}
                    </motion.div>

                    <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <p className="text-sm font-medium uppercase tracking-[0.2em] text-gray-500">
                                    Selected Payment
                                </p>
                                <h3 className="mt-1 text-lg font-semibold text-gray-900">{selectedMethod.title}</h3>
                                <p className="text-sm text-gray-600">{selectedMethod.desc}</p>
                            </div>

                            <button
                                type="button"
                                onClick={handleConfirm}
                                className="rounded-full bg-[#0d2746] px-4 py-2 text-sm font-medium text-white"
                            >
                                Confirm Method
                            </button>
                        </div>

                        {confirmedMethod === selected && (
                            <p className="mt-3 text-sm text-green-600">
                                Payment method confirmed and ready for checkout.
                            </p>
                        )}
                    </div>
                </>
            )}
        </motion.div>
    );
}