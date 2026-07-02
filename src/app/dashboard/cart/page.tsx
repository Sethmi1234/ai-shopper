"use client";

import Link from "next/link";
import Image from "next/image";
import useCart from "@/store/useCart";
import { ChevronRight, ShoppingCart, X, Minus, Plus, CreditCard, Truck, Shield, CheckCircle } from "lucide-react";

export default function CartPage() {
  const items = useCart((state) => state.items);
  const updateQuantity = useCart((state) => state.updateQuantity);
  const removeItem = useCart((state) => state.removeItem);
  const clearCart = useCart((state) => state.clearCart);

  const total = items.reduce((sum, item) => sum + item.quantity * Number(item.price || 0), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#f8f9fc] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
          <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
            <div className="flex items-center justify-between gap-4 mb-8">
              <div>
                <p className="text-sm text-gray-500">Shopping Cart</p>
                <h1 className="text-3xl font-bold text-gray-900">Your Cart</h1>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">{itemCount} items</p>
                <p className="text-lg font-semibold text-gray-900">${total.toFixed(2)}</p>
              </div>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-16">
                <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <ShoppingCart size={28} />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Your cart is empty</h2>
                <p className="mt-3 text-sm text-gray-500">
                  Add items from the products page and they will appear here.
                </p>
                <Link href="/dashboard/products" className="mt-6 inline-flex rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors">
                  Continue shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid gap-4">
                  {items.map((item) => (
                    <div key={item.id} className="grid grid-cols-[auto_1fr] gap-4 rounded-3xl border border-gray-100 bg-gray-50 p-4">
                      <div className="relative h-28 w-28 overflow-hidden rounded-3xl bg-white">
                        {item.thumbnail ? (
                          <Image src={item.thumbnail} alt={item.title} fill className="object-cover" unoptimized />
                        ) : (
                          <div className="h-full w-full bg-gray-200" />
                        )}
                      </div>
                      <div className="flex flex-col justify-between gap-4">
                        <div>
                          <h2 className="text-lg font-semibold text-gray-900">{item.title}</h2>
                          <p className="text-sm text-gray-500 capitalize">{item.category || "Product"}</p>
                          <p className="mt-3 text-base font-semibold text-gray-900">${Number(item.price).toFixed(2)}</p>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center rounded-full border border-gray-200 bg-white p-1 shadow-sm">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="h-9 w-9 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="mx-3 font-semibold text-gray-900">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="h-9 w-9 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <button
                              onClick={() => removeItem(item.id)}
                              className="font-semibold text-red-600 hover:text-red-700"
                            >
                              Remove
                            </button>
                            <span className="text-gray-400">|</span>
                            <span className="font-medium text-gray-800">Subtotal:</span>
                            <span className="font-semibold text-gray-900">${(item.quantity * Number(item.price)).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Order total</p>
                      <p className="text-3xl font-bold text-gray-900">${total.toFixed(2)}</p>
                    </div>
                    <button
                      onClick={() => clearCart()}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors"
                    >
                      <X size={16} /> Clear Cart
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <aside className="w-full max-w-md flex-shrink-0 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                <CreditCard size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Secure checkout</p>
                <h2 className="text-lg font-semibold text-gray-900">Ready to pay</h2>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="rounded-3xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center gap-3 text-gray-700 mb-3">
                  <Truck size={18} />
                  <p className="text-sm font-semibold">Free delivery</p>
                </div>
                <p className="text-sm text-gray-500">Orders over $50 ship free within the US.</p>
              </div>

              <div className="rounded-3xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center gap-3 text-gray-700 mb-3">
                  <Shield size={18} />
                  <p className="text-sm font-semibold">Secure payment</p>
                </div>
                <p className="text-sm text-gray-500">We use Stripe-level security for every payment.</p>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-blue-50 p-5">
              <p className="text-sm text-blue-700 font-semibold">Payment info</p>
              <p className="mt-3 text-sm text-gray-600">Enter your details on checkout to complete your purchase.</p>
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl bg-white p-3 border border-gray-200">
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Card</p>
                  <p className="mt-2 text-base font-semibold text-gray-900">**** **** **** 4242</p>
                </div>
                <div className="rounded-2xl bg-white p-3 border border-gray-200">
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Billing</p>
                  <p className="mt-2 text-base font-semibold text-gray-900">Use saved card during checkout</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={items.length === 0}
              className="mt-6 w-full rounded-full bg-blue-600 px-5 py-4 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {items.length === 0 ? "Cart empty" : "Proceed to Checkout"}
            </button>

            <div className="mt-6 rounded-3xl bg-green-50 p-4 text-sm text-green-700">
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle size={16} />
                <span>Instant payment preview</span>
              </div>
              <p className="mt-2 text-gray-600">No real payment is processed in this demo UI.</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
