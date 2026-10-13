import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Heart, ShoppingBag } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { useCart } from "../Context/CartContext";
import { useWishlist } from "../Context/WhislistContext";
import { useRequireAuthAction } from "../hooks/useRequireAuthAction";
import { fetchProducts } from "../services/api";
import { subscribeToCatalogChanges } from "../utils/catalogSync";
import { DEFAULT_IMAGE_FALLBACK, getSafeImageUrl, normalizeImageList } from "../utils/productImages";
import { isSareeProduct } from "../utils/sareeFilters";

import heroImg from "../assets/home/women.jpeg";
import pinkImg from "../assets/home/pink.jpeg";
import redImg from "../assets/home/red.jpeg";
import whiteImg from "../assets/home/white.jpeg";
import goldImg from "../assets/home/gold.jpeg";
import darkPinkImg from "../assets/home/dark-pink.jpeg";

import "../women-collection.css";

gsap.registerPlugin(ScrollTrigger);

const COLLECTIONS = [
  { title: "Traditional Sarees", subtitle: "TIMELESS INDIAN ELEGANCE", image: pinkImg, category: "Traditional Sarees" },
  { title: "Printed Sarees", subtitle: "ARTISTRY IN EVERY PRINT", image: darkPinkImg, category: "Printed Sarees" },
  { title: "Traditional Silk Sarees", subtitle: "LUXURY IN EVERY DRAPE", image: goldImg, category: "Traditional Silk Sarees" },
  { title: "Woven & Zari Sarees", subtitle: "HERITAGE WOVEN IN GOLD", image: redImg, category: "Woven & Zari Sarees" },
  { title: "Floral Printed Sarees", subtitle: "FRESH FLORALS, GRACEFUL DRAPES", image: whiteImg, category: "Floral Printed Sarees" },
];

const DETAIL_IMAGES = [
  { label: "Zari Work", image: redImg },
  { label: "Texture", image: goldImg },
  { label: "Embellishments", image: pinkImg },
];

function Arrow() {
  return <ArrowRight size={15} strokeWidth={1.4} />;
}

function EditorialProductCard({ product, onAddToCart, onWishlist, wishlisted }) {
  const image = getSafeImageUrl(normalizeImageList(product.images?.length ? product.images : [product.image])[0], DEFAULT_IMAGE_FALLBACK);
  const name = product.name;
  const price = product.discountPrice || product.price;
  const id = product.id || product._id;
  const safeProduct = product;

  return (
    <article className="wc-product-card" data-reveal>
      <div className="wc-product-media">
        <Link to={`/product/${id}`} aria-label={`View ${name}`}>
          <img src={image} alt={name} loading="lazy" onError={(e) => { e.currentTarget.src = DEFAULT_IMAGE_FALLBACK; }} />
        </Link>
        <button
          type="button"
          aria-label={`Add ${name} to wishlist`}
          className={`wc-product-heart ${wishlisted ? "is-active" : ""}`}
          onClick={() => onWishlist?.(safeProduct)}
        >
          <Heart size={19} strokeWidth={1.3} />
        </button>
      </div>
      <div className="wc-product-info">
        <div>
          <Link to={`/product/${id}`} className="wc-product-name">{name}</Link>
          <div className="wc-product-price">₹ {Number(price).toLocaleString("en-IN")}</div>
        </div>
        <button
          type="button"
          className="wc-product-cart"
          aria-label={`Add ${name} to cart`}
          onClick={() => onAddToCart?.(safeProduct)}
        >
          <ShoppingBag size={18} strokeWidth={1.4} />
        </button>
      </div>
    </article>
  );
}

export default function WomenCollectionPage() {
  const root = useRef(null);
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [productsError, setProductsError] = useState("");
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { requireAuthAction } = useRequireAuthAction();

  const womenProducts = useMemo(
    () => products.filter((product) => String(product?.category || "").toLowerCase() === "women" && isSareeProduct(product)).slice(0, 4),
    [products]
  );

  useEffect(() => {
    document.title = "Women — Blue Whale Collection | Timeless Sarees";
    return () => { document.title = "Blue Whale Collection"; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await fetchProducts();
        if (!cancelled) {
          setProducts(data);
          setProductsError("");
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load women's collection products:", error);
          setProducts([]);
          setProductsError(error?.response?.data?.message || error?.message || "Unable to load products.");
        }
      }
    };
    load();
    const refresh = () => load();
    window.addEventListener("haierah-products-updated", refresh);
    window.addEventListener("haierah-order-created", refresh);
    const unsubscribe = subscribeToCatalogChanges(refresh);
    return () => {
      cancelled = true;
      unsubscribe();
      window.removeEventListener("haierah-products-updated", refresh);
      window.removeEventListener("haierah-order-created", refresh);
    };
  }, []);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) {
        gsap.set("[data-wc-reveal], [data-wc-title], .wc-hero-copy", { clearProps: "all", opacity: 1, y: 0 });
        return;
      }

      gsap.to(".wc-hero-image", {
        scale: 1.02,
        ease: "none",
        scrollTrigger: {
            trigger: ".wc-hero",
            start: "top top",
            end: "bottom top",
            scrub: true,
        },
      });
      gsap.fromTo(".wc-hero-copy > *", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1.05, stagger: 0.1, delay: 0.2, ease: "power3.out" });
      gsap.to(".wc-hero-image", {
        yPercent: 8,
        ease: "none",
        scrollTrigger: { trigger: ".wc-hero", start: "top top", end: "bottom top", scrub: true },
      });

      gsap.utils.toArray("[data-wc-reveal]").forEach((el) => {
        gsap.fromTo(el, { opacity: 0, y: 34 }, {
          opacity: 1, y: 0, duration: 0.9, ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });

      gsap.utils.toArray("[data-wc-parallax]").forEach((el) => {
        gsap.to(el, {
          yPercent: 5,
          ease: "none",
          scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true },
        });
      });

      gsap.utils.toArray("[data-wc-title]").forEach((title) => {
        gsap.fromTo(title.querySelectorAll("span"), { yPercent: 105 }, { yPercent: 0, duration: 1.1, stagger: 0.08, ease: "power4.out", scrollTrigger: { trigger: title, start: "top 86%", once: true } });
      });
    }, root);

    return () => ctx.revert();
  }, [location.pathname]);

  const handleAddToCart = (product) => {
    if (!product?.id && !product?._id) return;
    if (!requireAuthAction("addToCart", product)) return;
    addToCart(product);
  };

  const handleWishlist = (product) => {
    if (!product?.id && !product?._id) return;
    if (!requireAuthAction("wishlist", product)) return;
    toggleWishlist(product);
  };

  return (
    <div ref={root} className="wc-page">
      <section className="wc-hero">
        <div className="wc-hero-media"><img className="wc-hero-image" src={heroImg} alt="Blue Whale Collection traditional saree collection" /></div>
        <div className="wc-hero-overlay" />
        <div className="wc-hero-copy">
          <p className="wc-kicker">WOMEN COLLECTION</p>
          <h1>Timeless Sarees<br />for the Modern Woman</h1>
          <p className="wc-hero-description">Discover a curated range of traditional and contemporary sarees designed to celebrate your grace, culture and confidence.</p>
          <Link className="wc-light-button" to="#collections">EXPLORE COLLECTION <Arrow /></Link>
        </div>
      </section>

      <section className="wc-art" data-wc-reveal>
        <div className="wc-art-image"><img src={whiteImg} alt="Traditional saree from Blue Whale Collection" data-wc-parallax /></div>
        <div className="wc-art-copy">
          <div>
            <p className="wc-kicker wc-dark-kicker">THE ART OF THE SAREE</p>
            <h2>Tradition Woven<br />Into Every Thread</h2>
            <p>At Blue Whale Collection, we bring you sarees that embody the richness of Indian heritage with a modern touch. Each drape tells a story of craftsmanship, culture and timeless elegance.</p>
            <Link to="/brand-story" className="wc-text-link">OUR JOURNEY <Arrow /></Link>
          </div>
          <div className="wc-benefits">
            <div><span className="wc-benefit-icon">♧</span><div><strong>Premium Fabrics</strong><small>Only the finest materials</small></div></div>
            <div><span className="wc-benefit-icon">◉</span><div><strong>Authentic Weaves</strong><small>Rooted in tradition</small></div></div>
            <div><span className="wc-benefit-icon">✧</span><div><strong>Elegant Designs</strong><small>For every occasion</small></div></div>
          </div>
        </div>
      </section>

      <section id="collections" className="wc-collections">
        <div className="wc-section-heading" data-wc-reveal>
          <div><p className="wc-kicker wc-dark-kicker">EXPLORE OUR COLLECTIONS</p><h2>Find Your Perfect Style</h2></div>
          <Link to="/products?category=women" className="wc-view-all">VIEW ALL <Arrow /></Link>
        </div>
        <div className="wc-collection-grid">
          {COLLECTIONS.map((item) => (
            <Link to={`/products?category=women&subcategory=${encodeURIComponent(item.category)}`} className="wc-collection-card" key={item.title} data-wc-reveal>
              <img src={item.image} alt={item.title} loading="lazy" />
              <div className="wc-card-shade" />
              <div className="wc-card-copy"><h3>{item.title}</h3><p>{item.subtitle}</p><span><Arrow /></span></div>
            </Link>
          ))}
        </div>
      </section>

      <section className="wc-details" data-wc-reveal>
        <div className="wc-details-image"><img src={pinkImg} alt="Zari saree details" data-wc-parallax /></div>
        <div className="wc-details-copy">
          <p className="wc-kicker wc-dark-kicker">THE DETAILS MATTER</p>
          <h2>Crafted with Care,<br />Woven with Love</h2>
          <p>Experience the beauty of intricate zari work, rich textures and exquisite detailing that make our sarees truly special.</p>
          <Link to="/category/women" className="wc-text-link">EXPLORE DETAILS <Arrow /></Link>
        </div>
        <div className="wc-detail-thumbs">
          {DETAIL_IMAGES.map((item) => <div className="wc-detail-thumb" key={item.label}><img src={item.image} alt={item.label} /><span>{item.label}</span></div>)}
        </div>
      </section>

      <section className="wc-featured">
        <div className="wc-section-heading" data-wc-reveal>
          <div><p className="wc-kicker wc-dark-kicker">FEATURED SAREES</p><h2>Elegant Choices for You</h2></div>
          <Link to="/products" className="wc-view-all">VIEW ALL <Arrow /></Link>
        </div>
        <div className="wc-product-grid">
          {productsError ? <p role="alert">{productsError}</p> : womenProducts.map((product) => (
            <EditorialProductCard key={product.id || product._id} product={product} onAddToCart={handleAddToCart} onWishlist={handleWishlist} wishlisted={isWishlisted(product.id)} />
          ))}
        </div>
      </section>

      <section className="wc-closing" data-wc-reveal>
        <img src={darkPinkImg} alt="Blue Whale Collection timeless saree" data-wc-parallax />
        <div className="wc-closing-overlay" />
        <div className="wc-closing-copy"><p>TIMELESS. ROOTED. BLUE WHALE.</p><span>Drapes that celebrate you.</span><Link to="/products">EXPLORE NOW <Arrow /></Link></div>
      </section>
    </div>
  );
}
