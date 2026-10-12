import { ArrowRight } from "lucide-react";
import React, { useEffect, useState } from "react";
import { fetchProducts } from "../services/api";
import { DEFAULT_IMAGE_FALLBACK, getSafeImageUrl, normalizeImageList } from "../utils/productImages";
import { Link } from "react-router-dom";

export default function NewArrivals() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const all = await fetchProducts();
      if (!mounted) return;

      const sorted = all.slice().sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : (a.id || 0);
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : (b.id || 0);
        return bTime - aTime;
      });

      setProducts(sorted.slice(0, 8));
    };

    load();

    return () => { mounted = false; };
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-6 py-20">

      {/* Heading */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
       
        <div>
          <span className="uppercase tracking-[4px] text-xs text-gray-500">
            New Season
          </span>

          <h2 className="text-5xl font-light mt-3">Just Dropped</h2>

          <p className="text-gray-500 mt-4 max-w-lg">
            Discover effortless styles crafted for modern living.
            Every piece is designed to blend comfort,
            elegance and timeless fashion.
          </p>
        </div>

        <button className="group flex items-center gap-2 text-sm font-medium hover:text-black transition">
          View All
          <ArrowRight
            size={18}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </button>
      </div>

      {/* Main Layout */}
      <div className="grid lg:grid-cols-5 gap-10 items-start">
        {/* Editorial Banner */}
        <div className="lg:col-span-2">
          <div className="relative overflow-hidden rounded-[32px] h-[620px] group">
            <img
              src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80"
              alt="HAIRA Collection"
              className="w-full h-full object-cover transition duration-700 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            <div className="absolute bottom-10 left-8 right-8">
              <p className="uppercase tracking-[5px] text-white/70 text-sm">
                HAIRA EDIT
              </p>

              <h3 className="text-4xl text-white font-light mt-4 leading-tight">
                Crafted for
                <br />
                Everyday Luxury
              </h3>

              <p className="text-white/80 mt-4">
                Fresh arrivals inspired by effortless elegance.
              </p>

              <button className="mt-8 bg-white text-black px-6 py-3 rounded-full hover:bg-black hover:text-white transition duration-300">
                Explore Collection
              </button>
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="lg:col-span-3 overflow-x-auto scrollbar-hide">
          <div className="flex gap-6 pb-4 w-max">
            {products.length > 0 ? (
              products.map((product) => {
                const images = normalizeImageList(product.images || [product.image]);
                const image = getSafeImageUrl(images[0] || product.image, DEFAULT_IMAGE_FALLBACK);
                const priceValue = product.discountPrice || product.price || 0;

                return (
                  <Link
                    to={`/product/${product.id}`}
                    key={product.id || product.slug || product.name}
                    className="w-[280px] flex-shrink-0 group cursor-pointer"
                  >
                    <div className="overflow-hidden rounded-3xl bg-gray-100">
                      <img
                        src={image}
                        alt={product.name}
                        className="w-full h-[380px] object-cover transition duration-700 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.src = DEFAULT_IMAGE_FALLBACK;
                        }}
                      />
                    </div>

                    <div className="mt-5">
                      <h3 className="text-lg font-medium group-hover:text-gray-800 transition">
                        {product.name}
                      </h3>

                      <p className="text-gray-500 mt-1">₹{priceValue}</p>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="w-full py-12 text-center text-slate-500">No new arrivals yet.</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}