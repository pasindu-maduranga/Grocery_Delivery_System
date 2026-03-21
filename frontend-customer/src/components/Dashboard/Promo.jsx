export default function PromoBanner() {
  return (
    <div className="bg-emerald-800 rounded-3xl overflow-hidden mb-10 relative text-white">
      <div className="relative p-12 bg-gradient-to-r from-emerald-900 to-emerald-900/60 flex items-center justify-between gap-8">
        <div className="max-w-md">
          <span className="inline-block px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-black uppercase tracking-widest mb-4">
            Limited Time Offer
          </span>
          <h1 className="text-5xl font-black leading-tight mb-4">
            Farm Fresh
            <br />
            <span className="text-emerald-400">Vegetables</span>
          </h1>
          <p className="text-emerald-100 mb-8 font-medium leading-relaxed">
            Organic hand-picked produce from local farms delivered to your door in under 60 minutes.
          </p>
        </div>

        <div className="hidden lg:flex relative z-10 w-64 h-64 shrink-0">
          <img
            src="https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500&q=80"
            alt="Fresh carrots"
            className="w-full h-full object-cover rounded-full mix-blend-luminosity hover:mix-blend-normal transition-all duration-700 shadow-2xl border-8 border-emerald-800"
          />
        </div>
      </div>
    </div>
  );
}