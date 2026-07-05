import { Truck, ShieldCheck, Headphones, Tag } from "lucide-react";

export default function Notices() {
  const notices = [
    {
      icon: <Truck size={24} strokeWidth={1.5} />,
      title: "Free Delivery",
      desc: "For orders over $50",
    },
    {
      icon: <ShieldCheck size={24} strokeWidth={1.5} />,
      title: "Secure Payment",
      desc: "100% secure checkout",
    },
    {
      icon: <Headphones size={24} strokeWidth={1.5} />,
      title: "24/7 Support",
      desc: "Dedicated support",
    },
    {
      icon: <Tag size={24} strokeWidth={1.5} />,
      title: "Daily Offers",
      desc: "Discount up to 70%",
    },
  ];

  return (
    <div className="w-full bg-white border-b border-gray-100 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4 divide-x divide-transparent md:divide-gray-100">
          {notices.map((notice, index) => (
            <div key={index} className="flex flex-col items-center justify-center text-center px-4">
              <div className="mb-3 text-gray-800">
                {notice.icon}
              </div>
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-1">
                {notice.title}
              </h4>
              <p className="text-xs text-gray-500">
                {notice.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
