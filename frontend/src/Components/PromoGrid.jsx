import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getCampaign, resolveBackendImageUrl } from "../services/api";
import { DEFAULT_IMAGE_FALLBACK, getSafeImageUrl } from "../utils/productImages";

export default function PromoGrid({ category, variant = "top" }) {
  const [promos, setPromos] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const loadCampaign = async () => {
      const campaign = await getCampaign(category);
      if (!isMounted) return;

      const promoCards = (campaign?.promoCards || []).filter((item) => item?.title || item?.description || item?.image);
      const bottomCards = (campaign?.bottomPromoCards || []).filter((item) => item?.title || item?.description || item?.image);
      const cards = variant === "bottom" ? (bottomCards.length > 0 ? bottomCards : promoCards) : promoCards;

      setPromos(cards);
    };

    loadCampaign();

    return () => {
      isMounted = false;
    };
  }, [category, variant]);

  if (promos.length === 0) return null;

  return (
    <section className="grid grid-cols-1 gap-3 sm:flex sm:snap-x sm:snap-mandatory sm:gap-4 sm:overflow-visible sm:pb-0">
      {promos.map((item, index) => (
        <motion.article
          key={item.id || index}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          whileHover={{ y: -4 }}
          transition={{ duration: 0.8, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="group relative h-[260px] w-full min-w-0 overflow-hidden rounded-[1.15rem] bg-transparent shadow-none transition-[flex-grow,flex-basis] duration-500 ease-out sm:h-[240px] sm:w-auto sm:min-w-0 sm:snap-start sm:flex-[1_1_0%] sm:hover:flex-[2_1_0%] lg:h-[520px]"
        >
          <motion.div
            initial={{ scale: 1.03 }}
            whileHover={{ scale: 1.06 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <motion.img
              src={resolveBackendImageUrl(getSafeImageUrl(item.image, DEFAULT_IMAGE_FALLBACK))}
              alt={item.title}
              initial={{ opacity: 0, scale: 1.05 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="h-full w-full object-cover mix-blend-multiply"
              onError={(e) => {
                e.currentTarget.src = DEFAULT_IMAGE_FALLBACK;
              }}
            />
          </motion.div>

        </motion.article>
      ))}
    </section>
  );
}