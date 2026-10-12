import { motion } from "framer-motion";

const categories = [

];

export default function Categories() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <div className="grid md:grid-cols-4 gap-6">
        {categories.map((item) => (
          <motion.div
            whileHover={{ y: -10 }}
            key={item.title}
            className="relative h-72 overflow-hidden rounded-3xl"
          >
            <img
              src={item.image}
              alt=""
              className="w-full h-full object-cover"
            />

            <div className="absolute inset-0 bg-black/30" />

            <h3 className="absolute bottom-5 left-5 text-white text-xl font-semibold">
              {item.title}
            </h3>
          </motion.div>
        ))}
      </div>
    </section>
  );
}