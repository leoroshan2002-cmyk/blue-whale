import React, { useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

import HomeFooter from "../Components/home/HomeFooter";
import "../home.css";

import heroCouple from "../assets/home/reference/HomeHero.png";

// WOMEN'S SAREE IMAGES
import sareeDarkPink from "../assets/home/reference/saree - dark pink.png";
import sareePink from "../assets/home/reference/saree pink.png";
import sareeGold from "../assets/home/reference/saree-gold.png";
import sareeLavender from "../assets/home/reference/saree-lavendar.png";
import sareeOrange from "../assets/home/reference/saree-lite orange.png";
import sareePinkAlt from "../assets/home/reference/saree-pink.png";
import sareeRed from "../assets/home/reference/saree-red.png";

// MEN'S IMAGE
import menImage from "../assets/home/reference/bluewhale-men.jpeg";

gsap.registerPlugin(ScrollTrigger);

// SHOP BY COLOUR - WOMEN
const WOMEN_COLOURS = [
  {
    name: "Pink",
    image: sareePink,
    main: sareePink,
  },
  {
    name: "Red",
    image: sareeRed,
    main: sareeRed,
  },
  {
    name: "Gold",
    image: sareeGold,
    main: sareeGold,
  },
  {
    name: "Dark Pink",
    image: sareeDarkPink,
    main: sareeDarkPink,
  },
  {
    name: "Lavender",
    image: sareeLavender,
    main: sareeLavender,
  },
  {
    name: "Light Orange",
    image: sareeOrange,
    main: sareeOrange,
  },
  {
    name: "Rose Pink",
    image: sareePinkAlt,
    main: sareePinkAlt,
  },
];

// SHOP BY COLOUR - MEN
// Reusing the available men's image is intentional.
const MEN_COLOURS = [
  {
    name: "Traditional",
    image: menImage,
    main: menImage,
  },
  {
    name: "Classic",
    image: menImage,
    main: menImage,
  },
  {
    name: "Heritage",
    image: menImage,
    main: menImage,
  },
  {
    name: "Timeless",
    image: menImage,
    main: menImage,
  },
];

// BEST SELLERS
const BEST = [
  sareeGold,
  menImage,
  sareeRed,
  sareeDarkPink,
  sareeLavender,
];

// WOMEN EDITORIAL GALLERY
const GALLERY = [
  sareePink,
  sareeGold,
  sareeLavender,
  sareeRed,
  sareePinkAlt,
];

export default function HomePage() {
  const root = useRef(null);

  const [gender, setGender] = useState("women");
  const [colourIndex, setColourIndex] = useState(0);

  const colours = gender === "women" ? WOMEN_COLOURS : MEN_COLOURS;
  const selected = colours[colourIndex % colours.length];

  // GSAP ANIMATIONS
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Hero text animation
      gsap.from(".bw-hero-copy > *", {
        y: 26,
        opacity: 0,
        duration: 1.1,
        stagger: 0.08,
        ease: "power3.out",
      });

      // Section reveal animations
      gsap.utils.toArray("[data-bw-reveal]").forEach((el) => {
        gsap.from(el, {
          y: 60,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 86%",
            once: true,
          },
        });
      });

      // Parallax image animations
      gsap.utils.toArray("[data-bw-parallax]").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 26 },
          {
            y: -26,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      });

      // Best sellers and gallery card animations
      gsap.utils
        .toArray(".bw-best-card, .bw-gallery-card")
        .forEach((el, i) => {
          gsap.from(el, {
            y: 70 + (i % 3) * 16,
            opacity: 0,
            duration: 1,
            delay: i * 0.04,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 90%",
              once: true,
            },
          });
        });
    }, root);

    return () => ctx.revert();
  }, []);

  // CHANGE BETWEEN MEN AND WOMEN
  const changeGender = (value) => {
    setGender(value);
    setColourIndex(0);
  };

  // PREVIOUS COLOUR
  const previousColour = () => {
    setColourIndex(
      (current) => (current - 1 + colours.length) % colours.length
    );
  };

  // NEXT COLOUR
  const nextColour = () => {
    setColourIndex((current) => (current + 1) % colours.length);
  };

  return (
    <main ref={root} className="bw-home">
      {/* HERO SECTION */}
      <section className="bw-hero">
        <img
          className="bw-hero-image"
          src={heroCouple}
          alt="Blue Whale Traditional Collection"
        />

        <div className="bw-hero-overlay" />

        <div className="bw-hero-copy">
          <h1>
            Timeless
            <br />
            Elegance
          </h1>

          <p>
            Grace in every drape. Tradition in every thread.
            <br />
            Sarees for her. Dhotis for him.
          </p>

          <Link className="bw-button" to="/category/women">
            EXPLORE COLLECTIONS <ArrowRight size={14} />
          </Link>
        </div>

        <div className="bw-hero-side">
          TRADITIONAL
          <br />
          WEAR
          <br />
          FOR MODERN
          <br />
          YOU
        </div>
      </section>

      {/* SHOP BY COLOUR */}
      <section className="bw-colour" data-bw-reveal>
        <div className="bw-section-head">
          <div>
            <h2>Shop by Colour</h2>
            <p>Find your perfect shade of tradition</p>
          </div>

          <div
            className="bw-toggle"
            role="tablist"
            aria-label="Shop by gender"
          >
            <button
              type="button"
              role="tab"
              aria-selected={gender === "women"}
              className={gender === "women" ? "active" : ""}
              onClick={() => changeGender("women")}
            >
              WOMEN
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={gender === "men"}
              className={gender === "men" ? "active" : ""}
              onClick={() => changeGender("men")}
            >
              MEN
            </button>
          </div>
        </div>

        <div className="bw-colour-layout">
          {/* SELECTED COLOUR IMAGE */}
          <div className="bw-colour-main">
            <img
              key={`${gender}-${colourIndex}`}
              src={selected.main}
              alt={`${selected.name} traditional collection`}
            />

            <div className="bw-colour-main-shade" />

            <div className="bw-colour-main-copy">
              <h3>{selected.name}</h3>

              <p>
                {gender === "women"
                  ? "Soft hues, royal vibes."
                  : "Classic tradition, refined."}
              </p>

              <Link
                to={
                  gender === "women"
                    ? "/category/women"
                    : "/category/men"
                }
              >
                SHOP NOW <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* COLOUR SELECTOR */}
          <div className="bw-colour-picker">
            <button
              type="button"
              className="bw-round-arrow"
              onClick={previousColour}
              aria-label="Previous colour"
            >
              <ChevronLeft />
            </button>

            <div className="bw-colour-track">
              {colours.map((item, index) => (
                <button
                  type="button"
                  key={`${gender}-${item.name}`}
                  className={`bw-colour-item ${
                    index === colourIndex ? "active" : ""
                  }`}
                  onClick={() => setColourIndex(index)}
                  aria-pressed={index === colourIndex}
                >
                  <span className="bw-colour-image">
                    <img src={item.image} alt={item.name} />
                  </span>

                  <span>{item.name}</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              className="bw-round-arrow"
              onClick={nextColour}
              aria-label="Next colour"
            >
              <ChevronRight />
            </button>

            <div className="bw-dots">
              {colours.map((item, index) => (
                <span
                  key={item.name}
                  className={index === colourIndex ? "active" : ""}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* BEST SELLERS */}
      <section className="bw-best" data-bw-reveal>
        <div className="bw-best-copy">
          <span>BEST SELLERS</span>

          <h2>
            Best
            <br />
            Sellers
          </h2>

          <p>
            The drapes you return to —
            <br />
            chosen with love, worn into memories.
          </p>

          <Link className="bw-button" to="/products">
            EXPLORE ALL <ArrowRight size={14} />
          </Link>
        </div>

        <div className="bw-best-grid">
          {BEST.map((src, i) => (
            <Link
              to={i === 1 ? "/category/men" : "/category/women"}
              className={`bw-best-card card-${i}`}
              key={`best-${i}`}
              data-bw-parallax
            >
              <img
                src={src}
                alt={
                  i === 1
                    ? "Blue Whale men's traditional collection"
                    : "Blue Whale saree collection"
                }
                loading="lazy"
              />
            </Link>
          ))}
        </div>
      </section>

      {/* WOMEN EDITORIAL GALLERY */}
      <section className="bw-gallery" data-bw-reveal>
        <div className="bw-gallery-head">
          <div>
            <span>FEATURED</span>

            <h2>
              Women Editorial
              <br />
              Gallery
            </h2>

            <p>
              Modern grace. Timeless tradition.
              <br />
              A celebration of every woman.
            </p>
          </div>

          <Link to="/category/women">
            EXPLORE ALL <ArrowRight size={14} />
          </Link>
        </div>

        <div className="bw-gallery-grid">
          {GALLERY.map((src, i) => (
            <Link
              to="/category/women"
              className={`bw-gallery-card gallery-${i}`}
              key={`gallery-${i}`}
              data-bw-parallax
            >
              <img
                src={src}
                alt={`Blue Whale saree editorial ${i + 1}`}
                loading="lazy"
              />
            </Link>
          ))}
        </div>
      </section>

      {/* CUSTOMER BENEFITS */}
      <section className="bw-benefits">
        <div>
          <strong>♧</strong>
          <span>
            Free Shipping
            <small>On all orders</small>
          </span>
        </div>

        <div>
          <strong>♢</strong>
          <span>
            Secure Payments
            <small>100% safe &amp; encrypted</small>
          </span>
        </div>

        <div>
          <strong>↻</strong>
          <span>
            Easy Returns
            <small>Hassle-free process</small>
          </span>
        </div>

        <div>
          <strong>♧</strong>
          <span>
            Customer Support
            <small>We're here to help</small>
          </span>
        </div>
      </section>

      {/* FOOTER */}
      <HomeFooter />
    </main>
  );
}