import React from "react";
import { motion } from "framer-motion";
import {
  Star,
  ThumbsUp,
  CheckCircle2,
} from "lucide-react";

const reviews = [
  {
    id: 1,
    name: "Sophia Williams",
    rating: 5,
    date: "2 days ago",
    verified: true,
    comment:
      "Excellent quality! The fabric feels premium and the fit is exactly as described. Definitely buying another color.",
  },
  {
    id: 2,
    name: "James Anderson",
    rating: 4,
    date: "1 week ago",
    verified: true,
    comment:
      "Very comfortable shirt. Delivery was quick and packaging was great.",
  },
  {
    id: 3,
    name: "Emily Carter",
    rating: 5,
    date: "2 weeks ago",
    verified: true,
    comment:
      "Love the stitching and the material. Looks even better in person.",
  },
];

export default function CustomerReviews() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-20">

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >

        <h2 className="text-5xl font-serif">
          Customer Reviews
        </h2>

        <p className="text-gray-500 mt-3">
          Hear what our customers say about this product.
        </p>

      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8 mt-14">

        {/* Rating Summary */}

        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl shadow p-8"
        >

          <h3 className="text-6xl font-bold">
            4.8
          </h3>

          <div className="flex gap-1 mt-3">

            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="fill-yellow-400 text-yellow-400"
                size={22}
              />
            ))}

          </div>

          <p className="text-gray-500 mt-3">
            Based on 246 Reviews
          </p>

          <div className="space-y-3 mt-8">

            {[5, 4, 3, 2, 1].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3"
              >

                <span>{item}</span>

                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">

                  <div
                    className={`h-full rounded-full ${
                      item === 5
                        ? "w-[82%]"
                        : item === 4
                        ? "w-[12%]"
                        : item === 3
                        ? "w-[4%]"
                        : item === 2
                        ? "w-[1%]"
                        : "w-[1%]"
                    } bg-yellow-400`}
                  />

                </div>

              </div>
            ))}

          </div>

        </motion.div>

        {/* Reviews */}

        <div className="lg:col-span-2 space-y-6">

          {reviews.map((review) => (

            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-3xl shadow p-8"
            >

              <div className="flex justify-between">

                <div>

                  <h3 className="font-semibold text-xl">
                    {review.name}
                  </h3>

                  <div className="flex items-center gap-2 mt-2">

                    {[...Array(review.rating)].map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        className="fill-yellow-400 text-yellow-400"
                      />
                    ))}

                    {review.verified && (
                      <span className="flex items-center gap-1 text-green-600 text-sm">

                        <CheckCircle2 size={15} />

                        Verified Purchase

                      </span>
                    )}

                  </div>

                </div>

                <span className="text-gray-500">
                  {review.date}
                </span>

              </div>

              <p className="text-gray-600 mt-5 leading-8">
                {review.comment}
              </p>

              <button className="mt-5 flex items-center gap-2 text-gray-500 hover:text-black">

                <ThumbsUp size={18} />

                Helpful

              </button>

            </motion.div>

          ))}

        </div>

      </div>

    </section>
  );
}