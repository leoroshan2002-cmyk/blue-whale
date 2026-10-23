import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./men-collection.css";
import { fetchCategories, fetchProducts } from "../services/api";
import { subscribeToCatalogChanges } from "../utils/catalogSync";
import { DEFAULT_IMAGE_FALLBACK, getSafeImageUrl } from "../utils/productImages";
import { useCart } from "../Context/CartContext";
import { useWishlist } from "../Context/WhislistContext";
import { useRequireAuthAction } from "../hooks/useRequireAuthAction";

/* Put your men's photos in /public/images/men/ and use these names,
   or change the paths below. Without photos the warm gradient shows instead. */
const IMG = {
  hero: "/images/men/hero.jpg",
  story: "/images/men/men-tradition.png",
  details: "/images/men/k4.jpg",
  banner: "/images/men/k6.jpg",
};

const details = [
  { label: "Zari Border", img: "/images/men/d3.jpg" },
  { label: "Weave", img: "/images/men/d2.jpg" },
  { label: "Angavastram", img: "/images/men/d1.jpg" },
];

const bg = (src) => ({ backgroundImage: `url(${src})` });
// stagger delay helper
const delay = (i, step = 0.12) => ({ "--d": `${i * step}s` });

export default function MenCollectionPage() {
  const [products, setProducts] = useState([]);
  const [productsError, setProductsError] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoriesError, setCategoriesError] = useState("");
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { requireAuthAction } = useRequireAuthAction();

  useEffect(() => {
    let cancelled = false;
    fetchCategories()
      .then((items) => {
        if (!cancelled) {
          const menCategory = items.find((item) => item.slug === 'men' || item.name?.toLowerCase() === 'men');
          setCategories(menCategory?.subCategoryCards || []);
          setCategoriesError("");
        }
      })
      .catch((error) => {
        if (!cancelled) {
          console.error("Failed to load men's collections:", error);
          setCategories([]);
          setCategoriesError(error?.response?.data?.message || error?.message || "Unable to load collections.");
        }
      });
    const unsubscribe = subscribeToCatalogChanges(() => {
      fetchCategories()
        .then((items) => {
          if (!cancelled) setCategories(items.find((item) => item.slug === 'men' || item.name?.toLowerCase() === 'men')?.subCategoryCards || []);
        })
        .catch((error) => {
          if (!cancelled) {
            console.error("Failed to refresh men's collections:", error);
            setCategoriesError(error?.response?.data?.message || error?.message || "Unable to refresh collections.");
          }
        });
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const allProducts = await fetchProducts();
        if (cancelled) return;
        setProducts(allProducts.filter((product) => String(product.category || "").trim().toLowerCase() === "men").slice(0, 4));
        setProductsError("");
      } catch (error) {
        if (cancelled) return;
        console.error("Failed to load featured men's products:", error);
        setProducts([]);
        setProductsError(error?.response?.data?.message || error?.message || "Unable to load featured products.");
      }
    };
    load();
    window.addEventListener("haierah-products-updated", load);
    window.addEventListener("haierah-order-created", load);
    return () => {
      cancelled = true;
      window.removeEventListener("haierah-products-updated", load);
      window.removeEventListener("haierah-order-created", load);
    };
  }, []);

  // Scroll reveal for every element with a reveal-* class
  useEffect(() => {
    const els = document.querySelectorAll(
      ".reveal-left, .reveal-right, .reveal-up, .reveal-zoom"
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
  }, []);

  return (
    <main className="men-page">
      {/* HERO */}
      <section className="men-hero" style={{ "--hero-img": `url(${IMG.hero})` }}>
        <div className="men-hero__inner">
          <span className="men-label" style={{ color: "#fff" }}>Men Collection</span>
          <h1>Timeless Veshtis for the Modern Man</h1>
          <p>
            Discover a curated range of traditional and contemporary veshtis,
            made to carry your heritage with ease and confidence.
          </p>
          <Link to="/category/men/all" className="men-btn">Explore collection <span>→</span></Link>
        </div>
      </section>

      {/* STORY */}
      <section className="men-split">
        <div
          className="men-img men-split__img reveal-left"
          style={bg(IMG.story)}
          role="img"
          aria-label="Man in a traditional silk veshti"
        />
        <div className="men-split__body reveal-right">
          <div className="men-split__text">
            <span className="men-label">The art of the veshti</span>
            <h2>Tradition Woven Into Every Thread</h2>
            <p>
              At BLUWHALE, we bring you veshtis that carry the richness of South
              Indian heritage with a modern fit. Each fold tells a story of
              craftsmanship, culture and quiet confidence.
            </p>
            <Link to="/about" className="men-link" style={{ marginTop: 28 }}>Our journey <span>→</span></Link>
          </div>
          <ul className="men-features">
            <li className="reveal-up" style={delay(1, 0.2)}><span className="dot">✦</span><div><b>Premium Fabrics</b><span>Only the finest materials</span></div></li>
            <li className="reveal-up" style={delay(2, 0.2)}><span className="dot">◉</span><div><b>Authentic Weaves</b><span>Rooted in tradition</span></div></li>
            <li className="reveal-up" style={delay(3, 0.2)}><span className="dot">❖</span><div><b>Refined Designs</b><span>For every occasion</span></div></li>
          </ul>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="men-section">
        <div className="men-section__head">
          <div className="reveal-left">
            <span className="men-label">Explore our collections</span>
            <h2>Find Your Perfect Style</h2>
          </div>
          <Link to="/category/men/all" className="men-link reveal-right">View all <span>→</span></Link>
        </div>
        <div className="men-cats">
          {categories.map((c, i) => (
            <Link
              key={c.name}
              to={`/category/men/all?subcategory=${encodeURIComponent(c.name)}`}
              className="men-cat men-img reveal-up"
              style={{ ...bg(getSafeImageUrl(c.image, DEFAULT_IMAGE_FALLBACK)), ...delay(i) }}
            >
              <h3>{c.name}</h3>
              <small>{c.subtitle}</small>
              <span className="go">→</span>
            </Link>
          ))}
          {categoriesError && <p role="alert">{categoriesError}</p>}
        </div>
      </section>

      {/* DETAILS */}
      <section className="men-details">
        <div
          className="men-img men-details__img reveal-left"
          style={bg(IMG.details)}
          role="img"
          aria-label="Veshti with zari border"
        />
        <div className="men-details__body">
          <div className="men-details__text reveal-right">
            <span className="men-label">The details matter</span>
            <h2>Crafted with Care, Woven with Love</h2>
            <p>
              Experience the beauty of fine zari borders, rich textures and
              matching angavastrams that make our veshtis truly special.
            </p>
            <Link to="/category/men/all" className="men-link">Explore details <span>→</span></Link>
          </div>
          <div className="men-thumbs">
            {details.map((d, i) => (
              <figure key={d.label} className="reveal-zoom" style={delay(i, 0.15)}>
                <div className="men-img" style={bg(d.img)} />
                <figcaption>{d.label}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED */}
      <section className="men-section">
        <div className="reveal-left">
          <span className="men-label">Featured veshtis</span>
        </div>
        <div className="men-section__head" style={{ marginTop: 10 }}>
          <h2 className="reveal-left">Refined Choices for You</h2>
          <Link to="/category/men/all" className="men-link reveal-right">View all <span>→</span></Link>
        </div>
        <div className="men-products">
          {products.map((p, i) => {
            const id = p.id || p._id;
            const image = getSafeImageUrl(p.images?.[0] || p.image, DEFAULT_IMAGE_FALLBACK);
            const price = Number(p.discountPrice ?? p.salePrice ?? p.price ?? 0);
            return (
            <article key={id} className="reveal-up" style={delay(i)}>
              <div className="men-product-media">
                <Link to={`/product/${id}`} className="men-img men-product__img" style={bg(image)} aria-label={`View ${p.name}`} />
                <button
                  className={`men-heart ${isWishlisted(id) ? "on" : ""}`}
                  onClick={() => {
                    if (requireAuthAction("toggleWishlist", p)) toggleWishlist(p);
                  }}
                  aria-label={isWishlisted(id) ? "Remove from wishlist" : "Add to wishlist"}
                >
                  {isWishlisted(id) ? "♥" : "♡"}
                </button>
              </div>
              <div className="men-product__info">
                <div>
                  <Link to={`/product/${id}`}><h3>{p.name}</h3></Link>
                  <p>₹ {price.toLocaleString("en-IN")}</p>
                </div>
                <button className="men-bag" disabled={Number(p.stock) <= 0} onClick={() => {
                  if (requireAuthAction("addToCart", p)) addToCart(p);
                }} aria-label={`Add ${p.name} to bag`}>👜</button>
              </div>
            </article>
          );})}
          {productsError && <p role="alert">{productsError}</p>}
          {!productsError && products.length === 0 && <p>No men’s products are available yet.</p>}
        </div>
      </section>

      {/* CLOSING BANNER */}
      <section className="men-banner" style={{ "--banner-img": `url(${IMG.banner})` }}>
        <div className="reveal-zoom">
          <h2>TIMELESS. ROOTED. BLUEWHALE.</h2>
          <p>Veshtis that carry your heritage.</p>
          <Link to="/category/men/all">Explore now →</Link>
        </div>
      </section>
    </main>
  );
}
