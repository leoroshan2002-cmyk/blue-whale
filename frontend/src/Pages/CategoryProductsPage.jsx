import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./men-products.css";
import { fetchCategories, fetchProducts } from "../services/api";
import { subscribeToCatalogChanges } from "../utils/catalogSync";
import { DEFAULT_IMAGE_FALLBACK, getSafeImageUrl } from "../utils/productImages";
import { useCart } from "../Context/CartContext";
import { useWishlist } from "../Context/WhislistContext";
import { useRequireAuthAction } from "../hooks/useRequireAuthAction";

const MAX_PRICE = 20000;
const inr = (n) => "₹" + n.toLocaleString("en-IN");
const productPrice = (product) => Number(product.discountPrice ?? product.salePrice ?? product.price ?? 0);
const productColors = (product) => product.colors || product.variants?.colors || [];
const colorName = (color) => typeof color === "string" ? color : color?.name || color?.value || color?.hex || "";
const colorValue = (color) => typeof color === "string" ? color : color?.hex || color?.value || "";

const Stars = ({ value }) => (
  <span className="mp-stars" aria-label={`${value} out of 5`}>
    {[1, 2, 3, 4, 5].map((i) => (
      <span key={i}>{value >= i ? "★" : value >= i - 0.5 ? "⯪" : "☆"}</span>
    ))}
  </span>
);

function FilterGroup({ title, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="mp-group">
      <button className="mp-group__head" onClick={() => setOpen(!open)} aria-expanded={open}>
        {title} <span>{open ? "⌃" : "⌄"}</span>
      </button>
      {open && <div className="mp-group__body">{children}</div>}
    </div>
  );
}

export default function CategoryProductsPage({ categoryName = "men" }) {
  const { search } = useLocation();
  const requestedCategory = new URLSearchParams(search).get("subcategory") || "All Products";
  const [category, setCategory] = useState(requestedCategory);
  const title = categoryName === "women" ? "Women" : "Men";
  const categoryPath = `/category/${categoryName}`;
  const [maxPrice, setMaxPrice] = useState(null);
  const [fabrics, setFabrics] = useState([]);
  const [colours, setColours] = useState([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState("featured");
  const [view, setView] = useState("grid");
  const [products, setProducts] = useState([]);
  const [managedSubcategories, setManagedSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { requireAuthAction } = useRequireAuthAction();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const allProducts = await fetchProducts();
        if (cancelled) return;
        setProducts(allProducts.filter((product) => String(product.category || "").trim().toLowerCase() === categoryName));
        setLoadError("");
      } catch (error) {
        if (cancelled) return;
        console.error(`Failed to load ${categoryName}'s products:`, error);
        setProducts([]);
        setLoadError(error?.response?.data?.message || error?.message || "Unable to load products.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    const unsubscribe = subscribeToCatalogChanges(load);
    window.addEventListener("haierah-products-updated", load);
    window.addEventListener("haierah-order-created", load);
    return () => {
      cancelled = true;
      unsubscribe();
      window.removeEventListener("haierah-products-updated", load);
      window.removeEventListener("haierah-order-created", load);
    };
  }, [categoryName]);

  useEffect(() => {
    let cancelled = false;
    const loadCategories = async () => {
      try {
        const categories = await fetchCategories();
        if (!cancelled) {
          const categoryData = categories.find((item) => item.slug === categoryName || item.name?.toLowerCase() === categoryName);
          setManagedSubcategories([...new Set([
            ...(categoryData?.subCategories || []),
            ...(categoryData?.subCategoryCards || []).map((card) => card.name),
          ])]);
        }
      } catch (error) {
        if (!cancelled) {
          console.error(`Failed to load ${categoryName}'s subcategories:`, error);
        }
      }
    };
    loadCategories();
    const unsubscribe = subscribeToCatalogChanges(loadCategories);
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [categoryName]);

  const toggle = (list, setList, v) =>
    setList(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const categoryList = useMemo(() => {
    const fromProducts = products.map((p) => p.subCategory || p.subcategory).filter(Boolean);
    return [...new Set([...managedSubcategories, ...fromProducts])];
  }, [managedSubcategories, products]);
  const fabricList = useMemo(() => [...new Set(products.map((p) => p.material || p.fabric).filter(Boolean))], [products]);
  const colourList = useMemo(() => {
    const values = products.flatMap(productColors).filter(Boolean);
    return [...new Map(values.map((color) => [colorName(color), color])).values()];
  }, [products]);
  const sliderMax = useMemo(() => Math.max(MAX_PRICE, Math.ceil(Math.max(0, ...products.map(productPrice)) / 1000) * 1000), [products]);
  const priceLimit = maxPrice ?? sliderMax;
  const counts = (value) => products.filter((product) => (product.subCategory || product.subcategory) === value).length;

  const visible = useMemo(() => {
    let list = products.filter(
      (p) =>
        (category === "All Products" || (p.subCategory || p.subcategory) === category) &&
        productPrice(p) <= priceLimit &&
        (!fabrics.length || fabrics.includes(p.material || p.fabric)) &&
        (!colours.length || productColors(p).some((color) => colours.includes(colorName(color)))) &&
        (!inStockOnly || Number(p.stock) > 0)
    );
    const sorters = {
      "price-asc": (a, b) => productPrice(a) - productPrice(b),
      "price-desc": (a, b) => productPrice(b) - productPrice(a),
      name: (a, b) => String(a.name).localeCompare(String(b.name)),
    };
    if (sorters[sort]) list = [...list].sort(sorters[sort]);
    return list;
  }, [products, category, priceLimit, fabrics, colours, inStockOnly, sort]);

  const clearAll = () => {
    setCategory("All Products"); setMaxPrice(null); setFabrics([]);
    setColours([]); setInStockOnly(false);
  };

  const handleWishlist = (product) => {
    if (requireAuthAction("toggleWishlist", product)) toggleWishlist(product);
  };
  const handleAddToCart = (product) => {
    if (requireAuthAction("addToCart", product)) addToCart(product);
  };

  return (
    <main className="mp-page">
      {/* Breadcrumb + title banner */}
      <section className="mp-hero">
        <nav className="mp-crumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link> › <Link to={categoryPath}>{title}</Link> › <b>All Products</b>
        </nav>
        <h1>{title} Collection</h1>
        <p>{categoryName === "women"
          ? "Timeless sarees. Refined craftsmanship. Traditional style."
          : "Timeless veshtis. Refined craftsmanship. Traditional style."}</p>
      </section>

      <div className="mp-layout">
        {/* SIDEBAR */}
        <aside className="mp-side">
          <FilterGroup title="Categories">
            <ul className="mp-cats">
              {["All Products", ...categoryList].map((c) => (
                <li key={c}>
                  <button className={category === c ? "active" : ""} onClick={() => setCategory(c)}>
                    <span>{c}</span>
                    <small>({c === "All Products" ? products.length : counts(c)})</small>
                  </button>
                </li>
              ))}
            </ul>
          </FilterGroup>

          <FilterGroup title="Price range">
            <input
              type="range" min="0" max={sliderMax} step="500" value={priceLimit}
              onChange={(e) => setMaxPrice(+e.target.value)}
              className="mp-range" aria-label="Maximum price"
            />
            <div className="mp-range__labels"><span>₹0</span><span>{inr(priceLimit)}</span></div>
          </FilterGroup>

          <FilterGroup title="Fabric type">
            {fabricList.map((f) => (
              <label key={f} className="mp-check">
                <input type="checkbox" checked={fabrics.includes(f)} onChange={() => toggle(fabrics, setFabrics, f)} />
                {f}
              </label>
            ))}
          </FilterGroup>

          <FilterGroup title="Colour">
            <div className="mp-swatches">
              {colourList.map((color) => (
                <button
                  key={colorName(color)} title={colorName(color)} aria-label={colorName(color)} aria-pressed={colours.includes(colorName(color))}
                  className={colours.includes(colorName(color)) ? "on" : ""} style={{ background: colorValue(color) || "#d8c8b5" }}
                  onClick={() => toggle(colours, setColours, colorName(color))}
                />
              ))}
            </div>
          </FilterGroup>

          <FilterGroup title="Availability">
            <label className="mp-check">
              <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} />
              In stock only
            </label>
          </FilterGroup>

          <button className="mp-clear" onClick={clearAll}>Clear all filters</button>
        </aside>

        {/* RESULTS */}
        <section className="mp-results">
          <div className="mp-toolbar">
            <strong>{loading ? "Loading products…" : `${visible.length} Products`}</strong>
            <div className="mp-toolbar__right">
              <label>
                Sort By:
                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="featured">Featured</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name">Name</option>
                </select>
              </label>
              <button className={view === "grid" ? "on" : ""} onClick={() => setView("grid")} aria-label="Grid view">▦</button>
              <button className={view === "list" ? "on" : ""} onClick={() => setView("list")} aria-label="List view">☰</button>
            </div>
          </div>

          {loadError ? (
            <div className="mp-empty" role="alert">{loadError}</div>
          ) : loading ? (
            <div className="mp-empty" aria-live="polite">Loading products…</div>
          ) : visible.length === 0 ? (
            <div className="mp-empty">
              <p>No products match these filters.</p>
              <button onClick={clearAll}>Clear all filters</button>
            </div>
          ) : (
            <div className={`mp-grid ${view}`}>
              {visible.map((p) => {
                const price = productPrice(p);
                const originalPrice = Number(p.price || 0);
                const off = originalPrice > price && originalPrice > 0 ? Math.round((1 - price / originalPrice) * 100) : 0;
                const image = getSafeImageUrl(p.images?.[0] || p.image, DEFAULT_IMAGE_FALLBACK);
                const id = p.id || p._id;
                return (
                  <article key={id} className="mp-card">
                    <div className="mp-card__img">
                      <Link to={`/product/${id}`} className="mp-product-image-link" aria-label={`View ${p.name}`}>
                        <img src={image} alt={p.name} loading="lazy" onError={(event) => { event.currentTarget.src = DEFAULT_IMAGE_FALLBACK; }} />
                      </Link>
                      {!p.badge && off > 0 && <span className="mp-badge off">{off}% OFF</span>}
                      <button
                        className={`mp-heart ${isWishlisted(id) ? "on" : ""}`}
                        onClick={() => handleWishlist(p)}
                        aria-label={isWishlisted(id) ? "Remove from wishlist" : "Add to wishlist"}
                      >{isWishlisted(id) ? "♥" : "♡"}</button>
                    </div>
                    <div className="mp-card__body">
                      <Link to={`/product/${id}`}><h3>{p.name}</h3></Link>
                      {p.rating && <div className="mp-rate"><Stars value={p.rating} /> {p.reviews && <small>({p.reviews})</small>}</div>}
                      <div className="mp-price">
                        <b>{inr(price)}</b>
                        {off > 0 && <><s>M.R.P. {inr(originalPrice)}</s><em>{off}% OFF</em></>}
                      </div>
                      <button className="mp-add" disabled={Number(p.stock) <= 0} onClick={() => handleAddToCart(p)}>
                        {Number(p.stock) > 0 ? " Add to Cart" : "Out of Stock"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}