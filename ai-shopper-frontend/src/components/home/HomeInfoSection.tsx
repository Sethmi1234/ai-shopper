import { ArrowRight, Truck, RefreshCcw, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function HomeInfoSection() {
  return (
    <div className="bg-white border-t border-gray-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        
        {/* Services Section */}
        <div className="mb-24">
          <h2 className="text-2xl md:text-3xl font-black text-black uppercase tracking-tighter mb-10 text-center">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 flex flex-col items-center text-center group hover:bg-black transition-colors duration-300">
              <Truck size={32} className="text-black mb-4 group-hover:text-[#ccff00] transition-colors" />
              <h3 className="font-bold text-lg mb-2 group-hover:text-white uppercase tracking-wider">Fast Delivery</h3>
              <p className="text-gray-500 text-sm group-hover:text-gray-300">We offer worldwide fast delivery with real-time tracking.</p>
            </div>
            <div className="bg-gray-50 p-8 flex flex-col items-center text-center group hover:bg-black transition-colors duration-300">
              <RefreshCcw size={32} className="text-black mb-4 group-hover:text-[#ccff00] transition-colors" />
              <h3 className="font-bold text-lg mb-2 group-hover:text-white uppercase tracking-wider">Easy Returns</h3>
              <p className="text-gray-500 text-sm group-hover:text-gray-300">30-day return policy for a completely hassle-free experience.</p>
            </div>
            <div className="bg-gray-50 p-8 flex flex-col items-center text-center group hover:bg-black transition-colors duration-300">
              <ShieldCheck size={32} className="text-black mb-4 group-hover:text-[#ccff00] transition-colors" />
              <h3 className="font-bold text-lg mb-2 group-hover:text-white uppercase tracking-wider">Secure Checkout</h3>
              <p className="text-gray-500 text-sm group-hover:text-gray-300">Your payment information is processed securely with AI encryption.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* About Us */}
          <div className="flex flex-col">
            <h2 className="text-2xl md:text-3xl font-black text-black uppercase tracking-tighter mb-6">About AI Shop</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              We started with a simple vision: to revolutionize the way you discover and purchase products online. By leveraging cutting-edge artificial intelligence, we curate a unique selection of items tailored exactly to your preferences.
            </p>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Our team of experts and data scientists work tirelessly to ensure that every recommendation is spot on, making your shopping experience faster, smarter, and incredibly reliable.
            </p>
            <Link href="#" className="flex items-center gap-2 text-black font-bold uppercase tracking-wider text-sm hover:text-gray-600 transition-colors w-fit">
              Read Our Story <ArrowRight size={16} />
            </Link>
          </div>

          {/* Blog Preview */}
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-end mb-2">
              <h2 className="text-2xl font-black text-black uppercase tracking-tighter">Latest from Blog</h2>
              <Link href="#" className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-colors">
                View All
              </Link>
            </div>
            
            <div className="flex gap-4 group cursor-pointer">
              <div className="relative w-24 h-24 shrink-0 overflow-hidden bg-gray-100">
                <Image src="https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=200&h=200" alt="Tech setup" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Tech / 2 Days Ago</p>
                <h4 className="font-bold text-black text-lg group-hover:text-gray-600 transition-colors line-clamp-2">How AI is changing the landscape of modern electronics</h4>
              </div>
            </div>

            <div className="flex gap-4 group cursor-pointer">
              <div className="relative w-24 h-24 shrink-0 overflow-hidden bg-gray-100">
                <Image src="https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=200&h=200" alt="Fashion" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Fashion / 1 Week Ago</p>
                <h4 className="font-bold text-black text-lg group-hover:text-gray-600 transition-colors line-clamp-2">The intersection of smart tech and everyday wear</h4>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
