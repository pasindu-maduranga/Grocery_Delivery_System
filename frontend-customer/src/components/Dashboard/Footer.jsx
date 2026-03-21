export default function PromoBanner() {
  return (
    <div className="bg-emerald-800 rounded-3xl overflow-hidden mb-10 relative text-white">
      <div className="relative p-12 bg-gradient-to-r from-emerald-900 to-emerald-900/60 flex items-center justify-between">
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
      </div>
    </div>
  );
}