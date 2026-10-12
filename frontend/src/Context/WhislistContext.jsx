import { createContext, useContext, useEffect, useState } from "react";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState(() => {
        const saved = localStorage.getItem("wishlist");
        return saved ? JSON.parse(saved) : [];
    });

    // Save to localStorage whenever wishlist changes
    useEffect(() => {
        localStorage.setItem("wishlist", JSON.stringify(wishlist));
    }, [wishlist]);

    // ✅ SINGLE CLEAN TOGGLE FUNCTION
    const toggleWishlist = (product) => {
        setWishlist((prev) => {
            const exists = prev.some((item) => item.id === product.id);

            if (exists) {
                return prev.filter((item) => item.id !== product.id);
            } else {
                return [...prev, product];
            }
        });
    };

    const removeFromWishlist = (id) => {
        setWishlist((prev) => prev.filter((item) => item.id !== id));
    };

    const clearWishlist = () => setWishlist([]);

    const isWishlisted = (id) =>
        wishlist.some((item) => item.id === id);

    return (
        <WishlistContext.Provider
            value={{
                wishlist,
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