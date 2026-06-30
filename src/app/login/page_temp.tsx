"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLogin } from "@/hooks/mutations/useLogin";

export default function LoginPage() {
  const router = useRouter();
  const { mutate, isPending, data, error } = useLogin();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("authData");
    document.cookie = "accessToken=; path=/; max-age=0";
    setIsLoggedIn(false);
  };

  const handleGoToDashboard = () => {
    router.push("/dashboard");
  };

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate(form);
  };

  if (isLoggedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Already Logged In</h2>
          <p className="text-gray-600 mb-6">You are already logged in. What would you like to do?</p>
          <div className="space-y-3">
            <button
              onClick={handleGoToDashboard}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
            >
              Go to Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="w-full py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }
