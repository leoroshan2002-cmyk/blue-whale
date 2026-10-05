import React, { createContext, useState, useContext, useEffect } from "react";
import { toast } from "react-toastify";

const CartContext = createContext();

const normalizeCartProduct = (product, quantity = 1) => {
  const productId = product?.productId || product?.id || product?._id || product?.sku || "";
  const normalizedPrice = Number(product?.discountPrice ?? product?.salePrice ?? product?.price ?? 0) || 0;
  const normalizedImage =
    typeof product?.image === "string" && product.image.trim()
      ? product.image.trim()
      : Array.isArray(product?.images) && typeof product.images[0] === "string"
        ? product.images[0].trim()
        : "";

  return {
    id: product?.id || product?._id || product?.sku || productId,
    productId,
    name: product?.name || "Product",
    price: normalizedPrice,
    image: normalizedImage,
    images: Array.isArray(product?.images) ? product.images.slice(0, 4) : [],
    qty: Number(quantity) > 0 ? Number(quantity) : 1,
    selectedColor: product?.selectedColor || product?.color || "",
    selectedSize: product?.selectedSize || product?.size || "",
    color: product?.selectedColor || product?.color || "",
    size: product?.selectedSize || product?.size || "",
    category: product?.category || "",
    brand: product?.brand || "",
    material: product?.material || "",
    sku: product?.sku || "",
    stock: Number(product?.stock ?? 0),
  };
};

const getInitialCart = () => {
  if (typeof window === "undefined") return [];
  try {
    const persisted = window.localStorage.getItem("haierah-cart");
    return persisted ? JSON.parse(persisted) : [];
  } catch {
    return [];
  }
};

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const initialCart = getInitialCart();
    return Array.isArray(initialCart) ? initialCart : [];
  });
  const [isCartReady] = useState(() => typeof window !== "undefined");

  useEffect(() => {
    if (!isCartReady || typeof window === "undefined") return;
    window.localStorage.setItem("haierah-cart", JSON.stringify(cart));
  }, [cart, isCartReady]);

  const getCartItemKey = (product) => {
    const productId = product?.id || product?._id || product?.productId || "product";
    const selectedColor = product?.selectedColor || product?.color || "";
    const selectedSize = product?.selectedSize || product?.size || "";
    return `${productId}::${selectedColor}::${selectedSize}`;
  };

  const addToCart = (product) => {
    const normalizedProduct = normalizeCartProduct(product);
    const stockCount = Number(normalizedProduct.stock ?? 0);

    if (stockCount <= 0) {
      toast.warning("This item is out of stock.", {
        toastId: `cart-out-of-stock-${normalizedProduct.id || Date.now()}`,
        autoClose: 2000,
      });
      return;
    }

    const cartItemKey = getCartItemKey(normalizedProduct);

    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex((item) => {
        const existingKey = item.cartItemKey || getCartItemKey(item);
        return existingKey === cartItemKey;
      });

      if (existingItemIndex >= 0) {
        const existingItem = prevCart[existingItemIndex];
        const existingQty = Number(existingItem.qty || 0);
        const nextQty = existingQty + 1;

        if (stockCount > 0 && nextQty > stockCount) {
          toast.warning(`Only ${stockCount} item${stockCount === 1 ? "" : "s"} left in stock.`, {
            toastId: `cart-stock-limit-${normalizedProduct.id || Date.now()}`,
            autoClose: 2000,
          });
          return prevCart;
        }

        return prevCart.map((item, index) =>
          index === existingItemIndex
            ? {
                ...item,
                ...normalizedProduct,
                selectedSize: normalizedProduct.selectedSize || item.selectedSize,
                selectedColor: normalizedProduct.selectedColor || item.selectedColor,
                qty: nextQty,
                cartItemKey,
              }
            : item
        );
      }

      return [...prevCart, { ...normalizedProduct, qty: 1, cartItemKey }];
    });

    toast.success("Item added to cart 🛒", {
      toastId: `cart-add-${normalizedProduct.id || Date.now()}`,
      autoClose: 1500,
    });
  };

  const removeFromCart = (productIdOrKey) => {
    setCart((prevCart) =>
      prevCart.filter((item) => {
        const itemKey = item.cartItemKey || getCartItemKey(item);
        return itemKey !== productIdOrKey && item.id !== productIdOrKey;
      })
    );
  };

  const updateQuantity = (productIdOrKey, qty) => {
    if (qty <= 0) {
      removeFromCart(productIdOrKey);
    } else {
      setCart((prevCart) =>
        prevCart.map((item) => {
          const itemKey = item.cartItemKey || getCartItemKey(item);
          return itemKey === productIdOrKey || item.id === productIdOrKey ? { ...item, qty } : item;
        })
      );
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price || 0) * item.qty, 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.qty, 0);
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider value={{ cart, isCartReady, addToCart, removeFromCart, updateQuantity, getTotalPrice, getCartCount, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
