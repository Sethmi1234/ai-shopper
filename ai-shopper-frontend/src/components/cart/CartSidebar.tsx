"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import useCart, { CartItem } from "../../store/useCart";
import { X, ShoppingCart } from "lucide-react";

export default function CartSidebar() {
  const items = useCart((s: any) => s.items);
  const removeItem = useCart((s: any) => s.removeItem);
  const updateQuantity = useCart((s: any) => s.updateQuantity);
  const clearCart = useCart((s: any) => s.clearCart);

  const total = items.reduce((sum: number, i: any) => sum + i.quantity * Number(i.price || 0), 0);

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

  if (!items.length) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3">
          <ShoppingCart size={20} className="text-blue-600" />
          <h3 className="text-lg font-semibold">Your cart</h3>
        </div>
        <p className="mt-4 text-sm text-gray-500">Your cart is empty.</p>
        <Link href="/dashboard/products" className="mt-4 inline-block text-blue-600">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Cart ({items.reduce((s: number, i: any) => s + i.quantity, 0)})</h3>
        <button onClick={handleClearCart} className="text-sm text-red-500">
          Clear
        </button>
      </div>

      <div className="space-y-3">
        {items.map((it: CartItem) => (
          <div key={it.id} className="flex items-center gap-3">
            <div className="relative w-14 h-14 rounded-md overflow-hidden bg-gray-100">
              {it.thumbnail ? (
                <Image src={it.thumbnail} alt={it.title} fill className="object-cover" unoptimized />
              ) : (
                <div className="w-full h-full bg-gray-200" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium truncate">{it.title}</h4>
              <p className="text-xs text-gray-500">${Number(it.price).toFixed(2)}</p>
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => handleUpdateQuantity(it.id, it.quantity - 1)}
                  className="px-2 py-1 rounded-md border text-sm"
                >
                  -
                </button>
                <span className="text-sm">{it.quantity}</span>
                <button
                  onClick={() => handleUpdateQuantity(it.id, it.quantity + 1)}
                  className="px-2 py-1 rounded-md border text-sm"
                >
                  +
                </button>
                <button onClick={() => handleRemoveItem(it.id)} className="ml-2 text-sm text-red-500">
                  <X size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 border-t pt-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-lg font-bold">${total.toFixed(2)}</p>
        </div>
        <div className="flex flex-col gap-2">
          <Link href="/dashboard/cart" className="px-4 py-2 rounded-full bg-blue-600 text-white text-center text-sm">
            Checkout
          </Link>
          <Link href="/dashboard/products" className="text-sm text-blue-600 text-center">
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
