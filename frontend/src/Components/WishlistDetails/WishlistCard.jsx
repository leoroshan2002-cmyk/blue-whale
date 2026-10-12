import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import {
  Share2,
  Trash2,
  ShoppingBag,
  Heart,
} from "lucide-react";
import { useWishlist } from "../../Context/WhislistContext";
import { useCart } from "../../Context/CartContext";

export default function WishlistHeader() {
  const { wishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  const headerRef = useRef(null);

  useEffect(() => {
    gsap.from(headerRef.current.children, {
      opacity: 0,
      y: 30,
      stagger: 0.15,
      duration: 0.8,
      ease: "power3.out",
    });
  }, []);

  const handleBuyAll = () => {
    wishlist.forEach((item) => addToCart(item));
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Wishlist",
          text: "Check out my wishlist!",
          url: window.location.href,
        });
      } catch (_err) {
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Wishlist link copied!");
    }
  };

  return (
    <div
      ref={headerRef}
      className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 mb-14"
    >
      {/* Left */}

      <div>

        <div className="flex items-center gap-4">

          <Heart
            size={42}
            className="fill-red-500 text-red-500"
          />

          <h1 className="text-5xl lg:text-6xl font-serif">
            My Wishlist
          </h1>

        </div>

        <p className="text-gray-500 mt-4 text-lg">

          {wishlist.length}{" "}
          {wishlist.length === 1
            ? "Item Saved"
            : "Items Saved"}

        </p>

      </div>

      {/* Right */}

      <div className="flex flex-wrap gap-4">

        {/* Share */}

        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: .95 }}
          onClick={handleShare}
          className="flex items-center gap-2
          border
          rounded-xl
          px-6
          py-3
          hover:bg-gray-100"
        >
          <Share2 size={18} />

          Share

        </motion.button>

        {/* Clear */}

        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: .95 }}
          onClick={clearWishlist}
          disabled={wishlist.length === 0}
          className="flex items-center gap-2
          border border-red-500
          text-red-500
          rounded-xl
          px-6
          py-3
          hover:bg-red-500
          hover:text-white
          disabled:opacity-40"
        >
          <Trash2 size={18} />

          Clear

        </motion.button>

        {/* Buy All */}

        <motion.button
          whileHover={{
            scale: 1.03,
          }}
          whileTap={{
            scale: .97,
          }}
          onClick={handleBuyAll}
          disabled={wishlist.length === 0}
          className="bg-[#0d2746]
          text-white
          rounded-xl
          px-8
          py-3
          flex
          items-center
          gap-2
          hover:bg-black
          disabled:opacity-40"
        >
          <ShoppingBag size={18} />

          Buy All

        </motion.button>

      </div>

    </div>
  );
}