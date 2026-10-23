import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ShoppingBag } from "lucide-react";
import { fetchProducts } from "../../services/api";
import { useCart } from "../../Context/CartContext";
import { useWishlist } from "../../Context/WhislistContext";
import { useRequireAuthAction } from "../../hooks/useRequireAuthAction";
import { DEFAULT_IMAGE_FALLBACK, getSafeImageUrl } from "../../utils/productImages";

export default function CompleteLook() {
  const [products, setProducts] = useState([]);
  const [loadError, setLoadError] = useState("");
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { requireAuthAction } = useRequireAuthAction();

  useEffect(() => {
    let cancelled = false;
    fetchProducts()
      .then((items) => {
        if (!cancelled) {
          setProducts(items.filter((item) => item.status !== "Inactive").slice(0, 4));
          setLoadError("");
        }
      })
      .catch((error) => {
        if (!cancelled) {
          console.error("Failed to load wishlist recommendations:", error);
          setProducts([]);
          setLoadError(error?.response?.data?.message || error?.message || "Unable to load product recommendations.");
        }
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="mt-24">
      <div className="mb-10">
        <h2 className="font-serif text-5xl font-semibold">Complete the Look</h2>
        <p className="mt-3 text-gray-500">Discover more from the current collection.</p>
      </div>
      {loadError ? (
        <p role="alert" className="text-gray-600">{loadError}</p>
      ) : products.length === 0 ? (
        <p className="text-gray-600">No other products are available right now.</p>
      ) : (
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {products.map((item) => {
            const id = item.id || item._id;
            const price = Number(item.discountPrice ?? item.salePrice ?? item.price ?? 0);
            const image = getSafeImageUrl(item.images?.[0] || item.image, DEFAULT_IMAGE_FALLBACK);
            return (
              <motion.article key={id} whileHover={{ y: -8 }} className="group overflow-hidden rounded-3xl bg-white shadow transition hover:shadow-xl">
                <div className="relative overflow-hidden">
                  <Link to={`/product/${id}`} className="block">
                    <img src={image} alt={item.name} loading="lazy" className="h-72 w-full object-cover transition duration-500 group-hover:scale-105" onError={(event) => { event.currentTarget.src = DEFAULT_IMAGE_FALLBACK; }} />
                  </Link>
                  <button type="button" onClick={() => {
                    if (requireAuthAction("toggleWishlist", item)) toggleWishlist(item);
                  }} aria-label={isWishlisted(id) ? "Remove from wishlist" : "Add to wishlist"} className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow">
                    <Heart size={18} className={isWishlisted(id) ? "fill-red-500 text-red-500" : ""} />
                  </button>
                </div>
                <div className="p-5">
                  <span className="text-sm text-gray-500">{item.subCategory || item.category}</span>
                  <Link to={`/product/${id}`}><h3 className="mt-2 text-xl font-semibold">{item.name}</h3></Link>
                  <p className="mt-3 text-2xl font-bold text-[#0d2746]">₹{price.toLocaleString("en-IN")}</p>
                  <button type="button" disabled={Number(item.stock) <= 0} onClick={() => {
                    if (requireAuthAction("addToCart", item)) addToCart(item);
                  }} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0d2746] py-3 text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50">
                    <ShoppingBag size={18} />
                    {Number(item.stock) > 0 ? "Add to Bag" : "Out of Stock"}
                  </button>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}
    </section>
  );
}
