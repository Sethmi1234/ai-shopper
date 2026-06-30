import { Sparkles } from "lucide-react";

export default function AISearch() {
  return (
    <div className="relative -mt-8 md:-mt-16 max-w-4xl mx-auto z-20 px-2 sm:px-0">
      <div className="bg-white rounded-3xl p-5 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col items-center">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6 text-center">What are you looking for today?</h2>

        <div className="w-full relative flex flex-col sm:flex-row items-center gap-3 sm:gap-0">
          <div className="hidden sm:block absolute left-6 text-blue-600 z-10">
            <Sparkles size={20} />
          </div>
          <input
            className="w-full pl-5 sm:pl-14 pr-5 sm:pr-32 py-4 sm:py-5 bg-gray-50/50 border border-gray-200 rounded-2xl sm:rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-700 placeholder-gray-400 text-base md:text-lg"
            placeholder="Describe the product you need..."
          />
          <button className="w-full sm:w-auto sm:absolute right-3 top-1/2 sm:-translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 sm:py-2.5 rounded-xl sm:rounded-full font-medium transition-colors shadow-sm flex justify-center items-center gap-2">
            <span className="sm:hidden"><Sparkles size={18} /></span>
            Ask AI
          </button>
        </div>

        <div className="flex items-center gap-3 mt-5 md:mt-6 text-sm text-gray-500 w-full overflow-x-auto pb-2 scrollbar-hide snap-x">
          <span className="font-medium mr-1 md:mr-2 shrink-0 snap-start">Try:</span>
          {["Skincare for dry skin", "Gifts for tech lovers", "Minimalist desk setup"].map((suggestion) => (
            <button key={suggestion} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-1.5 rounded-full transition-colors whitespace-nowrap shrink-0 snap-start">
              "{suggestion}"
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}