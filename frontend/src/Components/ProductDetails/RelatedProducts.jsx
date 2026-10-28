import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProducts } from "../../services/api";
import { useCart } from "../../Context/CartContext";
import { useWishlist } from "../../Context/WhislistContext";
import { useRequireAuthAction } from "../../hooks/useRequireAuthAction";
import ProductCard from "../ProductCard";

export default function RelatedProducts({ product }) {
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
          setProducts(items
            .filter((item) => (item.id || item._id) !== (product?.id || product?._id)
              && (!product?.category || String(item.category).toLowerCase() === String(product.category).toLowerCase()))
            .slice(0, 4));
          setLoadError("");
        }
      })
      .catch((error) => {
        if (!cancelled) {
          console.error("Failed to load related products:", error);
          setProducts([]);
          setLoadError(error?.response?.data?.message || error?.message || "Unable to load related products.");
        }
      });
    return () => { cancelled = true; };
  }, [product?.id, product?._id, product?.category]);

  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-20">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="font-serif text-5xl">You May Also Like</h2>
          <p className="mt-2 text-gray-500">Discover similar styles from our collection.</p>
        </div>
        <Link to="/shop" className="text-lg font-medium hover:underline">View All →</Link>
      </div>
      {loadError ? (
        <p role="alert" className="text-gray-600">{loadError}</p>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {products.map((item) => (
            <ProductCard
              key={item.id || item._id}
              product={item}
              onAddToCart={(selected) => {
                if (requireAuthAction("addToCart", selected)) addToCart(selected);
              }}
              onWishlist={(selected) => toggleWishlist(selected)}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-600">No related products are available right now.</p>
      )}
    </section>
  );
}
