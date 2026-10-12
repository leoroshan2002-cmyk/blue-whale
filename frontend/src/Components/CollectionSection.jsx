import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import menImage from "../assets/men.jpg";
import womenImage from "../assets/women.jpg";
import kidsImage from "../assets/kids.jpg";

export default function CollectionSection() {
  const navigate = useNavigate();

  const collections = [
    {
      title: "MEN COLLECTION",
      subtitle: "Modern Tailoring",
      image: menImage,
      path: "/men",
    },
    {
      title: "WOMEN COLLECTION",
      subtitle: "Timeless Elegance",
      image: womenImage,
      path: "/women",
    },
    {
      title: "KIDS COLLECTION",
      subtitle: "Everyday Comfort",
      image: kidsImage,
      path: "/kids",
    },
  ];

  return (
    <section className="bg-white py-20">

      <div className="text-center mb-16">
        <h2 className="text-5xl font-serif">
          Shop By Collection
        </h2>

        <p className="text-gray-500 mt-4">
          Discover our latest fashion collections
        </p>
      </div>

      <div className="space-y-12">

        {collections.map((item, index) => (

          <motion.div
            key={index}
            initial={{ opacity: 0, y: 80 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative h-[600px] overflow-hidden group cursor-pointer"
            onClick={() => navigate(item.path)}
          >

            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover transition duration-700 group-hover:scale-110"
            />

            <div className="absolute inset-0 bg-black/35"></div>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">

              <h2 className="text-6xl font-serif">
                {item.title}
              </h2>

              <p className="mt-4 text-xl">
                {item.subtitle}
              </p>

              <button className="mt-8 border border-white px-8 py-3 hover:bg-white hover:text-black transition">
                SHOP NOW →
              </button>

            </div>

          </motion.div>

        ))}

      </div>

    </section>
  );
}