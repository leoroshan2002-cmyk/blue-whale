import { useEffect, useRef } from "react";
import gsap from "gsap";
import WishlistCard from "./WishlistCard";

export default function WishlistGrid({ wishlist }) {
  const gridRef = useRef([]);

  useEffect(() => {
    if (!wishlist.length) return;

    gsap.from(gridRef.current, {
      opacity: 0,
      y: 40,
      duration: 0.7,
      stagger: 0.12,
      ease: "power3.out",
    });
  }, [wishlist]);

  return (
    <section className="mt-14">

      <div className="flex items-center justify-between mb-8">

        <div>
          <h2 className="text-3xl font-serif font-semibold">
            Saved Items
          </h2>

          <p className="text-gray-500 mt-2">
            {wishlist.length} {wishlist.length === 1 ? "item" : "items"} in your wishlist
          </p>
        </div>

      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">

        {wishlist.map((product, index) => (

          <div
            key={product.id}
            ref={(el) => (gridRef.current[index] = el)}
          >
            <WishlistCard product={product} />
          </div>

        ))}

      </div>

    </section>
  );
}