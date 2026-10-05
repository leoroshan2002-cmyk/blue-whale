import React from "react";
import { Link } from "react-router-dom";
import BackButton from "../BackButton";

export default function BestSellers() {
  return (
    <main className="min-h-screen py-20 bg-[#f8f7f5]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-6">
          <BackButton />
        </div>
        <h1 className="text-3xl font-semibold mb-4">Best Sellers</h1>

        <p className="text-slate-600 mb-6">Our best sellers are customer favorites chosen for quality, fit and lasting style. Browse the collection below or explore curated categories.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="font-semibold">Classic Shirt</h3>
            <p className="text-sm text-slate-500">Tailored fit, breathable cotton.</p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="font-semibold">Everyday Dress</h3>
            <p className="text-sm text-slate-500">Effortless silhouette for all occasions.</p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="font-semibold">Signature Jacket</h3>
            <p className="text-sm text-slate-500">Crafted details and timeless styling.</p>
          </div>
        </div>

        <div className="mt-8">
          <Link to="/category/men" className="text-red-600 font-medium">Shop Men</Link>
          <span className="mx-3">•</span>
          <Link to="/category/women" className="text-red-600 font-medium">Shop Women</Link>
        </div>
      </div>
    </main>
  );
}
