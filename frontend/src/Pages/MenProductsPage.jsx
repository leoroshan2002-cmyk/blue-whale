import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./men-products.css";
import { menProducts, COLOURS, CATEGORY_LIST, FABRICS, OCCASIONS } from "./menProducts";

const MAX_PRICE = 20000;
const inr = (n) => "₹" + n.toLocaleString("en-IN");

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

export default function MenProductsPage() {
  const [category, setCategory] = useState("All Products");
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
  const [fabrics, setFabrics] = useState([]);
  const [colours, setColours] = useState([]);
  const [occasions, setOccasions] = useState([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState("featured");
  const [view, setView] = useState("grid");
  const [liked, setLiked] = useState({});
  const [cart, setCart] = useState([]);

  const toggle = (list, setList, v) =>
    setList(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const counts = (key) => (v) => menProducts.filter((p) => p[key] === v).length;

  const visible = useMemo(() => {
    let list = menProducts.filter(
      (p) =>
        (category === "All Products" || p.category === category) &&
        p.price <= maxPrice &&
        (!fabrics.length || fabrics.includes(p.fabric)) &&
        (!colours.length || colours.includes(p.colour)) &&
        (!occasions.length || p.occasion.some((o) => occasions.includes(o))) &&
        (!inStockOnly || p.inStock)
    );
    const sorters = {
      "price-asc": (a, b) => a.price - b.price,
      "price-desc": (a, b) => b.price - a.price,
      rating: (a, b) => b.rating - a.rating,
      popular: (a, b) => b.reviews - a.reviews,
    };
    if (sorters[sort]) list = [...list].sort(sorters[sort]);
    return list;
  }, [category, maxPrice, fabrics, colours, occasions, inStockOnly, sort]);

  const clearAll = () => {
    setCategory("All Products"); setMaxPrice(MAX_PRICE); setFabrics([]);
    setColours([]); setOccasions([]); setInStockOnly(false);
  };

  // Replace with your real cart logic (context / redux / API)
  const addToCart = (p) => setCart((c) => [...c, p]);

  return (
    <main className="mp-page">
      {/* Breadcrumb + title banner */}
      <section className="mp-hero">
        <nav className="mp-crumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link> › <Link to="/category/men">Men</Link> › <b>All Products</b>
        </nav>
        <h1>Men’s Collection</h1>
        <p>Timeless veshtis. Refined craftsmanship. Traditional style.</p>
      </section>

      <div className="mp-layout">
        {/* SIDEBAR */}
        <aside className="mp-side">
          <FilterGroup title="Categories">
            <ul className="mp-cats">
              {["All Products", ...CATEGORY_LIST].map((c) => (
                <li key={c}>
                  <button className={category === c ? "active" : ""} onClick={() => setCategory(c)}>
                    <span>{c}</span>
                    <small>({c === "All Products" ? menProducts.length : counts("category")(c)})</small>
                  </button>
                </li>
              ))}
            </ul>
          </FilterGroup>

          <FilterGroup title="Price range">
            <input
              type="range" min="0" max={MAX_PRICE} step="500" value={maxPrice}
              onChange={(e) => setMaxPrice(+e.target.value)}
              className="mp-range" aria-label="Maximum price"
            />
            <div className="mp-range__labels"><span>₹0</span><span>{maxPrice >= MAX_PRICE ? "₹20,000+" : inr(maxPrice)}</span></div>
          </FilterGroup>

          <FilterGroup title="Fabric type">
            {FABRICS.map((f) => (
              <label key={f} className="mp-check">
                <input type="checkbox" checked={fabrics.includes(f)} onChange={() => toggle(fabrics, setFabrics, f)} />
                {f} <small>({counts("fabric")(f)})</small>
              </label>
            ))}
          </FilterGroup>

          <FilterGroup title="Colour">
            <div className="mp-swatches">
              {Object.entries(COLOURS).map(([name, hex]) => (
                <button
                  key={name} title={name} aria-label={name} aria-pressed={colours.includes(name)}
                  className={colours.includes(name) ? "on" : ""} style={{ background: hex }}
                  onClick={() => toggle(colours, setColours, name)}
                />
              ))}
            </div>
          </FilterGroup>

          <FilterGroup title="Occasion">
            {OCCASIONS.map((o) => (
              <label key={o} className="mp-check">
                <input type="checkbox" checked={occasions.includes(o)} onChange={() => toggle(occasions, setOccasions, o)} />
                {o} <small>({menProducts.filter((p) => p.occasion.includes(o)).length})</small>
              </label>
            ))}
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
            <strong>{visible.length} Products</strong>
            <div className="mp-toolbar__right">
              <label>
                Sort By:
                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="featured">Featured</option>
                  <option value="popular">Most Popular</option>
                  <option value="rating">Top Rated</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </label>
              <button className={view === "grid" ? "on" : ""} onClick={() => setView("grid")} aria-label="Grid view">▦</button>
              <button className={view === "list" ? "on" : ""} onClick={() => setView("list")} aria-label="List view">☰</button>
            </div>
          </div>

          {visible.length === 0 ? (
            <div className="mp-empty">
              <p>No veshtis match these filters.</p>
              <button onClick={clearAll}>Clear all filters</button>
            </div>
          ) : (
            <div className={`mp-grid ${view}`}>
              {visible.map((p) => {
                const off = p.mrp ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0;
                return (
                  <article key={p.id} className="mp-card">
                    <div className="mp-card__img" style={{ backgroundImage: `url(${p.img})` }}>
                      {p.badge && <span className="mp-badge">{p.badge}</span>}
                      {!p.badge && off > 0 && <span className="mp-badge off">{off}% OFF</span>}
                      <button
                        className={`mp-heart ${liked[p.id] ? "on" : ""}`}
                        onClick={() => setLiked((l) => ({ ...l, [p.id]: !l[p.id] }))}
                        aria-label={liked[p.id] ? "Remove from wishlist" : "Add to wishlist"}
                      >{liked[p.id] ? "♥" : "♡"}</button>
                    </div>
                    <div className="mp-card__body">
                      <h3>{p.name}</h3>
                      <div className="mp-rate"><Stars value={p.rating} /> <small>({p.reviews})</small></div>
                      <div className="mp-price">
                        <b>{inr(p.price)}</b>
                        {p.mrp && <><s>M.R.P. {inr(p.mrp)}</s><em>{off}% OFF</em></>}
                      </div>
                      <button className="mp-add" disabled={!p.inStock} onClick={() => addToCart(p)}>
                        {p.inStock ? "🛒 Add to Cart" : "Out of Stock"}
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