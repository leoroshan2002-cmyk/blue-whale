import { useState } from "react";
import { motion } from "framer-motion";
import { DEFAULT_IMAGE_FALLBACK, getSafeImageUrl } from "../../utils/productImages";

export default function ProductGallery({ images }) {
  const [selectedImage, setSelectedImage] = useState(images[0]);

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-6">
      {/* Thumbnails */}
      <div className="flex lg:flex-col gap-4">
        {images.map((img, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedImage(img)}
            className={`w-24 h-28 rounded-2xl overflow-hidden border-2 transition-all ${
              selectedImage === img
                ? "border-[#0d2746]"
                : "border-gray-200"
            }`}
          >
            <img
              src={getSafeImageUrl(img, DEFAULT_IMAGE_FALLBACK)}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = DEFAULT_IMAGE_FALLBACK;
              }}
            />
          </motion.button>
        ))}
      </div>

      {/* Main Image */}
      <motion.div
        key={selectedImage}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="flex-1 rounded-3xl overflow-hidden bg-[#f7f7f7]"
      >
        <img
          src={getSafeImageUrl(selectedImage, DEFAULT_IMAGE_FALLBACK)}
          alt=""
          className="w-full h-[650px] object-cover hover:scale-110 transition duration-500 cursor-zoom-in"
          onError={(e) => {
            e.currentTarget.src = DEFAULT_IMAGE_FALLBACK;
          }}
        />
      </motion.div>
    </div>
  );
}