"use client";

import { useState } from "react";
import {
  X,
  Check,
  Share2,
  Mail,
  Link as LinkIcon,
  MessageCircle,
  Send,
  Globe,
  ExternalLink,
} from "lucide-react";

type ShareModalProps = {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    title: string;
    price: number;
    thumbnail?: string;
    category?: string;
  };
};

const shareChannels = [
  {
    name: "Facebook",
    icon: Globe,
    color: "bg-blue-600 hover:bg-blue-700",
    getUrl: (url: string, title: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(title)}`,
  },
  {
    name: "Twitter / X",
    icon: ExternalLink,
    color: "bg-black hover:bg-gray-800",
    getUrl: (url: string, title: string) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
  },
  {
    name: "WhatsApp",
    icon: MessageCircle,
    color: "bg-green-500 hover:bg-green-600",
    getUrl: (url: string, title: string) =>
      `https://wa.me/?text=${encodeURIComponent(`${title} - ${url}`)}`,
  },
  {
    name: "Telegram",
    icon: Send,
    color: "bg-blue-500 hover:bg-blue-600",
    getUrl: (url: string, title: string) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  {
    name: "Email",
    icon: Mail,
    color: "bg-gray-600 hover:bg-gray-700",
    getUrl: (url: string, title: string) =>
      `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Check out this product: ${title}\n\n${url}`)}`,
  },
];

export default function ShareModal({ isOpen, onClose, product }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const productUrl = typeof window !== "undefined"
    ? `${window.location.origin}/dashboard/products/${product.id}`
    : `/dashboard/products/${product.id}`;

  const shareTitle = `Check out "${product.title}" - $${Number(product.price).toFixed(2)} on AI Shop!`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(productUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = productUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = (channel: typeof shareChannels[0]) => {
    const url = channel.getUrl(productUrl, shareTitle);
    window.open(url, "_blank", "noopener,noreferrer,width=600,height=600");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-4 p-6 animate-pop-in">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <Share2 size={18} className="text-black" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-base">Share this product</h3>
            <p className="text-xs text-gray-500 truncate max-w-[200px]">
              {product.title}
            </p>
          </div>
        </div>

        {/* Share Channels */}
        <div className="grid grid-cols-5 gap-3 mb-6">
          {shareChannels.map((channel) => (
            <button
              key={channel.name}
              onClick={() => handleShare(channel)}
              className="flex flex-col items-center gap-1.5 group"
              title={channel.name}
            >
              <div
                className={`w-12 h-12 rounded-2xl ${channel.color} flex items-center justify-center text-white shadow-sm transition-all group-hover:scale-110 group-hover:shadow-md`}
              >
                <channel.icon size={20} />
              </div>
              <span className="text-[10px] text-gray-500 font-medium truncate w-full text-center">
                {channel.name.split(" / ")[0]}
              </span>
            </button>
          ))}
        </div>

        {/* Copy Link */}
        <button
          onClick={handleCopyLink}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
        >
          <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
            {copied ? (
              <Check size={16} className="text-green-600" />
            ) : (
              <LinkIcon size={16} className="text-gray-600" />
            )}
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-gray-700">
              {copied ? "Link copied!" : "Copy link"}
            </p>
            <p className="text-[11px] text-gray-400 truncate">{productUrl}</p>
          </div>
        </button>

        <style jsx>{`
          @keyframes pop-in {
            from {
              opacity: 0;
              transform: scale(0.9) translateY(10px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
          .animate-pop-in {
            animation: pop-in 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          }
        `}</style>
      </div>
    </div>
  );
}
