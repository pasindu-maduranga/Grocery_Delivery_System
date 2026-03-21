import { useEffect, useState } from "react";

const PROMO_SLIDES = [
  {
    badge: "Limited Time Offer",
    titleTop: "Farm Fresh",
    titleBottom: "Vegetables",
    description:
      "Organic hand-picked produce from local farms delivered to your door in under 60 minutes.",
    image:
      "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=900&q=80",
    alt: "Fresh carrots",
  },
  {
    badge: "Weekend Special",
    titleTop: "Daily Fresh",
    titleBottom: "Dairy Deals",
    description:
      "Milk, cheese, and yogurt from trusted local suppliers with same-day delivery.",
    image:
      "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=900&q=80",
    alt: "Milk and dairy products",
  },
  {
    badge: "Hot Savings",
    titleTop: "Bakery",
    titleBottom: "Freshly Baked",
    description:
      "Warm breads, buns, and pastries baked every morning and delivered fresh.",
    image:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=900&q=80",
    alt: "Fresh bakery products",
  },
];

export default function PromoBanner() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % PROMO_SLIDES.length);
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  const slide = PROMO_SLIDES[current];

  const goPrev = () =>
    setCurrent((prev) => (prev - 1 + PROMO_SLIDES.length) % PROMO_SLIDES.length);

  const goNext = () =>
    setCurrent((prev) => (prev + 1) % PROMO_SLIDES.length);

  return (
    <div className="bg-green-800 rounded-3xl overflow-hidden mb-10 relative text-white">
      <div className="relative p-12 bg-gradient-to-r from-green-900 to-green-900/60 flex items-center justify-between gap-8 min-h-[360px]">
        <div className="max-w-md">
          <span className="inline-block px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-black uppercase tracking-widest mb-4">
            {slide.badge}
          </span>

          <h1 className="text-5xl font-black leading-tight mb-4">
            {slide.titleTop}
            <br />
            <span className="text-green-400">{slide.titleBottom}</span>
          </h1>

          <p className="text-green-100 mb-8 font-medium leading-relaxed">
            {slide.description}
          </p>
        </div>

        <div className="hidden lg:flex relative z-10 w-64 h-64 shrink-0">
          <img
            src={slide.image}
            alt={slide.alt}
            className="w-full h-full object-cover rounded-full transition-all duration-700 shadow-2xl border-8 border-green-800"
          />
        </div>

        <button
          type="button"
          onClick={goPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white"
          aria-label="Previous banner"
        >
          ‹
        </button>

        <button
          type="button"
          onClick={goNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white"
          aria-label="Next banner"
        >
          ›
        </button>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {PROMO_SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrent(i)}
              className={`h-2.5 rounded-full transition-all ${
                i === current ? "w-6 bg-white" : "w-2.5 bg-white/45 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}