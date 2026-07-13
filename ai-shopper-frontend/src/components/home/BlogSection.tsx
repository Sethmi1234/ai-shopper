import { ArrowRight, Calendar, Clock, User, Tag, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const blogPosts = [
  {
    id: 1,
    title: "How AI is Revolutionizing the Way We Shop Online",
    excerpt: "Discover how artificial intelligence is transforming e-commerce — from personalized recommendations to visual search and beyond.",
    category: "Technology",
    author: "Sarah Chen",
    date: "2 days ago",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=800&h=500",
    tags: ["AI", "E-Commerce", "Technology"],
  },
  {
    id: 2,
    title: "The Ultimate Guide to Smart Fashion: Where Tech Meets Style",
    excerpt: "From smart fabrics to AI-powered styling assistants, explore how technology is reshaping the fashion industry.",
    category: "Fashion",
    author: "Elena Rodriguez",
    date: "1 week ago",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=800&h=500",
    tags: ["Fashion", "Smart Wear", "Innovation"],
  },
  {
    id: 3,
    title: "Top 10 Gadgets Under $500 That Will Blow Your Mind",
    excerpt: "We've curated the best tech gadgets that deliver premium features without breaking the bank. AI-approved picks inside!",
    category: "Tech Reviews",
    author: "David Kim",
    date: "2 weeks ago",
    readTime: "8 min read",
    image: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?auto=format&fit=crop&q=80&w=800&h=500",
    tags: ["Gadgets", "Reviews", "Budget"],
  },
  {
    id: 4,
    title: "Sustainable Shopping: How to Make Eco-Friendly Choices",
    excerpt: "Learn how to reduce your environmental footprint while shopping online. Tips for choosing sustainable products and brands.",
    category: "Lifestyle",
    author: "Marcus Johnson",
    date: "3 weeks ago",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800&h=500",
    tags: ["Sustainability", "Lifestyle", "Eco-Friendly"],
  },
  {
    id: 5,
    title: "Behind the Algorithm: How Our AI Recommends Products",
    excerpt: "A deep dive into the machine learning models that power AI Shop's recommendation engine. No PhD required!",
    category: "Engineering",
    author: "Marcus Johnson",
    date: "1 month ago",
    readTime: "10 min read",
    image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&q=80&w=800&h=500",
    tags: ["AI", "Engineering", "Machine Learning"],
  },
  {
    id: 6,
    title: "Holiday Shopping Guide 2025: Best Gifts for Everyone",
    excerpt: "Our AI has analyzed millions of purchases to bring you the ultimate holiday gift guide. Find the perfect present for every personality.",
    category: "Shopping",
    author: "Sarah Chen",
    date: "1 month ago",
    readTime: "12 min read",
    image: "https://images.unsplash.com/photo-1482517967863-00e15c9b44be?auto=format&fit=crop&q=80&w=800&h=500",
    tags: ["Holiday", "Gifts", "Guide"],
  },
];

const featuredPosts = blogPosts.slice(0, 3);
const recentPosts = blogPosts.slice(3);

export default function BlogSection() {
  return (
    <section id="blog" className="bg-white border-t border-gray-200 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400 mb-4">Insights & Updates</p>
            <h2 className="text-3xl md:text-5xl font-black text-black uppercase tracking-tighter">
              Our Blog
            </h2>
            <p className="text-gray-500 mt-4 max-w-xl text-sm">
              Stories, insights, and guides from the AI Shop team. Discover the latest in AI technology, shopping trends, and product recommendations.
            </p>
          </div>
          <Link
            href="#"
            className="hidden md:inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-black hover:text-gray-600 transition-colors mt-4 md:mt-0"
          >
            View All Articles <ArrowRight size={14} />
          </Link>
        </div>

        {/* Featured Posts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {featuredPosts.map((post, i) => (
            <article
              key={post.id}
              className="group cursor-pointer"
              style={{ animation: `fadeInUp 0.5s ease ${i * 0.1}s both` }}
            >
              <div className="relative h-52 overflow-hidden bg-gray-100 mb-5">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-3 left-3">
                  <span className="bg-black text-[#ccff00] text-[10px] font-black uppercase tracking-wider px-2.5 py-1">
                    {post.category}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-400 font-bold uppercase tracking-widest mb-3">
                <span className="flex items-center gap-1.5">
                  <Calendar size={12} /> {post.date}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={12} /> {post.readTime}
                </span>
              </div>
              <h3 className="font-bold text-lg text-black mb-2 group-hover:text-gray-600 transition-colors leading-snug">
                {post.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">
                {post.excerpt}
              </p>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-black group-hover:text-gray-600 transition-colors">
                Read More <ArrowRight size={12} />
              </div>
            </article>
          ))}
        </div>

        {/* Recent Posts */}
        <div className="border-t border-gray-200 pt-16">
          <h3 className="text-2xl font-black text-black uppercase tracking-tighter mb-10">More Articles</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {recentPosts.map((post, i) => (
              <article
                key={post.id}
                className="group cursor-pointer flex flex-col sm:flex-row md:flex-col gap-4"
                style={{ animation: `fadeInUp 0.5s ease ${i * 0.1}s both` }}
              >
                <div className="relative w-full sm:w-36 md:w-full h-36 sm:h-28 md:h-44 overflow-hidden bg-gray-100 shrink-0">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-2 left-2">
                    <span className="bg-black text-[#ccff00] text-[9px] font-black uppercase tracking-wider px-2 py-0.5">
                      {post.category}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">
                    <span className="flex items-center gap-1">
                      <Calendar size={10} /> {post.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={10} /> {post.readTime}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-black mb-1.5 group-hover:text-gray-600 transition-colors line-clamp-2">
                    {post.title}
                  </h4>
                  <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2 text-[10px] font-bold uppercase tracking-wider text-black group-hover:text-gray-600 transition-colors">
                    Read <ChevronRight size={10} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Newsletter CTA */}
        <div className="mt-20 bg-black p-10 md:p-16 text-center">
          <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter mb-4">
            Stay in the Loop
          </h3>
          <p className="text-gray-400 max-w-xl mx-auto mb-8 text-sm">
            Get the latest articles, product updates, and exclusive offers delivered straight to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row max-w-md mx-auto gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 bg-white/10 border border-white/20 px-5 py-3.5 text-sm text-white outline-none focus:bg-white/20 focus:border-white/40 transition-colors placeholder:text-gray-500"
            />
            <button className="bg-[#ccff00] hover:bg-[#b3e600] text-black px-8 py-3.5 text-sm font-black uppercase tracking-widest transition-colors shrink-0">
              Subscribe
            </button>
          </div>
          <p className="text-gray-500 text-xs mt-4">No spam. Unsubscribe anytime.</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}