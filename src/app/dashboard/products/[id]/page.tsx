"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import useCart from "@/store/useCart";
import {
  ChevronRight,
  Loader2,
  Star,
  Heart,
  ShoppingCart,
  Minus,
  Plus,
  Package,
  RotateCcw,
  Shield,
  Truck,
  Sparkles,
  Share2,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  CheckCircle,
  Tag,
} from "lucide-react";
import { useProductById } from "@/hooks/useProductById";

function formatCategoryName(slug: string) {
  return (slug || "")
    .split("-")
    .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          className={
            s <= Math.round(rating)
              ? "text-orange-400 fill-orange-400"
              : "text-gray-200 fill-gray-200"
          }
        />
      ))}
    </div>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const id = Number(params?.id);

  const { data: product, isLoading, error } = useProductById(id);

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const addItem = useCart((s: any) => s.addItem);

  const handleAddToCart = () => {
    if (!product) return;
    addItem(
      {
        id: product.id,
        title: product.title,
        price: product.price,
        thumbnail: product.thumbnail,
        category: product.category,
      },
      quantity
    );
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const images: string[] = product
    ? product.images?.length
      ? product.images
      : [product.thumbnail]
    : [];

  const prevImage = () =>
    setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  const nextImage = () =>
    setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-blue-600" size={44} />
          <p className="text-gray-400 text-sm">Loading product…</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 font-medium text-lg">Product not found.</p>
          <Link
            href="/dashboard"
            className="mt-4 inline-block text-blue-600 underline text-sm"
          >
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  const discountedOriginal =
    product.discountPercentage > 0
      ? (product.price / (1 - product.discountPercentage / 100)).toFixed(2)
      : null;

  const reviewCount = Array.isArray(product.reviews)
    ? product.reviews.length
    : typeof product.reviewsCount === "number"
    ? product.reviewsCount
    : 128;

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-400 flex-wrap">
            <Link
              href="/dashboard"
              className="hover:text-blue-600 transition-colors font-medium"
            >
              Home
            </Link>
            <ChevronRight size={14} />
            {product.category && (
              <>
                <Link
                  href={`/dashboard/category/${product.category}`}
                  className="hover:text-blue-600 transition-colors capitalize font-medium"
                >
                  {formatCategoryName(product.category)}
                </Link>
                <ChevronRight size={14} />
              </>
            )}
            <span className="text-gray-700 font-semibold truncate max-w-[200px]">
              {product.title}
            </span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">
          {/* ── LEFT: Image Gallery ── */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm aspect-square group">
              {images.length > 0 && (
                <Image
                  key={selectedImage}
                  src={images[selectedImage]}
                  alt={product.title}
                  fill
                  className="object-contain p-6 transition-opacity duration-300"
                  unoptimized
                  priority
                />
              )}

              {/* AI Recommended badge */}
              <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-md">
                <Sparkles size={12} />
                AI Recommended
              </div>

              {/* #1 Best Seller badge */}
              {product.rating >= 4.5 && (
                <div className="absolute top-4 right-14 bg-orange-500 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow">
                  #1 Best Seller
                </div>
              )}

              {/* Wishlist */}
              <button
                onClick={() => setWishlisted((v) => !v)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:scale-110 transition-transform"
              >
                <Heart
                  size={18}
                  className={
                    wishlisted ? "text-red-500 fill-red-500" : "text-gray-400"
                  }
                />
              </button>

              {/* Share */}
              <button className="absolute bottom-4 right-4 w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center text-gray-400 hover:text-blue-600 transition-colors">
                <Share2 size={16} />
              </button>

              {/* Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center text-gray-500 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center text-gray-500 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <ChevronRightIcon size={18} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative w-20 h-20 shrink-0 rounded-2xl overflow-hidden border-2 transition-all ${
                      selectedImage === i
                        ? "border-blue-600 shadow-md shadow-blue-100"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Thumbnail ${i + 1}`}
                      fill
                      className="object-contain p-1"
                      unoptimized
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: Product Info ── */}
          <div className="flex flex-col gap-6">
            {/* Brand + Title */}
            <div>
              {product.brand && (
                <p className="text-blue-600 font-semibold text-sm mb-1 uppercase tracking-wide">
                  {product.brand}
                </p>
              )}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-snug mb-3">
                {product.title}
              </h1>

              {/* Rating Row */}
              <div className="flex items-center gap-3 flex-wrap">
                <StarRating rating={product.rating} />
                <span className="font-bold text-gray-800">
                  {Number(product.rating).toFixed(1)}
                </span>
                <span className="text-blue-600 font-medium text-sm underline cursor-pointer">
                  {reviewCount} Reviews
                </span>
                {product.stock > 0 ? (
                  <span className="flex items-center gap-1.5 text-green-600 text-sm font-semibold">
                    <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                    In Stock ({product.stock} left)
                  </span>
                ) : (
                  <span className="text-red-500 text-sm font-semibold">
                    Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* Price Box */}
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
              <div className="flex items-end gap-3">
                <p className="text-4xl font-black text-gray-900">
                  ${Number(product.price).toFixed(2)}
                </p>
                {discountedOriginal && (
                  <p className="text-lg text-gray-400 line-through pb-1">
                    ${discountedOriginal}
                  </p>
                )}
                {product.discountPercentage > 0 && (
                  <span className="bg-red-100 text-red-600 text-sm font-bold px-2 py-0.5 rounded-full pb-1">
                    -{Math.round(product.discountPercentage)}% OFF
                  </span>
                )}
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-3">
              {product.description && (
                <p className="text-gray-500 text-sm leading-relaxed">
                  {product.description}
                </p>
              )}

              <div className="grid grid-cols-2 gap-3 text-sm">
                {product.sku && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Tag size={14} className="text-gray-400" />
                    <span>
                      SKU:{" "}
                      <span className="font-medium text-gray-700">
                        {product.sku}
                      </span>
                    </span>
                  </div>
                )}
                {product.weight && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Package size={14} className="text-gray-400" />
                    <span>
                      Weight:{" "}
                      <span className="font-medium text-gray-700">
                        {product.weight}g
                      </span>
                    </span>
                  </div>
                )}
                {product.warrantyInformation && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Shield size={14} className="text-gray-400" />
                    <span className="font-medium text-gray-700">
                      {product.warrantyInformation}
                    </span>
                  </div>
                )}
                {product.shippingInformation && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Truck size={14} className="text-gray-400" />
                    <span className="font-medium text-gray-700">
                      {product.shippingInformation}
                    </span>
                  </div>
                )}
                {product.returnPolicy && (
                  <div className="flex items-center gap-2 text-gray-500 col-span-2">
                    <RotateCcw size={14} className="text-gray-400" />
                    <span className="font-medium text-gray-700">
                      {product.returnPolicy}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Quantity + Add to Cart */}
            <div className="space-y-4">
              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-gray-600 w-20">
                  Quantity
                </span>
                <div className="flex items-center gap-0">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-10 h-10 rounded-l-full border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <div className="w-14 h-10 border-t border-b border-gray-200 bg-white flex items-center justify-center font-bold text-gray-800 text-lg">
                    {quantity}
                  </div>
                  <button
                    onClick={() =>
                      setQuantity((q) =>
                        Math.min(product.stock || 99, q + 1)
                      )
                    }
                    className="w-10 h-10 rounded-r-full border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={`flex-1 py-4 rounded-full font-bold text-base flex items-center justify-center gap-2.5 transition-all shadow-lg ${
                    addedToCart
                      ? "bg-green-600 text-white shadow-green-200"
                      : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  {addedToCart ? (
                    <>
                      <CheckCircle size={20} />
                      Added to Cart!
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={20} />
                      Add to Cart
                    </>
                  )}
                </button>
                <button className="flex-1 py-4 rounded-full font-bold text-base border-2 border-blue-600 text-blue-600 hover:bg-blue-50 transition-colors">
                  Buy Now
                </button>
              </div>

              {/* Wishlist */}
              <button
                onClick={() => setWishlisted((v) => !v)}
                className={`w-full py-3 rounded-full border text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                  wishlisted
                    ? "border-red-300 bg-red-50 text-red-500"
                    : "border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-400"
                }`}
              >
                <Heart size={16} className={wishlisted ? "fill-red-500" : ""} />
                {wishlisted ? "Saved to Wishlist" : "Add to Wishlist"}
              </button>
            </div>

            {/* Perks */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Truck, label: "Free Delivery", sub: "Orders $50+" },
                { icon: RotateCcw, label: "Easy Returns", sub: "30-day policy" },
                { icon: Shield, label: "Secure Pay", sub: "100% safe" },
              ].map(({ icon: Icon, label, sub }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-1.5 bg-blue-50/60 rounded-2xl p-3 text-center"
                >
                  <Icon size={20} className="text-blue-600" />
                  <p className="text-xs font-semibold text-gray-700">{label}</p>
                  <p className="text-[10px] text-gray-400">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Reviews Section ── */}
        {Array.isArray(product.reviews) && product.reviews.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Customer Reviews
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {product.reviews.map((review: any, i: number) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
                  style={{ animation: `fadeInUp 0.3s ease ${i * 0.07}s both` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">
                        {review.reviewerName || "Anonymous"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {review.date
                          ? new Date(review.date).toLocaleDateString()
                          : ""}
                      </p>
                    </div>
                    <StarRating rating={review.rating} size={13} />
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}