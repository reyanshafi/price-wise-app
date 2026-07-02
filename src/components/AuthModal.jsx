"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiLoader, FiX } from "react-icons/fi";

export default function AuthModal({ isOpen, onClose, initialMode = "login" }) {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const { login, signup, loginWithGoogle } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await signup(email, password, displayName);
      }
      onClose();
      router.push("/analytics");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };



  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative bg-white w-full max-w-sm max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-4 sm:p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {mode === "login" ? "Welcome Back" : "Join PriceWise"}
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              {mode === "login" 
                ? "Sign in to access your analytics and saved alerts"
                : "Create an account to track your savings and get personalized insights"
              }
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base rounded-none"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base rounded-none"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-2 sm:py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base rounded-none"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 sm:py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base rounded-none"
            >
              {loading ? (
                <FiLoader className="animate-spin mr-2" />
              ) : null}
              {mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div className="mt-4 sm:mt-6 text-center">
            <p className="text-gray-600 text-sm sm:text-base">
              {mode === "login" ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
                className="ml-1 text-blue-600 hover:text-blue-700 font-semibold"
              >
                {mode === "login" ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>

          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-900 p-1 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
