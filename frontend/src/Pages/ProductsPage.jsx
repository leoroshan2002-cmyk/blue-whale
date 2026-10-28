import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowDownWideNarrow, ArrowLeft, Search, SlidersHorizontal } from "lucide-react";
import { useCart } from "../Context/CartContext";
import { useWishlist } from "../Context/WhislistContext";
import { useRequireAuthAction } from "../hooks/useRequireAuthAction";
import ProductCard from "../Components/ProductCard";
import { fetchCategories, fetchProducts } from "../services/api";
import { subscribeToCatalogChanges } from "../utils/catalogSync";
import BlueWhaleStandard from "../Components/BlueWhaleStandard";
import "./saree-shop.css";
import heroImage from "../assets/home/reference/gallery-purple.png";
import { filterByCollection, matchesCategory } from "../utils/sareeFilters";

const searchableText = (p) => [p.name, p.category, p.subCategory, p.subcategory, p.collection, p.type, p.description, p.material, ...(Array.isArray(p.tags) ? p.tags : [])].filter(Boolean).join(" ").toLowerCase().replace(/&/g, "and");

export default function ProductsPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const categoryFilter = params.get("category") || "";
  const subcategoryFilter = params.get("subcategory") || "";
  const searchFilter = params.get("search") || "";
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [categoryLoadError, setCategoryLoadError] = useState("");
  const [search, setSearch] = useState(searchFilter);
  const [sort, setSort] = useState("featured");
  const [maxPrice, setMaxPrice] = useState(null);
  const { addToCart } = useCart();
  const { toggleWishlist } = useWishlist();
  const { requireAuthAction } = useRequireAuthAction();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const items = await fetchCategories();
        if (!cancelled) {
          setCategories(items);
          setCategoryLoadError("");
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load product categories:", error);
          setCategories([]);
          setCategoryLoadError(error?.response?.data?.message || error?.message || "Unable to load categories.");
        }
      }
    };
    void load();
    const unsubscribe = subscribeToCatalogChanges(load);
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const items = await fetchProducts();
        if (!cancelled) {
          setProducts(items);
          setLoadError("");
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load products:", error);
          setProducts([]);
          setLoadError(error?.response?.data?.message || error?.message || "Unable to load products.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    const refresh = () => load();
    window.addEventListener("haierah-products-updated", refresh);
    window.addEventListener("haierah-order-created", refresh);
    const unsubscribe = subscribeToCatalogChanges(refresh);
    return () => { cancelled = true; unsubscribe(); window.removeEventListener("haierah-products-updated", refresh); window.removeEventListener("haierah-order-created", refresh); };
  }, []);

  const selectedCategory = useMemo(() => categories.find((category) =>
    category.slug?.toLowerCase() === categoryFilter.toLowerCase()
    || category.name?.toLowerCase() === categoryFilter.toLowerCase()
  ), [categories, categoryFilter]);
  const categoryOptions = useMemo(() => selectedCategory
    ? [...new Set([
      ...(Array.isArray(selectedCategory.subCategories) ? selectedCategory.subCategories : []),
      ...(Array.isArray(selectedCategory.subCategoryCards) ? selectedCategory.subCategoryCards.map((card) => card.name) : []),
    ].filter(Boolean))]
    : [], [selectedCategory]);

  const sliderMax = useMemo(() => {
    const highest = products.reduce((max, p) => Math.max(max, Number(p.discountPrice ?? p.salePrice ?? p.price ?? 0) || 0), 0);
    return Math.max(50000, Math.ceil(highest / 1000) * 1000);
  }, [products]);
  const priceCap = maxPrice ?? sliderMax;

  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => matchesCategory(p, selectedCategory?.name || categoryFilter));
    result = filterByCollection(result, subcategoryFilter);

    const term = search.trim().toLowerCase();
    const filtered = result.filter((p) => {
      const price = Number(p.discountPrice ?? p.salePrice ?? p.price ?? 0);
      return (!term || searchableText(p).includes(term)) && price <= priceCap;
    });
    if (sort === "price-low") filtered.sort((a,b) => Number(a.discountPrice ?? a.price ?? 0) - Number(b.discountPrice ?? b.price ?? 0));
    if (sort === "price-high") filtered.sort((a,b) => Number(b.discountPrice ?? b.price ?? 0) - Number(a.discountPrice ?? a.price ?? 0));
    if (sort === "name") filtered.sort((a,b) => String(a.name).localeCompare(String(b.name)));
    return filtered;
  }, [products, selectedCategory, categoryFilter, subcategoryFilter, search, sort, priceCap]);

  const title = subcategoryFilter || (selectedCategory ? `${selectedCategory.name} Collection` : categoryFilter ? `${categoryFilter} Collection` : "The Collection");
  const handleCart = (product) => { if (requireAuthAction("addToCart", product)) addToCart(product); };

  return <main className="bw-shop">
    <motion.section className="bw-shop-hero" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
      <div className="bw-shop-hero-image" style={{ backgroundImage: `linear-gradient(90deg, rgba(19,13,15,.76), rgba(19,13,15,.16)), url(${heroImage})` }} />
      <motion.div className="bw-shop-hero-copy" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.15 }}>
        <p className="bw-eyebrow">BLUE WHALE · THE COLLECTION</p>
        <h1>{title}</h1>
        <p className="bw-shop-lede">Discover pieces selected from our latest collections.</p>
        <a href="#collection-grid" className="bw-outline-link">EXPLORE THE COLLECTION <span>↓</span></a>
      </motion.div>
      <span className="bw-hero-index">CURATED FOR YOU · 2026</span>
    </motion.section>

    <section className="bw-shop-body" id="collection-grid">
      <div className="bw-shop-heading"><div><p className="bw-eyebrow bw-eyebrow-dark">DISCOVER THE COLLECTION</p><h2>{title}</h2><p className="bw-muted">{loading ? "Preparing the collection…" : `${filteredProducts.length} ${filteredProducts.length === 1 ? "piece" : "pieces"} to discover`}</p></div><Link className="bw-back-link" to={selectedCategory ? `/category/${selectedCategory.slug}` : "/"}><ArrowLeft size={15}/> Back to collections</Link></div>
      <div className="bw-shop-layout">
        <aside className="bw-filters"><div className="bw-filter-title"><SlidersHorizontal size={17}/><span>REFINE YOUR SEARCH</span></div>
          <label className="bw-search"><Search size={16}/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search styles, fabric…" /></label>
          <div className="bw-filter-block"><h3>CATEGORIES</h3><Link className={!categoryFilter ? "active" : ""} to="/shop">All products</Link>{categories.map((category) => <Link key={category.id || category.slug} className={categoryFilter.toLowerCase() === category.slug?.toLowerCase() || categoryFilter.toLowerCase() === category.name?.toLowerCase() ? "active" : ""} to={`/shop?category=${encodeURIComponent(category.slug)}`}>{category.name}</Link>)}</div>
          {categoryOptions.length > 0 && <div className="bw-filter-block"><h3>COLLECTIONS</h3><Link className={!subcategoryFilter ? "active" : ""} to={`/shop?category=${encodeURIComponent(selectedCategory.slug)}`}>All {selectedCategory.name}</Link>{categoryOptions.map((item) => <Link key={item} className={item.toLowerCase() === subcategoryFilter.toLowerCase() ? "active" : ""} to={`/shop?category=${encodeURIComponent(selectedCategory.slug)}&subcategory=${encodeURIComponent(item)}`}>{item}</Link>)}</div>}
          {categoryLoadError && <p className="bw-empty" role="alert">Categories could not be loaded: {categoryLoadError}</p>}
          <div className="bw-filter-block"><h3>PRICE RANGE</h3><div className="bw-price-row"><span>₹0</span><strong>₹{priceCap.toLocaleString("en-IN")}</strong></div><input aria-label="Maximum price" type="range" min="1000" max={sliderMax} step="1000" value={priceCap} onChange={(e) => setMaxPrice(Number(e.target.value))}/></div>
          <div className="bw-filter-note"><span>✳</span><p>Made to be treasured. Find a drape that feels like you.</p></div>
        </aside>
        <div className="bw-shop-results"><div className="bw-results-toolbar"><span>{loading ? "Loading pieces" : `Showing ${filteredProducts.length} pieces`}</span><label><ArrowDownWideNarrow size={15}/><select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort products"><option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="name">Name</option></select></label></div>
          {loading ? <div className="bw-product-grid">{Array.from({length:8},(_,i)=><div className="bw-skeleton" key={i}/>)}</div> : loadError ? <div className="bw-empty" role="alert"><h3>Products could not be loaded</h3><p>{loadError}</p></div> : filteredProducts.length ? <motion.div className="bw-product-grid" initial="hidden" animate="visible" variants={{visible:{transition:{staggerChildren:.06}}}}>{filteredProducts.map((product) => <motion.div key={product.id || product._id} variants={{hidden:{opacity:0,y:22},visible:{opacity:1,y:0}}} transition={{duration:.55}}><ProductCard product={product} onAddToCart={handleCart} onWishlist={toggleWishlist}/></motion.div>)}</motion.div> : <div className="bw-empty"><p className="bw-eyebrow bw-eyebrow-dark">A LITTLE QUIET HERE</p><h3>No pieces found just yet</h3><p>Try another collection or adjust your search and price range.</p><Link to={selectedCategory ? `/shop?category=${encodeURIComponent(selectedCategory.slug)}` : "/shop"}>Explore this category</Link></div>}
        </div>
      </div>
    </section>
    <BlueWhaleStandard/>
  </main>;
}
