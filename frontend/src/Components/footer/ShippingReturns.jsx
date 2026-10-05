import React from "react";
import BackButton from "../BackButton";

export default function ShippingReturns() {
  return (
    <main className="min-h-screen py-20 bg-[#f8f7f5]">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-6">
          <BackButton />
        </div>
        <h1 className="text-3xl font-semibold mb-4">Shipping & Returns</h1>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Shipping</h2>
          <p className="text-slate-600 mb-2">Orders are processed within 1–2 business days. We offer standard and express shipping options at checkout. Delivery estimates depend on destination and the shipping method selected.</p>
          <ul className="list-disc pl-5 text-slate-600">
            <li>Standard: 3–7 business days</li>
            <li>Express: 1–3 business days</li>
          </ul>
          <p className="text-slate-600 mt-2">Once your order ships, you will receive a tracking number via email.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Returns</h2>
          <p className="text-slate-600 mb-2">We accept returns within 30 days of delivery for most products. Items must be unworn, unwashed and in original packaging with tags attached.</p>
          <ol className="list-decimal pl-5 text-slate-600">
            <li>Request a return via your account or contact support.</li>
            <li>Pack the items securely and include the packing slip.</li>
            <li>Ship to the returns address provided in your return confirmation.</li>
          </ol>
          <p className="text-slate-600 mt-2">Refunds are processed within 5–10 business days after we receive the returned items.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Need help?</h2>
          <p className="text-slate-600">If you have questions about shipping or returns, contact our support team at <a href="mailto:support@haierah.com" className="text-red-600">support@haierah.com</a> or use the Contact page.</p>
        </section>
      </div>
    </main>
  );
}
