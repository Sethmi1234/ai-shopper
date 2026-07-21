"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import useCart from "../../../store/useCart";
import { ShoppingCart, X, Minus, Plus, Truck, Shield, CheckCircle, ArrowLeft } from "lucide-react";
import { useCreateOrder } from "../../../hooks/useOrders";

export default function CartPage() {
  const items = useCart((state) => state.items);
  const updateQuantity = useCart((state) => state.updateQuantity);
  const removeItem = useCart((state) => state.removeItem);
  const clearCart = useCart((state) => state.clearCart);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);
  const createOrderMutation = useCreateOrder();

  const subtotal = items.reduce((sum, item) => sum + item.quantity * Number(item.price || 0), 0);
  const shipping = subtotal > 50 ? 0 : 9.99;
  const total = subtotal + shipping;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    setCheckoutMessage(null);

    try {
      // Prepare order items from current cart state
      const orderItems = items.map((item) => ({
        id: item.id,
        productId: String(item.id),
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        thumbnail: item.thumbnail || "",
      }));

      const totalAmount = items.reduce(
        (sum, item) => sum + Number(item.price) * item.quantity,
        0
      );

      await createOrderMutation.mutateAsync({
        items: orderItems,
        totalAmount,
      });

      setCheckoutMessage(`Order created successfully! Total: $${totalAmount.toFixed(2)}`);

      // Clear local cart after successful order
      await clearCart();
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || "Failed to create order. Please try again.";
      setCheckoutMessage(errorMsg);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleRemoveItem = async (id: string) => {
    try {
      await removeItem(id);
    } catch (err) {
      console.warn("Failed to remove item", err);
    }
  };

  const handleUpdateQuantity = async (id: string, qty: number) => {
    try {
      await updateQuantity(id, qty);
    } catch (err) {
      console.warn("Failed to update quantity", err);
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
    } catch (err) {
      console.warn("Failed to clear cart", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-black text-white py-10 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <Link href="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-[#ccff00] transition-colors text-xs font-bold uppercase tracking-widest mb-4">
            <ArrowLeft size={14} /> Continue Shopping
          </Link>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">Your Cart</h1>
          <p className="text-gray-400 mt-1 text-sm">{itemCount} {itemCount === 1 ? "item" : "items"}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {checkoutMessage && (
          <div className={`mb-6 p-4 border text-sm font-bold ${
            checkoutMessage.includes("successfully")
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}>
            {checkoutMessage === "Cart is empty. Please add items to your cart before checkout." 
              ? "Cart is empty. Please add items to your cart before checkout." 
              : checkoutMessage}
          </div>
        )}

        {items.length === 0 ? (
          <div className="text-center py-24">
            <div className="mx-auto mb-6 inline-flex h-20 w-20 items-center justify-center bg-black text-[#ccff00]">
              <ShoppingCart size={36} />
            </div>
            <h2 className="text-2xl font-black text-black uppercase tracking-tight mb-3">Your cart is empty</h2>
            <p className="text-gray-500 text-sm mb-8">Add items from the products page and they will appear here.</p>
            <Link
              href="/dashboard/products"
              className="inline-block bg-black text-[#ccff00] px-8 py-4 text-sm font-black uppercase tracking-widest hover:bg-gray-900 transition-colors"
            >
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Cart Items */}
            <div className="flex-1 flex flex-col gap-4">
              {/* Header Row */}
              <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 text-xs font-black uppercase tracking-widest text-gray-500 border-b border-gray-200 pb-3">
                <span>Product</span>
                <span className="text-center">Qty</span>
                <span className="text-center">Price</span>
                <span className="text-right">Subtotal</span>
              </div>

              {items.map((item) => (
                <div key={item.id} className="bg-white border border-gray-100 p-4 md:p-6 flex flex-col md:grid md:grid-cols-[2fr_1fr_1fr_1fr] gap-4 items-center">
                  {/* Product info */}
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden bg-gray-100">
                      {item.thumbnail ? (
                        <Image src={item.thumbnail} alt={item.title} fill className="object-cover" unoptimized />
                      ) : (
                        <div className="h-full w-full bg-gray-200" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">{item.category || "Product"}</p>
                      <h2 className="font-bold text-gray-900 text-sm line-clamp-2">{item.title}</h2>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="mt-2 text-xs text-red-500 hover:text-red-700 font-bold uppercase tracking-wider"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="flex items-center justify-center gap-2 border border-gray-200 bg-gray-50 w-fit mx-auto">
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-black hover:text-white transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center font-black text-sm">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-black hover:text-white transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Price */}
                  <p className="text-center font-bold text-gray-900">${Number(item.price).toFixed(2)}</p>

                  {/* Subtotal */}
                  <p className="text-right font-black text-gray-900 text-lg">
                    ${(item.quantity * Number(item.price)).toFixed(2)}
                  </p>
                </div>
              ))}

              {/* Clear Cart */}
              <div className="flex justify-end">
                <button
                  onClick={handleClearCart}
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors"
                >
                  <X size={14} /> Clear Cart
                </button>
              </div>
            </div>

            {/* Order Summary */}
            <aside className="w-full lg:w-96 shrink-0 bg-white border border-gray-100 p-6">
              <h2 className="text-lg font-black uppercase tracking-tighter text-black mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({itemCount} items)</span>
                  <span className="font-bold text-black">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-bold text-black">
                    {shipping === 0 ? <span className="text-green-600">FREE</span> : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-gray-400">Free shipping on orders over $50</p>
                )}
                <div className="border-t border-gray-200 pt-3 flex justify-between text-black font-black text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full bg-black text-[#ccff00] py-4 text-sm font-black uppercase tracking-widest hover:bg-gray-900 transition-colors mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCheckingOut ? "Processing..." : "Checkout"}
              </button>

              <Link
                href="/dashboard/products"
                className="block w-full text-center border border-black text-black py-4 text-sm font-black uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
              >
                Continue Shopping
              </Link>

              {/* Trust badges */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <Truck size={16} className="text-black shrink-0" />
                  <span>Free delivery on orders over $50</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <Shield size={16} className="text-black shrink-0" />
                  <span>Secure payment. 100% encrypted.</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <CheckCircle size={16} className="text-black shrink-0" />
                  <span>100-day hassle-free returns</span>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
