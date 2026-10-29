import React, { createContext, useState, useContext, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { apiClient, resolveBackendImageUrl } from "../services/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

const normalizeCartProduct = (product, quantity = 1) => {
  const productId = product?.productId || product?.id || product?._id || product?.sku || "";
  const normalizedPrice = Number(product?.discountPrice ?? product?.salePrice ?? product?.price ?? 0) || 0;
  const image =
    typeof product?.image === "string" && product.image.trim()
      ? product.image.trim()
      : Array.isArray(product?.images) && typeof product.images[0] === "string"
        ? product.images[0].trim()
        : "";
  const resolveImage = (value) => (
    typeof value === "string" && value.startsWith("/uploads")
      ? resolveBackendImageUrl(value)
      : value
  );

  return {
    id: product?.id || product?._id || product?.sku || productId,
    productId,
    name: product?.name || "Product",
    price: normalizedPrice,
    image: resolveImage(image),
    images: Array.isArray(product?.images) ? product.images.slice(0, 4).map(resolveImage) : [],
    selectedImageIndex: Number.isInteger(Number(product?.selectedImageIndex)) ? Number(product.selectedImageIndex) : 0,
    qty: Number(quantity) > 0 ? Number(quantity) : 1,
    selectedColor: product?.selectedColor || product?.color || "",
    selectedColorHex: product?.selectedColorHex || product?.colorHex || "",
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

export function CartProvider({ children }) {
  const { user, isAuthReady } = useAuth();
  const [cart, setCart] = useState([]);
  const [isCartReady, setIsCartReady] = useState(false);
  const [cartError, setCartError] = useState("");
  const cartRef = useRef(cart);
  const savedCartRef = useRef([]);
  const saveQueue = useRef(Promise.resolve());
  const activeUserId = useRef("");

  const normalizeCart = (items) => (Array.isArray(items) ? items.map((item) => (
    normalizeCartProduct(item, item.qty || item.quantity)
  )) : []);

  useEffect(() => {
    if (!isAuthReady) return undefined;
    let cancelled = false;
    activeUserId.current = user?.id || "";
    setIsCartReady(false);
    setCartError("");
    if (!user?.id) {
      cartRef.current = [];
      savedCartRef.current = [];
      setCart([]);
      setIsCartReady(true);
      return () => { cancelled = true; };
    }

    apiClient.get("/api/users/me/cart")
      .then(({ data }) => {
        if (cancelled) return;
        const nextCart = normalizeCart(data?.cart);
        cartRef.current = nextCart;
        savedCartRef.current = nextCart;
        setCart(nextCart);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Failed to load customer cart", error);
        const message = error?.response?.data?.message || "Unable to load your saved cart.";
        setCartError(message);
        toast.error(message);
        cartRef.current = [];
        savedCartRef.current = [];
        setCart([]);
      })
      .finally(() => {
        if (!cancelled) setIsCartReady(true);
      });

    return () => { cancelled = true; };
  }, [isAuthReady, user?.id]);

  const getCartItemKey = (product) => {
    const productId = product?.productId || product?.id || product?._id || "product";
    const selectedColor = product?.selectedColor || product?.color || "";
    const selectedSize = product?.selectedSize || product?.size || "";
    return `${productId}::${selectedColor}::${selectedSize}`;
  };

  const persistCart = (nextCart) => {
    cartRef.current = nextCart;
    setCart(nextCart);
    const userId = activeUserId.current;
    if (!userId) return Promise.resolve(false);
    const items = nextCart.map((item) => ({
      productId: item.productId,
      quantity: item.qty,
      selectedColor: item.selectedColor,
      selectedSize: item.selectedSize,
      selectedImageIndex: item.selectedImageIndex,
    }));
    const request = saveQueue.current
      .then(async () => {
        const { data } = await apiClient.put("/api/users/me/cart", { items });
        if (activeUserId.current !== userId) return;
        const savedCart = normalizeCart(data?.cart);
        cartRef.current = savedCart;
        savedCartRef.current = savedCart;
        setCart(savedCart);
        return true;
      })
      .catch((error) => {
        console.error("Failed to save customer cart", error);
        toast.error(error?.response?.data?.message || "Unable to save your cart.");
        if (activeUserId.current === userId) {
          cartRef.current = savedCartRef.current;
          setCart(savedCartRef.current);
        }
        return false;
      });
    saveQueue.current = request.then(() => undefined);
    return request;
  };

  const addToCart = async (product) => {
    if (!isCartReady || !activeUserId.current) {
      toast.info(isCartReady ? "Please sign in to add items to your cart." : "Your saved cart is still loading.");
      return;
    }
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

    const prevCart = cartRef.current;
    let itemAdded = true;
    const nextCart = (() => {
      const existingItemIndex = prevCart.findIndex((item) => {
        const existingKey = item.cartItemKey || getCartItemKey(item);
        return existingKey === cartItemKey;
      });

      if (existingItemIndex >= 0) {
        const existingItem = prevCart[existingItemIndex];
        const existingQty = Number(existingItem.qty || 0);
        const nextQty = existingQty + 1;

        if (stockCount > 0 && nextQty > stockCount) {
          itemAdded = false;
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
                selectedImageIndex: normalizedProduct.selectedImageIndex,
                qty: nextQty,
                cartItemKey,
              }
            : item
        );
      }

      return [...prevCart, { ...normalizedProduct, qty: 1, cartItemKey }];
    })();
    if (!itemAdded) return;
    if (nextCart !== prevCart && !(await persistCart(nextCart))) return;

    toast.success("Item added to cart 🛒", {
      toastId: `cart-add-${normalizedProduct.id || Date.now()}`,
      autoClose: 1500,
    });
  };

  const removeFromCart = (productIdOrKey) => {
    const nextCart = cartRef.current.filter((item) => {
        const itemKey = item.cartItemKey || getCartItemKey(item);
        return itemKey !== productIdOrKey && item.id !== productIdOrKey && item.productId !== productIdOrKey;
      });
    persistCart(nextCart);
  };

  const updateQuantity = (productIdOrKey, qty) => {
    if (!Number.isInteger(Number(qty))) {
      toast.warning("Quantity must be a whole number.");
      return;
    }
    const quantity = Number(qty);
    if (quantity <= 0) {
      removeFromCart(productIdOrKey);
    } else {
      const target = cartRef.current.find((item) => (
        (item.cartItemKey || getCartItemKey(item)) === productIdOrKey || item.id === productIdOrKey
      ));
      if (!target) return;
      if (Number(target.stock) > 0 && quantity > Number(target.stock)) {
        toast.warning(`Only ${target.stock} item${target.stock === 1 ? "" : "s"} left in stock.`);
        return;
      }
      const nextCart = cartRef.current.map((item) => {
          const itemKey = item.cartItemKey || getCartItemKey(item);
          return itemKey === productIdOrKey || item.id === productIdOrKey ? { ...item, qty: quantity } : item;
        });
      persistCart(nextCart);
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price || 0) * item.qty, 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.qty, 0);
  };

  const clearCart = () => {
    persistCart([]);
  };

  return (
    <CartContext.Provider value={{ cart, isCartReady, cartError, addToCart, removeFromCart, updateQuantity, getTotalPrice, getCartCount, clearCart }}>
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
