import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./men-collection.css";

/* Put your men's photos in /public/images/men/ and use these names,
   or change the paths below. Without photos the warm gradient shows instead. */
const IMG = {
  hero: "/images/men/hero.jpg",
  story: "/images/men/men-tradition.png",
  details: "/images/men/k4.jpg",
  banner: "/images/men/k6.jpg",
};

/* Category images are temporary (reusing existing photos).
   Replace with silk.jpg, festive.jpg, wedding.jpg, cotton.jpg, ready.jpg when ready. */
const categories = [
  { title: "Silk Veshtis", sub: "Luxury in every fold", img: "/images/men/k1.jpg" },
  { title: "Festive Veshtis", sub: "Shine brighter", img: "/images/men/k2.jpg" },
  { title: "Wedding Edit", sub: "For your special day", img: "/images/men/k3.jpg" },
  { title: "Cotton Classics", sub: "Heritage in every thread", img: "/images/men/k4.jpg" },
  { title: "Ready to Wear", sub: "Tradition meets today", img: "/images/men/k5.jpg" },
];

const products = [
  { id: 1, name: "Ivory Gold Silk Veshti", price: 7499, img: "/images/men/p3.jpg" },
  { id: 2, name: "Temple Border Cotton", price: 2499, img: "/images/men/p2.jpg" },
  { id: 3, name: "Royal Maroon Wedding Set", price: 12999, img: "/images/men/p1.jpg" },
  { id: 4, name: "Pre-Stitched Festive Veshti", price: 3999, img: "/images/men/p4.jpg" },
];

const details = [
  { label: "Zari Border", img: "/images/men/d3.jpg" },
  { label: "Weave", img: "/images/men/d2.jpg" },
  { label: "Angavastram", img: "/images/men/d1.jpg" },
];

const bg = (src) => ({ backgroundImage: `url(${src})` });
// stagger delay helper
const delay = (i, step = 0.12) => ({ "--d": `${i * step}s` });

export default function MenCollectionPage() {
  const [liked, setLiked] = useState({});
  const [bag, setBag] = useState([]);

  const toggleLike = (id) => setLiked((l) => ({ ...l, [id]: !l[id] }));
  // Replace with your real cart logic (context / redux / API)
  const addToBag = (p) => setBag((b) => [...b, p]);

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
              key={c.title}
              to="/category/men/all"
              className="men-cat men-img reveal-up"
              style={{ ...bg(c.img), ...delay(i) }}
            >
              <h3>{c.title}</h3>
              <small>{c.sub}</small>
              <span className="go">→</span>
            </Link>
          ))}
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
          {products.map((p, i) => (
            <article key={p.id} className="reveal-up" style={delay(i)}>
              <div className="men-img men-product__img" style={bg(p.img)}>
                <button
                  className={`men-heart ${liked[p.id] ? "on" : ""}`}
                  onClick={() => toggleLike(p.id)}
                  aria-label={liked[p.id] ? "Remove from wishlist" : "Add to wishlist"}
                >
                  {liked[p.id] ? "♥" : "♡"}
                </button>
              </div>
              <div className="men-product__info">
                <div>
                  <h3>{p.name}</h3>
                  <p>₹ {p.price.toLocaleString("en-IN")}</p>
                </div>
                <button className="men-bag" onClick={() => addToBag(p)} aria-label={`Add ${p.name} to bag`}>👜</button>
              </div>
            </article>
          ))}
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
