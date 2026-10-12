import React from "react";
import BackButton from "../BackButton";

export default function TermsOfService() {
  return (
    <main className="min-h-screen py-20 bg-[#f8f7f5]">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-6">
          <BackButton />
        </div>
        <h1 className="text-3xl font-semibold mb-4">Terms of Service</h1>

        <p className="text-slate-600 mb-4">These Terms of Service govern your use of the HAIERAH website and services. By using our site you agree to these terms.</p>

        <h2 className="text-xl font-semibold mt-4">Orders & Payments</h2>
        <p className="text-slate-600">All orders are subject to product availability and confirmation of payment. Prices are quoted in the currency shown at checkout.</p>

        <h2 className="text-xl font-semibold mt-4">Returns & Refunds</h2>
        <p className="text-slate-600">Our returns policy determines eligibility for refunds. Please see the Shipping & Returns page for details.</p>

        <h2 className="text-xl font-semibold mt-4">Intellectual Property</h2>
        <p className="text-slate-600">All content on the site, including text, images and logos, is the property of HAIERAH or its licensors and is protected by copyright.</p>

        <h2 className="text-xl font-semibold mt-4">Limitation of Liability</h2>
        <p className="text-slate-600">To the fullest extent permitted by law, HAIERAH is not liable for indirect or consequential damages arising from use of the site.</p>

        <h2 className="text-xl font-semibold mt-4">Governing Law</h2>
        <p className="text-slate-600">These terms are governed by the laws applicable to our primary place of business.</p>
      </div>
    </main>
  );
}
