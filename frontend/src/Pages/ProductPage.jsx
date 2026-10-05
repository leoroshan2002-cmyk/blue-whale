import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Star } from "lucide-react";

import { useCart } from "../Context/CartContext";
import { useWishlist } from "../Context/WhislistContext";
import { useRequireAuthAction } from "../hooks/useRequireAuthAction";
import { fetchProductById } from "../services/api";
import { subscribeToCatalogChanges } from "../utils/catalogSync";

export default function ProductPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);

  const getColorLabel = (color) => {
    if (!color) return "";
    if (typeof color === "string") return color;
    return color.name || color.value || color.hex || String(color);
  };

  const getColorValue = (color) => {
    if (!color) return "";
    if (typeof color === "string") return color;
    return color.hex || color.value || color.name || String(color);
  };

  const handleColorSelect = (color, index) => {
    const label = getColorLabel(color);
    setSelectedColor(label);
    setSelectedColorIndex(index);

    if (Array.isArray(product?.images) && product.images[index]) {
      setSelectedImage(index);
    } else if (Array.isArray(product?.images) && product.images.length > 0) {
      setSelectedImage(0);
    }
  };

  const [reviews, setReviews] = useState([
    {
      name: "John Doe",
      rating: 5,
      comment: "Excellent quality. Fits perfectly.",
    },
    {
      name: "Sarah",
      rating: 4,
      comment: "Very comfortable and stylish.",
    },
  ]);

  const [reviewForm, setReviewForm] = useState({
    name: "",
    rating: 5,
    comment: "",
  });

  useEffect(() => {
    const loadProduct = async () => {
      const response = await fetchProductById(id);
      setProduct(response);
      if (response?.sizes?.length) {
        setSelectedSize(response.sizes[0]);
      }
      if (response?.colors?.length) {
        const firstColor = response.colors[0];
        setSelectedColor(getColorLabel(firstColor));
        setSelectedColorIndex(0);
        setSelectedImage(0);
      }
    };

    loadProduct();

    const handleInventoryChange = () => {
      loadProduct();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('haierah-products-updated', handleInventoryChange);
      window.addEventListener('haierah-order-created', handleInventoryChange);
    }

    const unsubscribeCatalog = subscribeToCatalogChanges(handleInventoryChange);

    return () => {
      unsubscribeCatalog();
      if (typeof window !== 'undefined') {
        window.removeEventListener('haierah-products-updated', handleInventoryChange);
        window.removeEventListener('haierah-order-created', handleInventoryChange);
      }
    };
  }, [id]);

  const { addToCart } = useCart();
  const { requireAuthAction } = useRequireAuthAction();
  const {
    toggleWishlist,
    isWishlisted,
  } = useWishlist();

  // useEffect(() => {
  //   if (!product) return;

  //   gsap.from(".product-image", {
  //     opacity: 0,
  //     x: -80,
  //     duration: 0.8,
  //   });

  //   gsap.from(".product-info > *", {
  //     opacity: 0,
  //     y: 30,
  //     stagger: 0.12,
  //     duration: 0.7,
  //   });
  // }, [product]);

  if (!product) {
    return (
      <div className="max-w-6xl mx-auto py-32 text-center">
        <h2 className="text-3xl font-semibold">
          Product Not Found
        </h2>

        <p

          className="inline-block mt-8 px-6 py-3 bg-black text-white rounded-full"
          onClick={() => navigate(-1)}
        >
          Back to Shop
        </p>
      </div>
    );
  }

 const handleWishlist = () => {
  if (!requireAuthAction("toggleWishlist", product)) return;
  toggleWishlist(product);
};

  return (
    <section className="max-w-7xl mx-auto px-6 py-16">

      <div className="grid lg:grid-cols-2 gap-16">

        {/* Image */}

        <div className="product-image">

          <div className="rounded-3xl overflow-hidden bg-gray-100">
            <img
              src={product.images?.[selectedImage] || product.image || product.images?.[0]}
              alt={product.name}
              className="w-full h-[700px] object-cover"
            />
          </div>

          {/* Thumbnails */}

          <div className="flex gap-3 mt-4 overflow-x-auto">
            {(product.images || []).map((img, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`overflow-hidden rounded-xl border-2 ${selectedImage === index
                  ? "border-black"
                  : "border-gray-200"
                  }`}
              >
                <img
                  src={img}
                  alt=""
                  className="w-24 h-24 object-cover"
                />
              </button>
            ))}
          </div>

        </div>

        {/* Details */}

        <div className="product-info">

          <p className="uppercase tracking-widest text-gray-500">
            {product.brand}
          </p>

          <h1 className="text-5xl font-serif mt-3">
            {product.name}
          </h1>

          <div className="flex items-center gap-2 mt-5">

            <Star
              className="fill-yellow-400 text-yellow-400"
              size={18}
            />

            <span className="font-medium">
              {product.rating}
            </span>

            <span className="text-gray-500">
              ({product.reviews} Reviews)
            </span>

          </div>

          <h2 className="text-4xl font-bold mt-6">
            ₹{product.price}
          </h2>

          <p className="mt-6 text-gray-600 leading-8">
            {product.description}
          </p>

          {/* Category */}

          <div className="mt-8">
            <span className="font-semibold">
              Category :
            </span>

            <span className="ml-3 text-gray-600">
              {product.category}
            </span>
          </div>

          {/* Material */}

          <div className="mt-5">
            <span className="font-semibold">
              Material :
            </span>

            <span className="ml-3 text-gray-600">
              {product.material}
            </span>
          </div>

          {/* Sizes */}

          <div className="mt-8">

            <h3 className="font-semibold mb-3">
              Select Size
            </h3>

            <div className="flex gap-3">

              {(product.sizes || []).map((size) => (

                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-12 h-12 rounded-xl border transition
        ${selectedSize === size
                      ? "bg-black text-white border-black"
                      : "hover:bg-black hover:text-white"
                    }`}
                >
                  {size}
                </button>

              ))}

            </div>

          </div>

          {/* Colors */}

          <div className="mt-8">

            <h3 className="font-semibold mb-3">
              Select Color
            </h3>

            <div className="flex gap-3">

              {(product.colors || []).map((color, index) => {
                const colorValue = color?.hex || color?.value || color?.name || String(color);
                const colorLabel = color?.name || color?.value || String(color);
                const colorKey = color?.id || `${colorLabel}-${index}` || `${colorValue}-${index}`;

                return (
                  <button
                    key={colorKey}
                    onClick={() => handleColorSelect(color, index)}
                    className={`w-12 h-12 rounded-full border-4 transition ${
                      selectedColor === colorLabel
                        ? "border-black scale-110"
                        : "border-gray-300"
                    }`}
                    style={{
                      backgroundColor: colorValue,
                    }}
                  />
                );
              })}

            </div>

            {selectedColor && (
              <p className="mt-3 text-gray-600">
                Selected: {selectedColor}
              </p>
            )}

          </div>

          {/* Stock */}

          <div className="mt-8">

            {product.stock > 0 ? (

              <span className="text-green-600 font-semibold">
                ✔ In Stock ({product.stock} left)
              </span>

            ) : (

              <span className="text-red-500">
                Out of Stock
              </span>

            )}

          </div>

          {/* Buttons */}

          <div className="flex gap-4 mt-10">

            <button
              onClick={() => {
                if ((product.stock ?? 0) <= 0) {
                  alert("This item is out of stock.");
                  return;
                }

                if (!selectedSize) {
                  return alert("Select a size");
                }

                if (!selectedColor) {
                  return alert("Select a color");
                }

                const cartProduct = {
                  ...product,
                  selectedSize,
                  selectedColor,
                  selectedColorIndex,
                  color: selectedColor,
                  image: product.images?.[selectedColorIndex] || product.image || product.images?.[0],
                };

                if (!requireAuthAction("addToCart", cartProduct)) return;

                addToCart(cartProduct);
              }}
              disabled={(product.stock ?? 0) <= 0}
              className={`flex-1 rounded-full py-4 ${ (product.stock ?? 0) <= 0 ? "bg-gray-300 text-gray-600 cursor-not-allowed" : "bg-[#0d2746] text-white" }`}
            >
              {(product.stock ?? 0) <= 0 ? "Out of Stock" : "Add To Cart"}
            </button>

            <button
              onClick={handleWishlist}
              className="flex-1 border rounded-full py-4 hover:bg-black hover:text-white duration-300"
            >
              {isWishlisted(product.id)
                ? "Remove Wishlist"
                : "Add Wishlist"}
            </button>

          </div>

          {/* Features */}


          <div className=" col-span-2 mt-20 border-t pt-10">

            <h2 className="text-3xl font-bold mb-8">
              Customer Reviews
            </h2>

            <div className="space-y-6">

              {reviews.map((review, index) => (

                <div
                  key={`${review.name}-${index}`}
                  className="border rounded-2xl p-5"
                >
                  <div className="flex items-center gap-2 mb-2">

                    {[...Array(review.rating)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className="fill-yellow-400 text-yellow-400"
                      />
                    ))}

                  </div>

                  <h4 className="font-semibold">
                    {review.name}
                  </h4>

                  <p className="text-gray-600 mt-2">
                    {review.comment}
                  </p>

                </div>

              ))}

            </div>

          </div>
          <div className="mt-12">

            <h3 className="text-2xl font-semibold mb-6">
              Write a Review
            </h3>

            <div className="space-y-4">

              <input
                type="text"
                placeholder="Your Name"
                value={reviewForm.name}
                onChange={(e) =>
                  setReviewForm({
                    ...reviewForm,
                    name: e.target.value,
                  })
                }
                className="w-full border rounded-xl p-4"
              />

              <select
                value={reviewForm.rating}
                onChange={(e) =>
                  setReviewForm({
                    ...reviewForm,
                    rating: Number(e.target.value),
                  })
                }
                className="w-full border rounded-xl p-4"
              >
                <option value="5">★★★★★</option>
                <option value="4">★★★★</option>
                <option value="3">★★★</option>
                <option value="2">★★</option>
                <option value="1">★</option>
              </select>

              <textarea
                rows={5}
                placeholder="Write your review..."
                value={reviewForm.comment}
                onChange={(e) =>
                  setReviewForm({
                    ...reviewForm,
                    comment: e.target.value,
                  })
                }
                className="w-full border rounded-xl p-4"
              />

              <button
                onClick={() => {

                  if (
                    !reviewForm.name ||
                    !reviewForm.comment
                  ) {
                    return;
                  }

                  setReviews([
                    ...reviews,
                    reviewForm,
                  ]);

                  setReviewForm({
                    name: "",
                    rating: 5,
                    comment: "",
                  });
                }}
                className="bg-black text-white px-8 py-3 rounded-full"
              >
                Submit Review
              </button>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}