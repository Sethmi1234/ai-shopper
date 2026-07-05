import { Sparkles, ArrowRight } from "lucide-react";

export default function AISearch() {
  return (
    <div className="relative -mt-6 md:-mt-12 max-w-4xl mx-auto z-20 px-4 sm:px-0 mb-8">
      <div className="bg-white p-6 md:p-10 shadow-2xl border border-gray-100 flex flex-col items-center">
        <h2 className="text-xl md:text-2xl font-black text-black uppercase tracking-tighter mb-6 text-center">What are you looking for today?</h2>

        <div className="w-full relative flex flex-col sm:flex-row items-center gap-4 sm:gap-0">
          <div className="hidden sm:block absolute left-6 text-black z-10">
            <Sparkles size={20} />
          </div>
          <input
            className="w-full pl-5 sm:pl-16 pr-5 sm:pr-40 py-4 sm:py-5 bg-gray-50 border border-gray-200 focus:outline-none focus:border-black transition-colors text-black placeholder-gray-400 text-base md:text-lg font-medium rounded-none"
            placeholder="Describe the product you need..."
          />
          <button className="w-full sm:w-auto sm:absolute right-2 top-1/2 sm:-translate-y-1/2 bg-[#ccff00] hover:bg-[#b3e600] text-black px-8 py-3.5 sm:py-3 font-black uppercase tracking-wider transition-transform hover:-translate-y-0.5 flex justify-center items-center gap-2">
            <span className="sm:hidden"><Sparkles size={18} /></span>
            Ask AI <ArrowRight size={18} />
          </button>
        </div>

        <div className="flex items-center gap-3 mt-6 text-xs text-gray-500 w-full overflow-x-auto pb-2 scrollbar-hide snap-x uppercase font-bold tracking-widest">
          <span className="text-black mr-1 shrink-0 snap-start">Try:</span>
          {["Skincare for dry skin", "Gifts for tech lovers", "Minimalist desk setup"].map((suggestion) => (
            <button key={suggestion} className="bg-gray-100 hover:bg-black hover:text-white text-gray-700 px-4 py-2 transition-colors whitespace-nowrap shrink-0 snap-start">
              "{suggestion}"
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}