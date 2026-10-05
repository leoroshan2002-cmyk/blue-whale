export default function FeaturedBanner() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <div className="relative h-[400px] rounded-3xl overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=2000"
          className="w-full h-full object-cover"
          alt="The Denim Edit Featured Collection"
        />

        <div className="absolute inset-0 bg-black/40" />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <span className="tracking-[4px]">
            TRENDING NOW
          </span>

          <h2 className="text-6xl font-bold">
            The Denim Edit
          </h2>
        </div>
      </div>
    </section>
  );
}