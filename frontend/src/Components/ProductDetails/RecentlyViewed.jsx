import { useEffect, useState } from "react";
import { fetchProducts } from "../../services/api";
import { useCart } from "../../Context/CartContext";
import { useWishlist } from "../../Context/WhislistContext";
import { useRequireAuthAction } from "../../hooks/useRequireAuthAction";
import ProductCard from "../ProductCard";

export default function RecentlyViewed() {
  const [products, setProducts] = useState([]);
  const [loadError, setLoadError] = useState("");
  const { addToCart } = useCart();
  const { toggleWishlist } = useWishlist();
  const { requireAuthAction } = useRequireAuthAction();

  useEffect(() => {
    let cancelled = false;
    fetchProducts()
      .then((items) => {
        if (!cancelled) {
          const sorted = items.slice().sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
          setProducts(sorted.slice(0, 4));
          setLoadError("");
        }
      })
      .catch((error) => {
        if (!cancelled) {
          console.error("Failed to load products:", error);
          setProducts([]);
          setLoadError(error?.response?.data?.message || error?.message || "Unable to load products.");
        }
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="mb-12">
        <h2 className="font-serif text-5xl">Explore Products</h2>
        <p className="mt-2 text-gray-500">Discover the latest additions to our collection.</p>
      </div>
      {loadError ? (
        <p role="alert" className="text-gray-600">{loadError}</p>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id || product._id}
              product={product}
              onAddToCart={(selected) => {
                if (requireAuthAction("addToCart", selected)) addToCart(selected);
              }}
              onWishlist={(selected) => toggleWishlist(selected)}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-600">No products are available right now.</p>
      )}
    </section>
  );
}
