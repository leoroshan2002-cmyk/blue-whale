import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { apiClient, resolveBackendImageUrl } from "../services/api";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext();
const productIdOf = (product) => String(product?.id || product?._id || product?.productId || "");

export const WishlistProvider = ({ children }) => {
  const { user, isAuthReady } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [isWishlistReady, setIsWishlistReady] = useState(false);
  const [wishlistError, setWishlistError] = useState("");

  const applyServerWishlist = ({ data }) => {
    const nextWishlist = Array.isArray(data?.wishlist) ? data.wishlist.map((product) => ({
      ...product,
      image: typeof product.image === "string" && product.image.startsWith("/uploads")
        ? resolveBackendImageUrl(product.image)
        : product.image,
      images: Array.isArray(product.images)
        ? product.images.map((image) => (
          typeof image === "string" && image.startsWith("/uploads")
            ? resolveBackendImageUrl(image)
            : image
        ))
        : product.images,
    })) : [];
    setWishlist(nextWishlist);
  };

  useEffect(() => {
    if (!isAuthReady) return undefined;
    let cancelled = false;
    setIsWishlistReady(false);
    setWishlistError("");
    if (!user?.id) {
      setWishlist([]);
      setIsWishlistReady(true);
      return () => { cancelled = true; };
    }

    apiClient.get("/api/users/me/wishlist")
      .then(({ data }) => {
        if (!cancelled) applyServerWishlist({ data });
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Failed to load customer wishlist", error);
        const message = error?.response?.data?.message || "Unable to load your saved wishlist.";
        setWishlistError(message);
        toast.error(message);
        setWishlist([]);
      })
      .finally(() => {
        if (!cancelled) setIsWishlistReady(true);
      });

    return () => { cancelled = true; };
  }, [isAuthReady, user?.id]);

  const toggleWishlist = async (product) => {
    const productId = productIdOf(product);
    if (!user?.id || !productId) return;
    const exists = wishlist.some((item) => productIdOf(item) === productId);
    try {
      if (exists) {
        applyServerWishlist(await apiClient.delete(`/api/users/me/wishlist/${encodeURIComponent(productId)}`));
      } else {
        applyServerWishlist(await apiClient.post("/api/users/me/wishlist", { productId }));
      }
    } catch (error) {
      console.error("Failed to update customer wishlist", error);
      toast.error(error?.response?.data?.message || "Unable to update your wishlist.");
    }
  };

  const removeFromWishlist = async (id) => {
    if (!user?.id || !id) return;
    try {
      applyServerWishlist(await apiClient.delete(`/api/users/me/wishlist/${encodeURIComponent(id)}`));
    } catch (error) {
      console.error("Failed to remove product from wishlist", error);
      toast.error(error?.response?.data?.message || "Unable to remove this item.");
    }
  };

  const clearWishlist = async () => {
    if (!user?.id) return;
    try {
      applyServerWishlist(await apiClient.delete("/api/users/me/wishlist"));
    } catch (error) {
      console.error("Failed to clear customer wishlist", error);
      toast.error(error?.response?.data?.message || "Unable to clear your wishlist.");
    }
  };

  const isWishlisted = (id) => wishlist.some((item) => productIdOf(item) === String(id));

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        isWishlistReady,
        wishlistError,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist,
        isWishlisted,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
