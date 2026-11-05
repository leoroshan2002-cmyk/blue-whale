import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Heart, ShoppingBag } from "lucide-react";

import { useCart } from "../Context/CartContext";
import { useWishlist } from "../Context/WhislistContext";
import { useRequireAuthAction } from "../hooks/useRequireAuthAction";
import { fetchCategories, fetchProducts, resolveBackendImageUrl } from "../services/api";
import { subscribeToCatalogChanges } from "../utils/catalogSync";
import {
  DEFAULT_IMAGE_FALLBACK,
  getSafeImageUrl,
  normalizeImageList,
} from "../utils/productImages";

import heroImage from "../assets/home/reference/hero-couple.png";
import storyImage from "../assets/home/white.jpeg";
import detailsImage from "../assets/home/pink.jpeg";
import bannerImage from "../assets/home/dark-pink.jpeg";

import "./combo.css";

const normalize = (value) => String(value || "").trim().toLowerCase();
const resolveCollectionImage = (image, fallback) => {
  const safeImage = getSafeImageUrl(image, fallback);
  return safeImage.startsWith("/uploads")
    ? resolveBackendImageUrl(safeImage)
    : safeImage;
};

function ComboProductCard({ product, onAddToCart, onWishlist, wishlisted }) {
  const id = product.id || product._id;
  const images = normalizeImageList(product.images?.length ? product.images : product.image);
  const image = getSafeImageUrl(images[0], DEFAULT_IMAGE_FALLBACK);
  const price = Number(product.discountPrice ?? product.salePrice ?? product.price ?? 0);
  const originalPrice = Number(product.price ?? 0);
  const outOfStock = Number(product.stock) <= 0;

  return (
    <article className="cc-product-card">
      <div className="cc-product-media">
        <Link to={`/product/${id}`} aria-label={`View ${product.name}`}>
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            onError={(event) => {
              event.currentTarget.src = DEFAULT_IMAGE_FALLBACK;
            }}
          />
        </Link>
        <button
          type="button"
          className={`cc-product-heart ${wishlisted ? "is-active" : ""}`}
          aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          onClick={() => onWishlist(product)}
        >
          <Heart size={19} strokeWidth={1.4} />
        </button>
        {outOfStock && <span className="cc-stock-label">Sold out</span>}
      </div>
      <div className="cc-product-info">
        <div className="cc-product-copy">
          <Link to={`/product/${id}`} className="cc-product-name">{product.name}</Link>
          <div className="cc-product-price">
            ₹ {price.toLocaleString("en-IN")}
            {originalPrice > price && (
              <span className="cc-original-price">₹ {originalPrice.toLocaleString("en-IN")}</span>
            )}
          </div>
        </div>
        <button
          type="button"
          className="cc-product-cart"
          aria-label={`Add ${product.name} to cart`}
          disabled={outOfStock}
          onClick={() => onAddToCart(product)}
        >
          <ShoppingBag size={18} strokeWidth={1.5} />
        </button>
      </div>
    </article>
  );
}

export default function ComboCollectionPage() {
  const location = useLocation();
  const selectedSubcategory = new URLSearchParams(location.search).get("subcategory") || "";
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { requireAuthAction } = useRequireAuthAction();

  const collections = useMemo(() => {
    const cards = Array.isArray(category?.subCategoryCards) ? category.subCategoryCards : [];
    return cards.filter((card) => card?.name);
  }, [category]);

  const comboProducts = useMemo(() => {
    const categoryName = normalize(category?.name || "combo");
    const categorySlug = normalize(category?.slug || "combo");
    return products.filter((product) => {
      const productCategory = normalize(product.category);
      const matchesCategory = productCategory === categoryName || productCategory === categorySlug;
      const productSubcategories = [
        ...(Array.isArray(product.subCategories) ? product.subCategories : []),
        ...(Array.isArray(product.subCategory) ? product.subCategory : [product.subCategory]),
      ].map(normalize);
      return matchesCategory
        && (!selectedSubcategory || productSubcategories.includes(normalize(selectedSubcategory)));
    });
  }, [category, products, selectedSubcategory]);

  const hero = resolveCollectionImage(category?.image, heroImage);

  useEffect(() => {
    document.title = "Combo Collection | Blue Whale";
    return () => { document.title = "Blue Whale Collection"; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadCatalog = async () => {
      setLoading(true);
      try {
        const [categories, catalog] = await Promise.all([fetchCategories(), fetchProducts()]);
        if (cancelled) return;
        const comboCategory = categories.find(
          (item) => normalize(item.slug) === "combo" || normalize(item.name) === "combo"
        );
        setCategory(comboCategory || null);
        setProducts(catalog);
        setError("");
      } catch (loadError) {
        if (!cancelled) {
          console.error("Failed to load Combo collection:", loadError);
          setError(loadError?.response?.data?.message || loadError?.message || "Unable to load the Combo collection.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadCatalog();
    const refresh = () => { void loadCatalog(); };
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

  const handleAddToCart = (product) => {
    if (Number(product.stock) <= 0) return;
    if (requireAuthAction("addToCart", product)) addToCart(product);
  };

  const handleWishlist = (product) => {
    if (requireAuthAction("toggleWishlist", product)) toggleWishlist(product);
  };

  return (
    <main className="combo-page">
      <section className="cc-hero" style={{ "--hero-img": `url("${hero}")` }}>
        <div className="cc-hero__copy">
          <p className="cc-kicker">BLUE WHALE · COMBO COLLECTION</p>
          <h1>Made for Two,<br />Woven as One</h1>
          <p className="cc-hero__desc">
            Discover coordinated traditional styles for every celebration,
            thoughtfully selected from the Blue Whale collection.
          </p>
          <a className="cc-btn" href="#combo-collections">
            EXPLORE COLLECTIONS <ArrowRight size={15} strokeWidth={1.4} />
          </a>
        </div>
      </section>

      <section className="cc-art">
        <div className="cc-art-image">
          <img src={storyImage} alt="Traditional fabric and handcrafted details" />
        </div>
        <div className="cc-art-copy">
          <div>
            <p className="cc-kicker cc-dark">THE ART OF TOGETHER</p>
            <h2>Collections for<br />Every Occasion</h2>
            <p>
              Explore the Combo collection curated by Blue Whale. Browse the
              latest styles, find a collection that suits your celebration, and
              shop real products managed by our team.
            </p>
            <Link to="/brand-story" className="cc-text-link">OUR JOURNEY <ArrowRight size={15} /></Link>
          </div>
          <div className="cc-benefits">
            <div><span className="cc-benefit-icon">✦</span><span><strong>Curated Collections</strong><small>Updated by our team</small></span></div>
            <div><span className="cc-benefit-icon">◉</span><span><strong>Real Catalog Products</strong><small>Current styles and pricing</small></span></div>
            <div><span className="cc-benefit-icon">✧</span><span><strong>Made for Occasions</strong><small>Find a style for your day</small></span></div>
          </div>
        </div>
      </section>

      <section id="combo-collections" className="cc-collections">
        <div className="cc-section-heading">
          <div>
            <p className="cc-kicker cc-dark">EXPLORE THE COMBO COLLECTION</p>
            <h2>Find Your Perfect Style</h2>
          </div>
          <Link to="/category/combo" className="cc-view-all">VIEW ALL <ArrowRight size={15} /></Link>
        </div>
        {error ? (
          <p className="cc-state" role="alert">{error}</p>
        ) : loading ? (
          <p className="cc-state" role="status">Loading Combo collections…</p>
        ) : collections.length ? (
          <div className="cc-collection-grid">
            {collections.map((collection) => (
              <Link
                to={`/category/combo?subcategory=${encodeURIComponent(collection.name)}#combo-products`}
                className="cc-collection-card"
                key={collection.name}
              >
                <img
                  src={resolveCollectionImage(collection.image, DEFAULT_IMAGE_FALLBACK)}
                  alt={collection.name}
                  loading="lazy"
                  onError={(event) => { event.currentTarget.src = DEFAULT_IMAGE_FALLBACK; }}
                />
                <span className="cc-card-shade" />
                <span className="cc-card-copy">
                  <strong>{collection.name}</strong>
                  {collection.subtitle && <span>{collection.subtitle}</span>}
                  <span className="cc-card-link">EXPLORE COLLECTION <ArrowRight size={15} /></span>
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="cc-empty-collections">
            <h3>No Combo collections yet</h3>
            <p>Add collection cards in Admin under Subcategory cards, then choose Combo.</p>
          </div>
        )}
      </section>

      <section className="cc-details">
        <div className="cc-details-image">
          <img src={detailsImage} alt="Intricate textile and zari details" loading="lazy" />
        </div>
        <div className="cc-details-copy">
          <p className="cc-kicker cc-dark">THE DETAILS MATTER</p>
          <h2>Thoughtful Styles,<br />Chosen with Care</h2>
          <p>Discover curated pieces and collections created for celebrations, gatherings and everyday traditions.</p>
          <Link to="/category/combo#combo-products" className="cc-text-link">SHOP COMBO <ArrowRight size={15} /></Link>
        </div>
        <div className="cc-detail-thumbs">
          {collections.slice(0, 3).map((collection) => (
            <Link
              className="cc-detail-thumb"
              to={`/category/combo?subcategory=${encodeURIComponent(collection.name)}#combo-products`}
              key={collection.name}
            >
              <img
                src={resolveCollectionImage(collection.image, DEFAULT_IMAGE_FALLBACK)}
                alt=""
                loading="lazy"
                onError={(event) => { event.currentTarget.src = DEFAULT_IMAGE_FALLBACK; }}
              />
              <span>{collection.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section id="combo-products" className="cc-featured">
        <div className="cc-section-heading">
          <div>
            <p className="cc-kicker cc-dark">
              {selectedSubcategory ? selectedSubcategory.toUpperCase() : "FEATURED COMBO PRODUCTS"}
            </p>
            <h2>{selectedSubcategory || "Explore the Collection"}</h2>
          </div>
          {selectedSubcategory && (
            <Link to="/category/combo#combo-products" className="cc-view-all">
              CLEAR FILTER <ArrowRight size={15} />
            </Link>
          )}
        </div>
        {error ? (
          <p className="cc-state" role="alert">{error}</p>
        ) : loading ? (
          <p className="cc-state" role="status">Loading Combo products…</p>
        ) : comboProducts.length ? (
          <div className="cc-product-grid">
            {comboProducts.map((product) => (
              <ComboProductCard
                key={product.id || product._id}
                product={product}
                onAddToCart={handleAddToCart}
                onWishlist={handleWishlist}
                wishlisted={isWishlisted(product.id || product._id)}
              />
            ))}
          </div>
        ) : (
          <div className="cc-empty-collections">
            <h3>{selectedSubcategory ? "No products in this collection yet" : "No Combo products yet"}</h3>
            <p>
              Add products in Admin and assign them to the Combo category
              {selectedSubcategory ? ` and ${selectedSubcategory}` : ""}.
            </p>
          </div>
        )}
      </section>

      <section className="cc-closing" style={{ "--banner-img": `url("${bannerImage}")` }}>
        <div className="cc-closing-copy">
          <p>TIMELESS. ROOTED. BLUE WHALE.</p>
          <span>Discover styles made for your moments together.</span>
          <Link to="/category/combo#combo-collections">EXPLORE COMBO <ArrowRight size={15} /></Link>
        </div>
      </section>
    </main>
  );
}
