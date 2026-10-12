import {
  Feather,
  ShieldCheck,
  Heart,
  Globe,
  ArrowRight,
} from "lucide-react";

export default function BrandStatement() {
  const items = [
    {
      icon: <Feather size={30} />,
      title: "Thoughtful Design",
      text: "Every piece is designed with purpose and precision.",
    },
    {
      icon: <ShieldCheck size={30} />,
      title: "Premium Quality",
      text: "Crafted from carefully selected materials for lasting comfort.",
    },
    {
      icon: <Heart size={30} />,
      title: "Made for You",
      text: "Timeless styles that fit your everyday life.",
    },
    {
      icon: <Globe size={30} />,
      title: "Sustainable Choice",
      text: "Designed responsibly for people and the planet.",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-[#FAF8F5] py-10">
          <h1 className="absolute inset-0 flex items-center justify-center pointer-events-none select-none font-serif font-light text-black/5 text-[18vw] tracking-[0.08em] whitespace-nowrap">
                HAIERAH
           </h1>
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-5 gap-14">
          {/* Left */}
          <div className="lg:col-span-2">
            <p className="uppercase tracking-[5px] text-xs text-gray-500 mb-5">
              Our Philosophy
            </p>

            <h2 className="text-5xl font-serif font-light leading-tight">
              The HAIERAH Way
            </h2>

            <p className="mt-8 text-gray-600 leading-8">
              At HAIERAH, we believe luxury is found in thoughtful details.
              Every garment is crafted with intention, timeless design,
              and uncompromising quality.
            </p>

            <button className="group mt-10 flex items-center gap-2 uppercase tracking-widest text-sm">
              Our Story

              <ArrowRight
                size={18}
                className="transition-transform duration-300 group-hover:translate-x-2"
              />
            </button>
          </div>

          {/* Right */}
          <div className="lg:col-span-3 grid md:grid-cols-2 xl:grid-cols-4">
            {items.map((item) => (
              <div
                key={item.title}
                className="px-8 py-6 border-l border-gray-200"
              >
                <div className="text-black mb-6">
                  {item.icon}
                </div>

                <h3 className="text-xl font-medium mb-4">
                  {item.title}
                </h3>

                <p className="text-gray-500 leading-7">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}