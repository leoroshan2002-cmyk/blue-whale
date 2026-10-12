import React from "react";
import BackButton from "../BackButton";

export default function Press() {
  return (
    <main className="min-h-screen py-20 bg-[#f8f7f5]">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-6">
          <BackButton />
        </div>
        <h1 className="text-3xl font-semibold mb-4">Press</h1>

        <p className="text-slate-600 mb-4">For media inquiries, press assets, and high-resolution imagery, please contact our press team.</p>

        <h2 className="text-xl font-semibold mt-4">Press Contacts</h2>
        <p className="text-slate-600">Email: <a href="mailto:press@haierah.com" className="text-red-600">press@haierah.com</a></p>

        <h2 className="text-xl font-semibold mt-4">Recent Coverage</h2>
        <ul className="list-disc pl-5 text-slate-600">
          <li>HAIERAH Spring collection featured in Fashion Monthly.</li>
          <li>Designer interview on City Style Podcast.</li>
        </ul>
      </div>
    </main>
  );
}
