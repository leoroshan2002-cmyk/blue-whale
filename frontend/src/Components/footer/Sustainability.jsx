import React from "react";
import BackButton from "../BackButton";

export default function Sustainability() {
  return (
    <main className="min-h-screen py-20 bg-[#f8f7f5]">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-6">
          <BackButton />
        </div>
        <h1 className="text-3xl font-semibold mb-4">Sustainability</h1>

        <p className="text-slate-600 mb-4">Sustainability is central to our design and sourcing choices. We aim to reduce waste, choose durable materials, and work with partners who share our environmental standards.</p>

        <h2 className="text-xl font-semibold mt-4">Materials</h2>
        <p className="text-slate-600">We prioritize long-lasting natural fibers and certified materials where possible, and we continuously evaluate alternatives with lower environmental impact.</p>
      </div>
    </main>
  );
}
