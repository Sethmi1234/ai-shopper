"use client";

import Link from "next/link";
import { Loader2, ChevronRight, User, Mail, Shield } from "lucide-react";
import { useAuthUser } from "../../../hooks/useAuthUser";

export default function ProfilePage() {
  const { data: response, isLoading, error } = useAuthUser();

  // Extract user from response (backend returns { user: { id, name, email } })
  const user = response?.user || response;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-black" size={44} />
          <p className="text-gray-400 text-sm">Loading profile…</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 font-medium text-lg">Failed to load profile.</p>
          <Link
            href="/dashboard"
            className="mt-4 inline-block text-black underline text-sm"
          >
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  const displayName = user.name || user.firstName || user.username || "User";

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <nav className="flex items-center gap-2 text-gray-400 text-sm mb-6">
            <Link href="/dashboard" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight size={14} />
            <span className="text-white font-medium">My Profile</span>
          </nav>

          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white/30 overflow-hidden bg-white/10 shrink-0">
              <div className="w-full h-full flex items-center justify-center text-white/70">
                <User size={40} />
              </div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {displayName}
              </h1>
              <p className="text-gray-400 text-sm mt-1">{user.email || ""}</p>
              <p className="text-gray-500 text-xs mt-1 capitalize">Member</p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Personal Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Details Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                <User size={18} className="text-black" />
                Personal Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Name</p>
                  <p className="text-sm font-medium text-gray-900">{user.name || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Email</p>
                  <p className="text-sm font-medium text-gray-900">{user.email || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">User ID</p>
                  <p className="text-sm font-mono font-medium text-gray-900">{user.id || user._id || "—"}</p>
                </div>
              </div>
            </div>

            {/* Contact Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                <Mail size={18} className="text-black" />
                Contact Information
              </h2>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                    <Mail size={16} className="text-black" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900">{user.email || "—"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Account Info Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                <Shield size={18} className="text-black" />
                Account Info
              </h2>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                    <User size={16} className="text-black" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">User ID</p>
                    <p className="text-sm font-mono font-medium text-gray-900">#{user.id || user._id || "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                    <Shield size={16} className="text-black" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Role</p>
                    <p className="text-sm font-medium text-gray-900 capitalize">Member</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}