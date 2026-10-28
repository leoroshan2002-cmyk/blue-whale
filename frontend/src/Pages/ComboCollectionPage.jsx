import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Heart, ShoppingBag } from "lucide-react";

import { useCart } from "../Context/CartContext";
import { useWishlist } from "../Context/WhislistContext";
import { useRequireAuthAction } from "../hooks/useRequireAuthAction";
import { fetchProducts } from "../services/api";
import { subscribeToCatalogChanges } from "../utils/catalogSync";

// Women images (same ones the Women page uses)
import heroImg from "../assets/home/women.jpeg";
import pinkImg from "../assets/home/pink.jpeg";
import redImg from "../assets/home/red.jpeg";
import whiteImg from "../assets/home/white.jpeg";
import goldImg from "../assets/home/gold.jpeg";
import darkPinkImg from "../assets/home/dark-pink.jpeg";

import "./combo.css";

/* Men images live in /public/images/men/ (same as the Men page).
   TEMPORARY: reusing existing photos. Replace with real couple photos later,
   e.g. /images/combo/hero.jpg, and change the values below. */
const MEN_STORY = "/images/men/men-tradition.png";
const MEN_HERO = "/images/men/hero.jpg";

const IMG = {
  hero: heroImg, // replace with a couple photo: "/images/combo/hero.jpg"
  story: whiteImg,
  details: pinkImg,
  banner: darkPinkImg,
};

const LINK_ALL = "/shop?category=unisex";

const COLLECTIONS = [
  { title: "Wedding Pairs", subtitle: "FOR YOUR SPECIAL DAY", image: redImg },
  { title: "Festive Pairs", subtitle: "SHINE BRIGHTER TOGETHER", image: goldImg },
  { title: "Engagement Edit", subtitle: "BEGIN YOUR FOREVER", image: MEN_STORY },
  { title: "Anniversary Sets", subtitle: "CELEBRATE YOUR STORY", image: pinkImg },
  { title: "Everyday Pairs", subtitle: "TRADITION MEETS TODAY", image: MEN_HERO },
];

const DETAIL_IMAGES = [
  { label: "Matching Zari", image: redImg },
  { label: "Same Palette", image: MEN_STORY },
  { label: "Coordinated Borders", image: goldImg },
];

const FALLBACK_NAMES = ["Ivory Gold Pair", "Royal Maroon Pair", "Blush Rose Pair", "Golden Heritage Pair"];
const FALLBACK_PRICES = [15999, 18499, 16799, 19299];
const PRODUCT_VISUALS = [whiteImg, redImg, pinkImg, goldImg];

const delay = (i, step = 0.12) => ({ "--d": `${i * step}s` });

function Arrow() {
  return <ArrowRight size={15} strokeWidth={1.4} />;
}

function ComboProductCard({ product, index, onAddToCart, onWishlist, wishlisted }) {
  const image = PRODUCT_VISUALS[index % PRODUCT_VISUALS.length];
  const name = product?.name || FALLBACK_NAMES[index];
  const price = product?.discountPrice || product?.price || FALLBACK_PRICES[index];
  const id = product?.id || product?._id;

  return (
    <article className="cc-product-card reveal-up" style={delay(index)}>
      <div className="cc-product-media">
        <Link to={id ? `/product/${id}` : LINK_ALL} aria-label={`View ${name}`}>
          <img src={image} alt={name} loading="lazy" />
        </Link>
        <button
          type="button"
          aria-label={`Add ${name} to wishlist`}
          className={`cc-product-heart ${wishlisted ? "is-active" : ""}`}
          onClick={() => onWishlist?.(product)}
          disabled={!product}
        >
          <Heart size={19} strokeWidth={1.3} />
        </button>
      </div>
      <div className="cc-product-info">
        <div>
          <Link to={id ? `/product/${id}` : LINK_ALL} className="cc-product-name">{name}</Link>
          <div className="cc-product-price">₹ {Number(price).toLocaleString("en-IN")}</div>
        </div>
        <button
          type="button"
          className="cc-product-cart"
          aria-label={`Add ${name} to cart`}
          onClick={() => onAddToCart?.(product)}
          disabled={!product}
        >
          <ShoppingBag size={18} strokeWidth={1.4} />
        </button>
      </div>
    </article>
  );
}

export default function ComboCollectionPage() {
  const [products, setProducts] = useState([]);
  const [productsError, setProductsError] = useState("");
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { requireAuthAction } = useRequireAuthAction();

  const comboProducts = useMemo(
    () =>
      products
        .filter((p) => ["unisex", "combo"].includes(String(p?.category || "").toLowerCase()))
        .slice(0, 4),
    [products]
  );

  useEffect(() => {
    document.title = "Combo — Blue Whale Collection | Made for Two";
    return () => { document.title = "Blue Whale Collection"; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await fetchProducts();
        if (!cancelled) {
          setProducts(Array.isArray(data) ? data : []);
          setProductsError("");
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load combo collection products:", error);
          setProducts([]);
          setProductsError(error?.response?.data?.message || error?.message || "Unable to load combo products.");
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

  // Scroll reveal (left / right / up / zoom)
  useEffect(() => {
    const els = document.querySelectorAll(
      ".combo-page .reveal-left, .combo-page .reveal-right, .combo-page .reveal-up, .combo-page .reveal-zoom"
    );
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in-view");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -50px 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [comboProducts.length]);

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
    <div className="combo-page">
      {/* HERO */}
      <section className="cc-hero" style={{ "--hero-img": `url(${IMG.hero})` }}>
        <div className="cc-hero__copy">
          <p className="cc-kicker">COMBO COLLECTION</p>
          <h1>Made for Two,<br />Woven as One</h1>
          <p className="cc-hero__desc">
            Discover matching sarees and veshtis, crafted in the same silk, the
            same zari and the same story, so you walk into every occasion together.
          </p>
          <Link className="cc-btn" to={LINK_ALL}>EXPLORE COLLECTION <Arrow /></Link>
        </div>
      </section>

      {/* STORY */}
      <section className="cc-art">
        <div className="cc-art-image reveal-left">
          <img src={IMG.story} alt="Matching saree and veshti" />
        </div>
        <div className="cc-art-copy reveal-right">
          <div>
            <p className="cc-kicker cc-dark">THE ART OF TOGETHER</p>
            <h2>Two Outfits,<br />One Beautiful Story</h2>
            <p>
              At Blue Whale Collection, every combo is woven as a pair. The saree and the
              veshti share the same fabric, the same zari border and the same
              palette, so your day looks perfectly matched, without trying.
            </p>
            <Link to="/brand-story" className="cc-text-link">OUR JOURNEY <Arrow /></Link>
          </div>
          <div className="cc-benefits">
            <div className="reveal-up" style={delay(1, 0.2)}><span className="cc-benefit-icon">♧</span><div><strong>Perfectly Matched</strong><small>Same fabric, same zari</small></div></div>
            <div className="reveal-up" style={delay(2, 0.2)}><span className="cc-benefit-icon">◉</span><div><strong>Premium Fabrics</strong><small>Only the finest materials</small></div></div>
            <div className="reveal-up" style={delay(3, 0.2)}><span className="cc-benefit-icon">✧</span><div><strong>Made for Occasions</strong><small>Weddings, festivals and more</small></div></div>
          </div>
        </div>
      </section>

      {/* COLLECTIONS */}
      <section id="collections" className="cc-collections">
        <div className="cc-section-heading">
          <div className="reveal-left">
            <p className="cc-kicker cc-dark">EXPLORE OUR COLLECTIONS</p>
            <h2>Find Your Perfect Pair</h2>
          </div>
          <Link to={LINK_ALL} className="cc-view-all reveal-right">VIEW ALL <Arrow /></Link>
        </div>
        <div className="cc-collection-grid">
          {COLLECTIONS.map((item, i) => (
            <Link to={LINK_ALL} className="cc-collection-card reveal-up" style={delay(i)} key={item.title}>
              <img src={item.image} alt={item.title} loading="lazy" />
              <div className="cc-card-shade" />
              <div className="cc-card-copy">
                <h3>{item.title}</h3>
                <p>{item.subtitle}</p>
                <span><Arrow /></span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* DETAILS */}
      <section className="cc-details">
        <div className="cc-details-image reveal-left">
          <img src={IMG.details} alt="Matching zari details" />
        </div>
        <div className="cc-details-copy reveal-right">
          <p className="cc-kicker cc-dark">THE DETAILS MATTER</p>
          <h2>Matched with Care,<br />Woven with Love</h2>
          <p>
            Experience matching zari borders, shared colour palettes and
            coordinated textures that make every pair truly special.
          </p>
          <Link to={LINK_ALL} className="cc-text-link">EXPLORE DETAILS <Arrow /></Link>
        </div>
        <div className="cc-detail-thumbs">
          {DETAIL_IMAGES.map((item, i) => (
            <div className="cc-detail-thumb reveal-zoom" style={delay(i, 0.15)} key={item.label}>
              <img src={item.image} alt={item.label} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="cc-featured">
        <div className="cc-section-heading">
          <div className="reveal-left">
            <p className="cc-kicker cc-dark">FEATURED COMBOS</p>
            <h2>Pairs Made for You</h2>
          </div>
          <Link to={LINK_ALL} className="cc-view-all reveal-right">VIEW ALL <Arrow /></Link>
        </div>
        <div className="cc-product-grid">
          {(comboProducts.length ? comboProducts : [null, null, null, null]).map((product, index) => (
            <ComboProductCard
              key={product?.id || product?._id || index}
              product={product}
              index={index}
              onAddToCart={handleAddToCart}
              onWishlist={handleWishlist}
              wishlisted={product ? isWishlisted(product.id || product._id) : false}
            />
          ))}
        </div>
        {productsError && <p role="alert" className="mt-4 text-sm text-red-700">{productsError}</p>}
      </section>

      {/* CLOSING BANNER */}
      <section className="cc-closing" style={{ "--banner-img": `url(${IMG.banner})` }}>
        <div className="cc-closing-copy reveal-zoom">
          <p>TIMELESS. ROOTED. BLUE WHALE.</p>
          <span>Outfits that celebrate you, together.</span>
          <Link to={LINK_ALL}>EXPLORE NOW <Arrow /></Link>
        </div>
      </section>
    </div>
  );
}
