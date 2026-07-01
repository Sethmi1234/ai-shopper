import { Sparkles, Search } from "lucide-react";

export default function Hero() {
  return (
    <div className="relative pt-10 pb-20 md:pt-16 md:pb-32 px-5 md:px-10 rounded-2xl md:rounded-3xl flex flex-col md:flex-row justify-between items-center bg-gradient-to-br from-indigo-50 via-purple-50 to-white overflow-hidden gap-10 md:gap-0">
      <div className="max-w-xl relative z-10 w-full text-center md:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100/50 text-blue-700 text-sm font-medium mb-6">
          <Sparkles size={16} />
          Powered by Smart AI
        </div>
        
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.1]">
          Shop Smarter <br />
          <span className="text-blue-600">with AI</span>
        </h1>
        
        <p className="mt-4 md:mt-6 text-base sm:text-lg text-gray-600 leading-relaxed max-w-lg mx-auto md:mx-0">
          Discover products perfectly tailored to your needs. Our intelligent assistant learns your preferences to curate an effortless, personalized shopping experience.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3 sm:gap-4 w-full">
          <button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 transition-colors text-white px-8 py-3.5 rounded-full font-medium shadow-sm">
            Explore Products
          </button>
          <button className="w-full sm:w-auto bg-white hover:bg-gray-50 transition-colors text-gray-800 px-6 py-3.5 rounded-full font-medium shadow-sm border border-gray-100 flex items-center justify-center gap-2">
            <Search size={18} className="text-blue-600" />
            <Sparkles size={18} className="text-purple-500" />
            Try AI Search
          </button>
        </div>
      </div>

      {/* Hero Image */}
      <div className="hidden md:block relative z-10">
        <div className="w-[320px] lg:w-[420px] h-[320px] lg:h-[420px] rounded-3xl overflow-hidden shadow-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1607082348524-1a0d98a8a923?w=800&h=800&auto=format&fit=crop&q=80"
            alt="AI Shopping Experience"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      
      {/* Decorative background blur */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-blue-100/40 rounded-full blur-3xl -z-0"></div>
    </div>
  );
}