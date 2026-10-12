import React from "react";
import BackButton from "../BackButton";

export default function BrandStory() {
  return (
    <main className="min-h-screen py-20 bg-[#f8f7f5]">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-6">
          <BackButton />
        </div>
        <h1 className="text-3xl font-semibold mb-4">Our Story</h1>

        <p className="text-slate-600 mb-4">Founded with a passion for thoughtful design, HAIERAH creates pieces that bridge classic tailoring and contemporary ease. Each collection is inspired by everyday rituals and crafted for longevity.</p>

        <h2 className="text-xl font-semibold mt-4">Craftsmanship</h2>
        <p className="text-slate-600">We partner with skilled artisans and responsible factories to ensure attention to detail and ethical production across our supply chain.</p>
      </div>
    </main>
  );
}
