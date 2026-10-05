import { motion } from "framer-motion";

const cards = [
  {
    title: "Modern Formal",
    subtitle: "NEW RELEASE",
    image:
      "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=1200",
  },
  {
    title: "Coastline Collection",
    subtitle: "SUMMER 24",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200",
  },
];

export default function PromoCards() {
  return (
    <section className="max-w-7xl mx-auto px-6 pb-20">
      <div className="grid gap-6 md:grid-cols-2">
        {cards.map((card) => (
          <motion.article
            key={card.title}
            whileHover={{ y: -8, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 220, damping: 20 }}
            className="group relative h-[280px] overflow-hidden rounded-[2rem] shadow-lg"
          >
            <img
              src={card.image}
              alt={card.title}
              className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-110"
            />

            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/35 to-black/10" />

            <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
              <p className="text-[11px] uppercase tracking-[0.35em] text-white/80">
                {card.subtitle}
              </p>
              <h3 className="mt-2 text-3xl font-semibold tracking-wide">
                {card.title}
              </h3>
              <p className="mt-3 text-sm text-white/80">
                Discover refined pieces crafted for effortless style.
              </p>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}