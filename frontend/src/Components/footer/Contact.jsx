import React, { useState } from "react";
import { toast } from "react-toastify";
import BackButton from "../BackButton";
import { buildApiUrl } from "../../services/api";

const initialForm = { name: "", email: "", message: "" };

export default function Contact() {
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const name = form.name.trim();
    const email = form.email.trim();
    const message = form.message.trim();

    if (!name || !email || !message) {
      toast.error("Please fill in your name, email, and message.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(buildApiUrl("/api/contact"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, message }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.message || "Unable to send your message right now.");
      }

      toast.success(data?.message || "Your message has been sent successfully.");
      setForm(initialForm);
    } catch (error) {
      toast.error(error.message || "Unable to send your message right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen py-20 bg-[#f8f7f5]">
      <div className="max-w-3xl mx-auto px-6">
        <div className="mb-6">
          <BackButton />
        </div>
        <h1 className="text-3xl font-semibold mb-4">Contact Us</h1>

        <p className="text-slate-600 mb-4">We're here to help. Use the information below to reach our support team or send a message using the form.</p>

        <div className="space-y-6">
          <div>
            <h2 className="font-semibold">Customer Support</h2>
            <p className="text-slate-600">Email: <a href="mailto:leoroshan2002@gmail.com" className="text-red-600">leoroshan2002@gmail.com</a></p>
            <p className="text-slate-600">Phone: *********** (Mon–Fri, 9am–6pm)</p>
          </div>

          <div>
            <h2 className="font-semibold">Press & Partnerships</h2>
            <p className="text-slate-600">Email: <a href="mailto:************" className="text-red-600">************</a></p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
            <div>
              <label htmlFor="name" className="block text-sm font-medium">Name</label>
              <input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="mt-1 w-full border rounded p-2"
                placeholder="Your name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="mt-1 w-full border rounded p-2"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium">Message</label>
              <textarea
                id="message"
                name="message"
                value={form.message}
                onChange={handleChange}
                className="mt-1 w-full border rounded p-2"
                rows={4}
                placeholder="Tell us how we can help"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-red-600 text-white px-4 py-2 rounded disabled:bg-red-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
