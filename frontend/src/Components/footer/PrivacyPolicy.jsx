import React from "react";
import BackButton from "../BackButton";

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen py-20 bg-[#f8f7f5]">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-6">
          <BackButton />
        </div>
        <h1 className="text-3xl font-semibold mb-4">Privacy Policy</h1>

        <p className="text-slate-600 mb-4">HAIERAH is committed to protecting your privacy. This notice explains what personal information we collect, how we use it, and your choices.</p>

        <h2 className="text-xl font-semibold mt-4">Information We Collect</h2>
        <p className="text-slate-600">We collect information you provide when you create an account, place an order, subscribe to newsletters, or contact support. This may include name, email, shipping address, phone number and payment details (processed securely by our payment provider).</p>

        <h2 className="text-xl font-semibold mt-4">How We Use Information</h2>
        <p className="text-slate-600">We use your information to fulfill orders, communicate about your purchases, improve the shopping experience, and send promotional messages when you opt in. You may unsubscribe from marketing communications at any time.</p>

        <h2 className="text-xl font-semibold mt-4">Cookies & Tracking</h2>
        <p className="text-slate-600">We use cookies and similar technologies for functionality, analytics and advertising. You can control cookie preferences in your browser.</p>

        <h2 className="text-xl font-semibold mt-4">Data Sharing</h2>
        <p className="text-slate-600">We share data with service providers that help us operate (payment processors, shipping partners, analytics). We do not sell personal information.</p>

        <h2 className="text-xl font-semibold mt-4">Contact Us</h2>
        <p className="text-slate-600">For privacy requests or questions, email <a href="mailto:privacy@haierah.com" className="text-red-600">privacy@haierah.com</a>.</p>
      </div>
    </main>
  );
}
