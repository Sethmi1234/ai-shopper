import { ArrowRight, Award, Users, Target, Lightbulb, BarChart3, Shield } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const milestones = [
  { year: "2020", title: "Founded", desc: "AI Shop was born from a vision to merge artificial intelligence with e-commerce." },
  { year: "2021", title: "1M Customers", desc: "Reached our first million customers across North America and Europe." },
  { year: "2022", title: "AI Launch", desc: "Launched our proprietary AI recommendation engine, boosting accuracy by 40%." },
  { year: "2023", title: "Global Expansion", desc: "Expanded to 50+ countries with localized AI shopping experiences." },
  { year: "2024", title: "2M+ Customers", desc: "Surpassed 2 million active customers with a 4.9/5 satisfaction rating." },
  { year: "2025", title: "Next Gen AI", desc: "Introduced real-time AI visual search and predictive inventory management." },
];

const values = [
  {
    icon: <Lightbulb size={24} strokeWidth={1.5} />,
    title: "Innovation First",
    desc: "We push the boundaries of what AI can do for shopping, constantly improving our algorithms.",
  },
  {
    icon: <Users size={24} strokeWidth={1.5} />,
    title: "Customer Obsessed",
    desc: "Every decision starts with our customers. Your satisfaction is our north star.",
  },
  {
    icon: <Shield size={24} strokeWidth={1.5} />,
    title: "Trust & Transparency",
    desc: "We believe in honest pricing, clear policies, and protecting your data with cutting-edge security.",
  },
  {
    icon: <Target size={24} strokeWidth={1.5} />,
    title: "Precision & Quality",
    desc: "Our AI curates only the best products, ensuring every recommendation meets high quality standards.",
  },
];

const team = [
  {
    name: "Sarah Chen",
    role: "CEO & Co-Founder",
    img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300&h=300",
    bio: "Former AI researcher at Stanford. Passionate about democratizing smart shopping.",
  },
  {
    name: "Marcus Johnson",
    role: "CTO & Co-Founder",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300&h=300",
    bio: "Built recommendation systems at Google. Leads our AI and engineering teams.",
  },
  {
    name: "Elena Rodriguez",
    role: "Head of Product",
    img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300&h=300",
    bio: "Product leader with 10+ years in e-commerce. Shapes the AI Shop experience.",
  },
  {
    name: "David Kim",
    role: "VP of Engineering",
    img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300&h=300",
    bio: "Scaled platforms to millions of users. Ensures our infrastructure is rock-solid.",
  },
];

export default function AboutSection() {
  return (
    <section id="about" className="bg-white border-t border-gray-200 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400 mb-4">Our Story</p>
          <h2 className="text-3xl md:text-5xl font-black text-black uppercase tracking-tighter mb-4">
            About AI Shop
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm md:text-base">
            We're on a mission to transform online shopping through the power of artificial intelligence — making every discovery personal, every purchase effortless, and every experience exceptional.
          </p>
        </div>

        {/* Mission Statement */}
        <div className="bg-black p-10 md:p-16 mb-20">
          <div className="max-w-3xl mx-auto text-center">
            <Award size={40} className="text-[#ccff00] mx-auto mb-6" />
            <blockquote className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter leading-tight">
              &ldquo;Shopping should feel like it was made just for you.&rdquo;
            </blockquote>
            <p className="text-gray-400 mt-6 text-sm leading-relaxed max-w-2xl mx-auto">
              At AI Shop, we believe that technology should serve people — not the other way around. 
              Our AI doesn't just recommend products; it understands your style, your needs, and your budget 
              to deliver a truly personalized shopping experience.
            </p>
          </div>
        </div>

        {/* Timeline / Milestones */}
        <div className="mb-20">
          <h3 className="text-2xl font-black text-black uppercase tracking-tighter mb-10 text-center">Our Journey</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {milestones.map((m, i) => (
              <div key={i} className="relative pl-8 border-l-2 border-black">
                <div className="absolute left-0 top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-black" />
                <p className="text-xs font-black text-[#ccff00] bg-black inline-block px-2 py-0.5 mb-2">{m.year}</p>
                <h4 className="font-bold text-black text-base mb-1">{m.title}</h4>
                <p className="text-gray-500 text-sm">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Values */}
        <div className="mb-20">
          <h3 className="text-2xl font-black text-black uppercase tracking-tighter mb-10 text-center">What We Stand For</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <div key={i} className="bg-gray-50 p-8 text-center group hover:bg-black transition-colors duration-300">
                <div className="text-black group-hover:text-[#ccff00] transition-colors mb-4 flex justify-center">{v.icon}</div>
                <h4 className="font-bold text-base mb-2 group-hover:text-white uppercase tracking-wider transition-colors">{v.title}</h4>
                <p className="text-gray-500 text-sm group-hover:text-gray-300 transition-colors">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="mb-20">
          <h3 className="text-2xl font-black text-black uppercase tracking-tighter mb-4 text-center">Meet Our Leadership</h3>
          <p className="text-gray-500 text-sm text-center max-w-xl mx-auto mb-10">
            A diverse team of innovators, engineers, and customer advocates working behind the scenes to power your shopping experience.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, i) => (
              <div key={i} className="group text-center">
                <div className="relative w-40 h-40 mx-auto mb-5 overflow-hidden bg-gray-100 rounded-full">
                  <Image
                    src={member.img}
                    alt={member.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h4 className="font-bold text-black text-base">{member.name}</h4>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mt-1 mb-2">{member.role}</p>
                <p className="text-gray-500 text-xs">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-gray-50 p-10 md:p-16">
          <h3 className="text-2xl md:text-3xl font-black text-black uppercase tracking-tighter mb-4">
            Ready to Experience the Future?
          </h3>
          <p className="text-gray-500 max-w-xl mx-auto mb-8 text-sm">
            Join over 2 million customers who have discovered a smarter way to shop.
          </p>
          <Link
            href="/dashboard/products"
            className="inline-flex items-center gap-2 bg-black text-[#ccff00] px-8 py-4 text-sm font-black uppercase tracking-widest hover:bg-gray-900 transition-colors"
          >
            Start Shopping <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}