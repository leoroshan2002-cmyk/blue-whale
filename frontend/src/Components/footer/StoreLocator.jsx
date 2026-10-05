import React from "react";
import BackButton from "../BackButton";

export default function StoreLocator() {
  return (
    <main className="min-h-screen py-20 bg-[#f8f7f5]">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-6">
          <BackButton />
        </div>
        <h1 className="text-3xl font-semibold mb-4">Store Locator</h1>

        <p className="text-slate-600 mb-4">Find HAIERAH stores and authorised retailers near you. For the most up-to-date store hours and services, contact the listed location directly.</p>

        <div className="bg-white p-6 rounded shadow">
          <p className="text-slate-600">No stores found in your area yet. Please check back or contact <a href="mailto:stores@haierah.com" className="text-red-600">stores@haierah.com</a> for assistance.</p>
        </div>
      </div>
    </main>
  );
}
