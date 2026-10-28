import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  ShoppingCart,
  Trash2,
  ArrowRight,
  Flower2,
} from "lucide-react";
import { useWishlist } from "../Context/WhislistContext";
import { useCart } from "../Context/CartContext";
import "./Wishlist.css";

const categories = ["All", "Sarees", "Dhotis"];

export default function Wishlist() {
  const navigate = useNavigate();
  const { wishlist = [], isWishlistReady, wishlistError, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [activeCategory, setActiveCategory] = useState("All");

  const getCategory = (product) =>
    `${product.category || ""} ${product.type || ""} ${product.name || ""}`.toLowerCase();

  const sareeCount = wishlist.filter((p) => /saree/.test(getCategory(p))).length;
  const dhotiCount = wishlist.filter((p) => /dhoti|veshti/.test(getCategory(p))).length;

  const products = useMemo(() => {
    return wishlist.filter((product) => {
      if (activeCategory === "All") return true;
      const category = getCategory(product);
      if (activeCategory === "Sarees") return /saree/.test(category);
      return /dhoti|veshti/.test(category);
    });
  }, [wishlist, activeCategory]);

  const formatPrice = (product) => {
    const price = Number(product.discountPrice ?? product.salePrice ?? product.price ?? 0);
    return `₹ ${price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const productId = (product) => product.id || product._id || product.productId;
  const productImage = (product) =>
    product.image ||
    (Array.isArray(product.images) ? product.images[0] : "") ||
    "/images/saree-placeholder.png";

  return (
    <main className="bw-wishlist">
      <section className="bw-wishlist-hero">
        <div className="bw-wishlist-hero-content">
          <p className="bw-eyebrow">BLUE WHALE COLLECTION</p>
          <h1>My Wishlist</h1>
          <p className="bw-hero-subtitle">
            Beautiful pieces, saved for your next chapter.
          </p>
          <span className="bw-gold-divider" />
        </div>
      </section>

      <section className="bw-wishlist-layout">
        <aside className="bw-wishlist-aside">
          <p className="bw-aside-heading">
            TRADITION<br />MEETS<br />YOUR<br />STYLE
          </p>
          <span className="bw-aside-divider" />
          <p className="bw-aside-copy">
            The finest sarees and dhotis, worth keeping close.
          </p>
          <Flower2 className="bw-aside-flower" />
        </aside>

        <div className="bw-wishlist-content">
          <div className="bw-wishlist-toolbar">
            <div className="bw-filter-tabs">
              {categories.map((category) => {
                const count =
                  category === "All" ? wishlist.length :
                  category === "Sarees" ? sareeCount : dhotiCount;

                return (
                  <button
                    key={category}
                    type="button"
                    className={`bw-filter ${activeCategory === category ? "active" : ""}`}
                    onClick={() => setActiveCategory(category)}
                  >
                    {category} ({count})
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              className="bw-clear-button"
              onClick={clearWishlist}
              disabled={!wishlist.length}
            >
              <Trash2 size={16} /> Clear All
            </button>
          </div>

          {!isWishlistReady ? (
            <p role="status" className="py-12 text-center text-gray-600">Loading your saved wishlist…</p>
          ) : wishlistError ? (
            <p role="alert" className="py-12 text-center text-red-700">{wishlistError}</p>
          ) : products.length > 0 ? (
            <div className="bw-wishlist-grid">
              {products.map((product) => (
                <article className="bw-product-card" key={productId(product)}>
                  <div
                    className="bw-product-image-wrap"
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/product/${productId(product)}`)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") navigate(`/product/${productId(product)}`);
                    }}
                  >
                    <img
                      src={productImage(product)}
                      alt={product.name || product.title || "Saved product"}
                      className="bw-product-image"
                    />
                    <span className="bw-product-type">
                      {product.category || product.type || "Collection"}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="bw-heart-button"
                    aria-label="Remove from wishlist"
                    onClick={() => removeFromWishlist(productId(product))}
                  >
                    <Heart size={21} fill="#c63c32" color="#c63c32" />
                  </button>

                  <div className="bw-product-info">
                    <h2>{product.name || product.title || "Blue Whale Collection"}</h2>
                    <p className="bw-product-description">
                      {product.description || product.material || "A timeless piece from our collection"}
                    </p>
                    <p className="bw-product-price">{formatPrice(product)}</p>

                    <div className="bw-product-meta">
                      <span>Size: {product.selectedSize || product.size || "Free Size"}</span>
                      <span>Color: {product.selectedColor || product.color || "As shown"}</span>
                    </div>

                    <div className="bw-product-actions">
                      <button
                        type="button"
                        className="bw-add-cart"
                        onClick={() => addToCart({
                          ...product,
                          id: productId(product),
                          image: productImage(product),
                          stock: Number(product.stock ?? 1),
                        })}
                      >
                        <ShoppingCart size={16} /> Add to Cart
                      </button>
                      <button
                        type="button"
                        className="bw-remove-button"
                        aria-label="Remove product"
                        onClick={() => removeFromWishlist(productId(product))}
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="bw-empty-wishlist">
              <Heart size={38} />
              <h2>Your wishlist is waiting</h2>
              <p>Save your favourite pieces to find them here.</p>
              <button
                type="button"
                className="bw-add-cart"
                onClick={() => navigate("/shop")}
              >
                Explore Collection <ArrowRight size={17} />
              </button>
            </div>
          )}

          <section className="bw-wishlist-cta">
            <Flower2 className="bw-cta-flower" />
            <div className="bw-cta-text">
              <h2>Still thinking?</h2>
              <p>Your favourite pieces are waiting.</p>
            </div>
            <button
              type="button"
              className="bw-continue-button"
              onClick={() => navigate("/shop")}
            >
              Continue Shopping <ArrowRight size={16} />
            </button>
          </section>
        </div>
      </section>

      <footer className="bw-wishlist-benefits">
        <div>
          <span className="bw-benefit-icon">♧</span>
          <section><h3>Secure Payments</h3><p>Shop with confidence</p></section>
        </div>
        <div>
          <span className="bw-benefit-icon">♧</span>
          <section><h3>Fast Delivery</h3><p>Across India</p></section>
        </div>
        <div>
          <span className="bw-benefit-icon">✧</span>
          <section><h3>Premium Quality</h3><p>Tradition in every thread</p></section>
        </div>
      </footer>
    </main>
  );
}
