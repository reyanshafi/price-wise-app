"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  FiSearch, 
  FiLoader, 
  FiBarChart2, 
  FiArrowRight, 
  FiTrendingUp, 
  FiShoppingCart, 
  FiDollarSign,
  FiStar,
  FiZap,
  FiShield,
  FiUsers,
  FiAlertCircle,
  FiSmartphone,
  FiMonitor,
  FiHeadphones,
  FiShoppingBag,
  FiHome,
  FiHeart,
  FiTruck,
  FiCoffee,
  FiUser,
  FiLogOut
} from "react-icons/fi";
import ProductCard from "@/components/ProductCard";
import ShoppingAssistant from "@/components/ShoppingAssistant";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/contexts/AuthContext";
import { AnalyticsService } from "@/services/analyticsService";

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    setIsLoading(true);
    
    // Track search if user is logged in
    if (user) {
      try {
        await AnalyticsService.trackSearch(user.uid, searchTerm.trim(), 0);
      } catch (error) {
        console.error('Error tracking search:', error);
      }
    }
    
    router.push(`/compare?query=${encodeURIComponent(searchTerm.trim())}`);
  };

  const categories = [
    { name: 'Electronics', icon: FiSmartphone, color: 'bg-gradient-to-r from-blue-500 to-blue-600', searchTerm: 'smartphone' },
    { name: 'Computers', icon: FiMonitor, color: 'bg-gradient-to-r from-purple-500 to-purple-600', searchTerm: 'laptop' },
    { name: 'Audio', icon: FiHeadphones, color: 'bg-gradient-to-r from-green-500 to-green-600', searchTerm: 'headphones' },
    { name: 'Fashion', icon: FiShoppingBag, color: 'bg-gradient-to-r from-pink-500 to-pink-600', searchTerm: 'clothing' },
    { name: 'Home & Garden', icon: FiHome, color: 'bg-gradient-to-r from-orange-500 to-orange-600', searchTerm: 'home appliances' },
    { name: 'Health & Beauty', icon: FiHeart, color: 'bg-gradient-to-r from-red-500 to-red-600', searchTerm: 'beauty products' },
    { name: 'Sports & Outdoors', icon: FiTruck, color: 'bg-gradient-to-r from-teal-500 to-teal-600', searchTerm: 'sports equipment' },
    { name: 'Food & Beverages', icon: FiCoffee, color: 'bg-gradient-to-r from-yellow-500 to-yellow-600', searchTerm: 'food items' }
  ];

  const handleCategoryClick = async (category) => {
    setSearchTerm(category.searchTerm);
    setIsLoading(true);
    
    // Track category search if user is logged in
    if (user) {
      try {
        await AnalyticsService.trackSearch(user.uid, category.searchTerm, 0);
      } catch (error) {
        console.error('Error tracking category search:', error);
      }
    }
    
    router.push(`/compare?query=${encodeURIComponent(category.searchTerm)}`);
  };

  const popularSearches = [
    { term: 'iPhone 15 Pro Max', category: 'Electronics', trend: '+15%' },
    { term: 'Samsung Galaxy S24', category: 'Electronics', trend: '+8%' },
    { term: 'MacBook Air M3', category: 'Laptops', trend: '+12%' },
    { term: 'AirPods Pro 2', category: 'Audio', trend: '+6%' },
    { term: 'PlayStation 5', category: 'Gaming', trend: '+20%' },
    { term: 'Nike Air Force 1', category: 'Fashion', trend: '+4%' }
  ];

  const features = [
    {
      icon: FiBarChart2,
      title: "AI Price Prediction",
      description: "Advanced machine learning models predict future prices with 95% accuracy",
      color: "bg-gradient-to-r from-blue-500 to-blue-600"
    },
    {
      icon: FiTrendingUp,
      title: "Real-time Tracking",
      description: "Monitor price changes across 50+ retailers in real-time",
      color: "bg-gradient-to-r from-emerald-500 to-emerald-600"
    },
    {
      icon: FiAlertCircle,
      title: "Smart Alerts",
      description: "Get instant notifications when prices drop to your target",
      color: "bg-gradient-to-r from-purple-500 to-purple-600"
    },
    {
      icon: FiShield,
      title: "Price Protection",
      description: "We guarantee you'll find the best deals or we'll match them",
      color: "bg-gradient-to-r from-amber-500 to-amber-600"
    }
  ];

  const stats = [
    { value: "2M+", label: "Products Tracked", icon: FiShoppingCart, color: "text-blue-600" },
    { value: "₹50L+", label: "Money Saved", icon: FiDollarSign, color: "text-emerald-600" },
    { value: "1M+", label: "Happy Users", icon: FiUsers, color: "text-purple-600" },
    { value: "4.9", label: "User  Rating", icon: FiStar, color: "text-amber-600" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-gray-900"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-20"> 
          <div className="absolute top-10 left-20 w-64 h-64 bg-white rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-40 right-32 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-6 py-20">
          {/* Navigation */}
          <nav className="flex items-center justify-between mb-12 sm:mb-16">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2 sm:p-3 shadow-lg">
                <FiBarChart2 size={24} className="text-white sm:w-7 sm:h-7" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">PriceWise</h1>
                <p className="text-blue-100 text-xs sm:text-sm font-medium">Smart Price Intelligence</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3">
              {user ? (
                <>
                  <button
                    onClick={() => router.push("/analytics")}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 sm:px-6 py-2 rounded-full border border-yellow-500 transition-all duration-300 flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
                  >
                    <FiBarChart2 size={16} className="sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Analytics</span>
                  </button>
                  <div className="hidden md:flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full border border-white/20">
                    <FiUser className="text-white" size={16} />
                    <span className="text-white text-sm">{user.displayName || user.email}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 sm:px-4 py-2 rounded-full border border-red-500 transition-all duration-300 flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
                  >
                    <FiLogOut size={16} className="sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 sm:px-6 py-2 rounded-full border border-yellow-500 transition-all duration-300 flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
                >
                  <FiUser size={16} className="sm:w-4 sm:h-4" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </nav>

          {/* Hero Section */}
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8 border border-white/20 shadow-sm">
              <FiZap className="text-yellow-300 mr-2 animate-pulse" size={16} />
              <span className="text-white text-sm font-medium">AI-Powered Price Prediction</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Find the{" "}
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Perfect Price
              </span>
              <br />
              Before You Buy
            </h1>
            
            <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto leading-relaxed">
              Compare prices across India&apos;s top retailers, predict future prices with AI, 
              and never overpay again. Save up to 40% on every purchase.
            </p>

            {/* Search Section */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 mb-12 shadow-xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                    <FiSearch className="h-6 w-6 text-blue-200" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search for any product... iPhone, Samsung, MacBook, Nike..."
                    className="w-full pl-14 pr-6 py-4 bg-white/90 backdrop-blur-sm border-0 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-lg shadow-lg transition-all duration-300 hover:shadow-xl"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    type="submit"
                    disabled={isLoading || !searchTerm.trim()}
                    className={`flex-1 flex items-center justify-center gap-3 py-4 px-8 rounded-xl font-semibold text-lg transition-all duration-300 ${
                      isLoading || !searchTerm.trim()
                        ? 'bg-gray-400 cursor-not-allowed text-white'
                        : 'bg-gradient-to-r from-orange-600 to-orange-800 hover:from-orange-700 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <FiLoader className="animate-spin h-6 w-6" />
                        Finding Best Prices...
                      </>
                    ) : (
                      <>
                        <FiSearch className="h-6 w-6" />
                        Compare Prices Now
                        <FiArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 hover:shadow-lg">
                  <div className={`flex items-center justify-center mb-2 ${stat.color}`}>
                    <stat.icon size={24} />
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-blue-100 text-sm font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Categories Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-block bg-blue-50 rounded-full px-4 py-2 mb-4">
              <span className="text-blue-600 font-medium">Shop by Category</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Find What You&apos;re Looking For
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Browse through our most popular categories and discover the best deals
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories.map((category, index) => (
              <button
                key={index}
                onClick={() => handleCategoryClick(category)}
                className="group p-6 bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-300 hover:-translate-y-2 hover:scale-105"
              >
                <div className={`${category.color} w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-white mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <category.icon size={20} />
                </div>
                <h3 className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                  {category.name}
                </h3>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-block bg-blue-50 rounded-full px-4 py-2 mb-4">
              <span className="text-blue-600 font-medium">Why Choose PriceWise?</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Why Choose PriceWise?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powered by advanced AI and real-time data from India&apos;s largest retailers
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group hover:scale-105 transition-all duration-300">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl border border-gray-200">
                  <div className={`${feature.color} w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="text-white" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Products */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-block bg-blue-50 rounded-full px-4 py-2 mb-4">
              <span className="text-blue-600 font-medium">Trending Now</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Trending Searches</h2>
            <p className="text-gray-600">Popular products our users are tracking right now</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularSearches.map((item, index) => (
              <button
                key={index}
                onClick={() => setSearchTerm(item.term)}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 text-left group hover:scale-105 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    {item.category}
                  </span>
                  <span className="text-sm font-semibold text-green-600 flex items-center gap-1">
                    <FiTrendingUp size={14} />
                    {item.trend}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                  {item.term}
                </h3>
                <p className="text-sm text-gray-500 mt-1">Compare prices now →</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-6">
              Start Saving Money Today
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join millions of smart shoppers who use PriceWise to find the best deals
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => document.querySelector('input').focus()}
                className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 hover:shadow-lg transition-all duration-300 shadow-md hover:-translate-y-0.5"
              >
                Start Comparing Prices
              </button>
              {/* <button className="bg-transparent border-2 border-white/30 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 hover:border-white/50 transition-all duration-300 shadow-md hover:-translate-y-0.5">
                Learn How It Works
              </button> */}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-12 pb-6">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 rounded-xl p-3 shadow-sm">
                <FiBarChart2 size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">PriceWise</h3>
                <p className="text-gray-300 text-sm font-medium">Smart Price Intelligence</p>
              </div>
            </div>
            <div className="flex flex-col md:items-end items-center">
              <p className="text-gray-300 mb-1 font-medium">Compare prices from 50+ retailers</p>
              <div className="w-32 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mb-2 md:mb-1" />
              <p className="text-xs text-gray-400">© 2025 Team Bug Slayers. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Action Buttons */}
      <ShoppingAssistant />
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        initialMode="login"
      />
    </div>
  );
}
