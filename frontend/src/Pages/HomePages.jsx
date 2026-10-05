// src/Pages/HomePages.jsx

import React, { useEffect, useLayoutEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import gsap from "gsap";
import { toast } from "react-toastify";
import { useCart } from "../Context/CartContext";
import menCollection from "../assets/menCollection.jpg";
import womenCollection from "../assets/womenCollection.jpg";
import kidsCollection from "../assets/kidsCollection.jpg";
import mensfit from "../assets/mensfit.jpg";
import womensfit from "../assets/womensfit.jpg";
import kidsfit from "../assets/kidsfit.jpg";
import {
    ArrowRight,
    Award,
    Truck,
    ShieldCheck,
    RotateCcw,
    Headphones,
    Star,
} from "lucide-react";
import HeroSection from "../Components/HeroSection";
import Footer from "../Components/Footer";
import BrandStatement from "../Components/BrandStatement";
import { useRequireAuthAction } from "../hooks/useRequireAuthAction";
import { fetchProducts } from "../services/api";
import { subscribeToCatalogChanges } from "../utils/catalogSync";
export default function HomePage({ isLoaded }) {
    const { addToCart } = useCart();
    const { requireAuthAction } = useRequireAuthAction();
    const [products, setProducts] = useState([]);



    useLayoutEffect(() => {
        if (!isLoaded) return;

        const ctx = gsap.context(() => {

            gsap.set(".navbar", {
                opacity: 0,
                y: -60,
            });

            gsap.set(".hero-image", {
                opacity: 0,
                x: -250,
                // scale: 1.2,
                rotate: -2,
            });

            gsap.set(".hero-title", {
                opacity: 0,
                y: 70,
            });

            gsap.set(".hero-subtitle", {
                opacity: 0,
                y: 40,
            });

            gsap.set(".hero-button", {
                opacity: 0,
                y: 25,
            });

            // ✅ ONE timeline only
            const tl = gsap.timeline();

            tl.to(".navbar", {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: "power4.out",
            })

                .to(".hero-image", {
                    opacity: 1,
                    x: 0,
                    scale: 1,
                    rotate: 0,
                    duration: 1.8,
                    ease: "expo.out",
                }, "-=0.2")

                .to(".hero-title", {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    ease: "power3.out",
                }, "-=1")

                .to(".hero-subtitle", {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: "power3.out",
                }, "-=0.7")

                .to(".hero-button", {
                    opacity: 1,
                    y: 0,
                    stagger: 0.15,
                    duration: 0.6,
                    ease: "power3.out",
                }, "-=0.5");

        });

        return () => ctx.revert();

    }, [isLoaded]);

    useEffect(() => {
        const loadProducts = async () => {
            const response = await fetchProducts();
            setProducts(response);
        };

        loadProducts();

        const handleInventoryChange = () => {
            loadProducts();
        };

        if (typeof window !== 'undefined') {
            window.addEventListener('haierah-products-updated', handleInventoryChange);
            window.addEventListener('haierah-order-created', handleInventoryChange);
        }

        const unsubscribeCatalog = subscribeToCatalogChanges(handleInventoryChange);

        return () => {
            unsubscribeCatalog();
            if (typeof window !== 'undefined') {
                window.removeEventListener('haierah-products-updated', handleInventoryChange);
                window.removeEventListener('haierah-order-created', handleInventoryChange);
            }
        };
    }, []);

    const handleAddToCart = (product) => {
        const cartProduct = {
            id: product.id,
            name: product.name,
            price: product.discountPrice || product.price,
            image: product.images?.[0] || product.image,
            stock: product.stock ?? 0,
        };
        if (!requireAuthAction("addToCart", cartProduct)) return;
        if ((product.stock ?? 0) <= 0) {
            toast.warning("This item is out of stock.");
            return;
        }
        addToCart(cartProduct);
    };
    const featuredProducts = products.slice(0, 4);

    const handleExplore = () => {
        window.location.assign('/products');
    };

    const features = [
        {
            icon: Award,
            title: "Quality First",
            desc: "Hand-picked premium fabrics and materials.",
        },
        {
            icon: Truck,
            title: "Fast Delivery",
            desc: "Global express shipping to your doorstep.",
        },
        {
            icon: ShieldCheck,
            title: "Secure Payment",
            desc: "Encrypted checkout and payment security.",
        },
        {
            icon: RotateCcw,
            title: "Easy Returns",
            desc: "Hassle-free returns within 30 days.",
        },
        {
            icon: Headphones,
            title: "24/7 Support",
            desc: "Dedicated support whenever you need.",
        },
    ];

    const testimonials = [
        {
            name: "Alexandra Reed",
            text: "The quality exceeded my expectations. Every detail feels premium.",
        },
        {
            name: "James Morrison",
            text: "Elegant designs and incredibly fast delivery.",
        },
        {
            name: "Elena Petrova",
            text: "A luxury shopping experience from start to finish.",
        },
    ];

    return (
        <div className="bg-[#f8f7f5] min-h-screen">
            {/* Navbar replaced by shared Layout/Navbar */}
            

            {/* HERO */}
            <div className="w-full h-fit">
                <HeroSection />
            </div>
            {/* BRAND STATEMENT */}
             <BrandStatement />

            {/* TOP MODEL DESIGN */}
            {/* <section className="max-w-7xl mx-auto px-6 py-24">
                <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.4 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="space-y-6"
                    >
                        <span className="inline-flex items-center rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-800 tracking-[0.18em]">
                            TOP MODEL DESIGN
                        </span>

                        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif tracking-[-0.04em] leading-tight text-slate-900">
                            Discover runway energy in every elegant detail.
                        </h2>

                        <p className="max-w-2xl text-base sm:text-lg leading-8 text-slate-600">
                            Our top model collection blends sculptural tailoring with premium textures and luminous finishes. Each look is designed to capture attention while staying effortlessly modern.
                        </p>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur-sm">
                                <p className="text-[11px] uppercase tracking-[0.35em] text-amber-700">Iconic Look</p>
                                <h3 className="mt-4 text-lg font-semibold text-slate-900">Sculpted tailoring with bold finishes.</h3>
                            </div>
                            <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur-sm">
                                <p className="text-[11px] uppercase tracking-[0.35em] text-amber-700">Premium Fabric</p>
                                <h3 className="mt-4 text-lg font-semibold text-slate-900">Silk blends, satin sheens and luxe textures.</h3>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <Link
                                to="/products"
                                className="inline-flex min-w-[180px] items-center justify-center rounded-full bg-black px-6 py-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                            >
                                Explore Collection
                            </Link>
                            <Link
                                to="/products"
                                className="inline-flex min-w-[180px] items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                            >
                                View All Products
                            </Link>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.4 }}
                        transition={{ duration: 0.9, ease: "easeOut" }}
                        className="grid gap-4"
                    >
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Link to="/products" className="group relative overflow-hidden rounded-[2rem] bg-slate-100 shadow-2xl shadow-black/10 transition hover:-translate-y-1 hover:shadow-2xl">
                                <img
                                    src="https://images.unsplash.com/photo-1520975911063-3aa4838d58bf?auto=format&fit=crop&w=900&q=80"
                                    alt="model look 1"
                                    className="h-[320px] w-full object-cover sm:h-[340px] transition duration-700 ease-out group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                                <div className="absolute bottom-6 left-6 text-white">
                                    <p className="text-[11px] uppercase tracking-[0.3em] text-white/80">NEW DROP</p>
                                    <h3 className="mt-2 text-xl font-semibold">Evening Luxe</h3>
                                </div>
                            </Link>
                            <Link to="/new-arrivals" className="group relative overflow-hidden rounded-[2rem] bg-slate-100 shadow-2xl shadow-black/10 transition hover:-translate-y-1 hover:shadow-2xl">
                                <img
                                    src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80"
                                    alt="model look 2"
                                    className="h-[320px] w-full object-cover sm:h-[340px] transition duration-700 ease-out group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                                <div className="absolute bottom-6 left-6 text-white">
                                    <p className="text-[11px] uppercase tracking-[0.3em] text-white/80">SIGNATURE</p>
                                    <h3 className="mt-2 text-xl font-semibold">Bold Editorial</h3>
                                </div>
                            </Link>
                        </div>

                        <Link to="/products" className="group relative overflow-hidden rounded-[2rem] bg-slate-100 shadow-2xl shadow-black/10 transition hover:-translate-y-1 hover:shadow-2xl">
                            <img
                                src="https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=1200&q=80"
                                alt="model look 3"
                                className="h-[360px] w-full object-cover sm:h-[420px] transition duration-700 ease-out group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                            <div className="absolute bottom-8 left-8 text-white">
                                <p className="text-sm uppercase tracking-[0.35em] text-white/75">MODERN ELEGANCE</p>
                                <h3 className="mt-2 text-3xl font-semibold">Designed for unforgettable moments.</h3>
                            </div>
                        </Link>
                    </motion.div>
                </div>
            </section> */}

            {/* NEW ARRIVALS */}
            <motion.section
                initial={{
                    opacity: 0,
                    scale: 0.9,
                }}
                whileInView={{
                    opacity: 1,
                    scale: 1,
                }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                    duration: 0.8,
                    ease: "easeOut",
                }}
                className="relative h-full max-w-7xl mx-auto px-6 py-10">
                <div className="flex justify-between mb-10">
                    <div>
                        <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs">
                            New Season
                        </span>

                        <h2 className="text-4xl font-bold mt-4">New Arrivals</h2>
                    </div>

                    <Link to="" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition">
                        View All <ArrowRight size={18} />
                    </Link>
                </div>

                <div className="grid md:grid-cols-4 gap-8">
                    {featuredProducts.map((item) => (
                        <motion.div
                            whileHover={{ y: -10 }}
                            key={item.id ?? item.name}
                            className="home-product-card group"
                        >
                            <Link to={`/product/${item.id}`} className="block overflow-hidden rounded-3xl">
                                <img
                                    src={item.images?.[0] || item.image}
                                    alt={item.name}
                                    className="h-80 w-full object-cover group-hover:scale-110 transition duration-500 ease-out"
                                />
                            </Link>

                            {/* <p className="uppercase text-xs text-slate-500 mt-4">
                                {item.category}
                            </p>

                            <h3 className="font-semibold mt-1">{item.name}</h3>

                            <p className="text-slate-700 mt-2 font-semibold">₹{item.discountPrice || item.price}</p> */}

                            <div className="mt-4 flex gap-2">
                                <Link to={`/product/${item.id}`} className="flex-1 bg-[#0d2746] text-white px-4 py-2 rounded-full text-sm text-center hover:bg-[#0a1f34] transition">
                                    View Details
                                </Link>
                                <button
                                    onClick={() => handleAddToCart(item)}
                                    className="flex-1 border border-[#0d2746] text-[#0d2746] px-4 py-2 rounded-full text-sm hover:bg-[#0d2746] hover:text-white transition"
                                >
                                    Add to Cart
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* DENIM BANNER */}
            <section className="py-24 bg-[#0d2746] text-white">
                <motion.div
                    initial={{
                        x: -80, opacity: 0,
                        scale: 0.9,
                    }}
                    whileInView={{
                        x: 0,
                        opacity: 1,

                    }}
                    viewport={{ once: true }}
                    transition={{
                        duration: 1,
                        ease: "easeOut",
                    }}
                    className="relative h-full max-w-6xl mx-auto px-6 text-center">
                    <p className="uppercase tracking-[6px] text-sm text-slate-300">
                        Crafted For Excellence
                    </p>

                    <h2 className="text-5xl md:text-6xl font-light mt-6">
                        Luxury Meets
                        <br />
                        Everyday Wear
                    </h2>

                    <p className="max-w-2xl mx-auto mt-6 text-slate-300">
                        Designed with premium fabrics and timeless silhouettes,
                        our collections redefine modern elegance.
                    </p>
                </motion.div>
            </section>

            {/* FEATURES */}
            <section className="max-w-7xl mx-auto px-6 py-20">
                <div className="text-center mb-14">
                    <h2 className="text-4xl font-bold">
                        The HAIERAH Standard
                    </h2>

                    <p className="text-slate-500 mt-4">
                        Committed to delivering an unparalleled luxury shopping experience.
                    </p>
                </div>

                <div className="grid md:grid-cols-5 gap-6">
                    {features.map((item) => {
                        const Icon = item.icon;

                        return (
                            <motion.div
                                whileHover={{ y: -10 }}
                                key={item.title}
                                className="feature-card bg-white rounded-2xl p-6 text-center shadow-md hover:shadow-lg transition"
                            >
                                <Icon className="mx-auto text-[#0d2746] w-8 h-8" />

                                <h3 className="font-semibold mt-4">
                                    {item.title}
                                </h3>

                                <p className="text-sm text-slate-500 mt-2">
                                    {item.desc}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>
            </section>
             {/* FEATURED COLLECTIONS  */}
                
                 

            {/* TESTIMONIALS */}
            <section className="max-w-7xl mx-auto px-6 py-20">
                <h2 className="text-center text-4xl font-bold mb-12">
                    Customer Voices
                </h2>

                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((item) => (
                        <motion.div
                            whileHover={{ y: -10 }}
                            key={item.name}
                            className="bg-white rounded-3xl p-8"
                        >
                            <div className="flex gap-1 text-yellow-500 mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <Star size={16} fill="currentColor" key={i} />
                                ))}
                            </div>

                            <p className="text-slate-600">
                                "{item.text}"
                            </p>

                            <h4 className="font-semibold mt-6">
                                {item.name}
                            </h4>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* NEWSLETTER */}
            <section className="max-w-5xl mx-auto px-6 pb-20">
                <div className="bg-[#0d2746] rounded-3xl p-16 text-center text-white">
                    <h2 className="text-3xl font-bold">
                        Join the Inner Circle
                    </h2>

                    <p className="text-slate-300 mt-3">
                        Subscribe for exclusive access to new collections and offers.
                    </p>

                    <div className="flex flex-col md:flex-row gap-4 mt-8 justify-center">
                        <input
                            placeholder="Your email address"
                            className="bg-white text-black rounded-full px-6 py-4 md:w-[400px]"
                        />

                        <button className="bg-amber-500 px-8 py-4 rounded-full font-medium">
                            SUBSCRIBE NOW
                        </button>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <Footer />
        </div >
    );
}