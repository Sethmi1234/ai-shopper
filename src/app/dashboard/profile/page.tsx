"use client";

import Link from "next/link";
import Image from "next/image";
import { Loader2, ChevronRight, User, Mail, Phone, Calendar, MapPin, Globe, Shield, Tag } from "lucide-react";
import { useAuthUser } from "@/hooks/useAuthUser";

export default function ProfilePage() {
  const { data: user, isLoading, error } = useAuthUser();

  console.log("Auth user data:", user);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-blue-600" size={44} />
          <p className="text-gray-400 text-sm">Loading profile…</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 font-medium text-lg">Failed to load profile.</p>
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

  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username;

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <nav className="flex items-center gap-2 text-blue-200 text-sm mb-6">
            <Link href="/dashboard" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight size={14} />
            <span className="text-white font-medium">My Profile</span>
          </nav>

          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white/30 overflow-hidden bg-white/10 shrink-0">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={fullName}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/70">
                  <User size={40} />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {fullName}
              </h1>
              <p className="text-blue-200 text-sm mt-1">@{user.username}</p>
              <p className="text-blue-200/70 text-xs mt-1 capitalize">{user.role || "Member"}</p>
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
                <User size={18} className="text-blue-600" />
                Personal Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">First Name</p>
                  <p className="text-sm font-medium text-gray-900">{user.firstName || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Last Name</p>
                  <p className="text-sm font-medium text-gray-900">{user.lastName || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Username</p>
                  <p className="text-sm font-medium text-gray-900">@{user.username}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Gender</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">{user.gender || "—"}</p>
                </div>
              </div>
            </div>

            {/* Contact Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                <Mail size={18} className="text-blue-600" />
                Contact Information
              </h2>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <Mail size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900">{user.email || "—"}</p>
                  </div>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                      <Phone size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-sm font-medium text-gray-900">{user.phone}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Address Card */}
            {(user.address || user.company?.address) && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <MapPin size={18} className="text-blue-600" />
                  Address
                </h2>

                <div className="space-y-4">
                  {user.address && (
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin size={16} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Address</p>
                        <p className="text-sm font-medium text-gray-900">
                          {[
                            user.address.address,
                            user.address.city,
                            user.address.state,
                            user.address.postalCode,
                          ]
                            .filter(Boolean)
                            .join(", ") || "—"}
                        </p>
                      </div>
                    </div>
                  )}
                  {user.company?.address && (
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-purple-50 flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin size={16} className="text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Company Address</p>
                        <p className="text-sm font-medium text-gray-900">
                          {[
                            user.company.address.address,
                            user.company.address.city,
                            user.company.address.state,
                            user.company.address.postalCode,
                          ]
                            .filter(Boolean)
                            .join(", ") || "—"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Account Info Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                <Shield size={18} className="text-blue-600" />
                Account Info
              </h2>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <Tag size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">User ID</p>
                    <p className="text-sm font-mono font-medium text-gray-900">#{user.id}</p>
                  </div>
                </div>
                {user.role && (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                      <Shield size={16} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Role</p>
                      <p className="text-sm font-medium text-gray-900 capitalize">{user.role}</p>
                    </div>
                  </div>
                )}
                {user.birthDate && (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                      <Calendar size={16} className="text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Birth Date</p>
                      <p className="text-sm font-medium text-gray-900">{new Date(user.birthDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Company Card */}
            {user.company && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <Globe size={18} className="text-blue-600" />
                  Company
                </h2>

                <div className="space-y-4">
                  {user.company.name && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Company Name</p>
                      <p className="text-sm font-medium text-gray-900">{user.company.name}</p>
                    </div>
                  )}
                  {user.company.title && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Title</p>
                      <p className="text-sm font-medium text-gray-900">{user.company.title}</p>
                    </div>
                  )}
                  {user.company.department && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Department</p>
                      <p className="text-sm font-medium text-gray-900">{user.company.department}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bank Card */}
            {user.bank && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-5">Bank Details</h2>

                <div className="space-y-3">
                  {user.bank.cardNumber && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Card Number</p>
                      <p className="text-sm font-mono font-medium text-gray-900">
                        •••• {user.bank.cardNumber.slice(-4)}
                      </p>
                    </div>
                  )}
                  {user.bank.cardType && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Card Type</p>
                      <p className="text-sm font-medium text-gray-900 capitalize">{user.bank.cardType}</p>
                    </div>
                  )}
                  {user.bank.iban && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">IBAN</p>
                      <p className="text-sm font-mono text-gray-900 truncate">{user.bank.iban}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}