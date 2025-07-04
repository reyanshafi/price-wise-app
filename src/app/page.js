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
  FiBell, 
  FiDollarSign,
  FiStar,
  FiZap,
  FiShield,
  FiUsers
} from "react-icons/fi";
import SetAlertForm from "@/components/SetAlertForm";

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    setIsLoading(true);
    const queryString = selectedCategory === "all" 
      ? encodeURIComponent(searchTerm.trim())
      : encodeURIComponent(`${searchTerm.trim()} ${selectedCategory}`);
    router.push(`/compare?query=${queryString}&category=${selectedCategory}`);
  };

  const popularSearches = [
    { term: 'iPhone 15 Pro Max', category: 'mobiles', trend: '+15%', displayCategory: 'Mobiles' },
    { term: 'Samsung Galaxy S24', category: 'mobiles', trend: '+8%', displayCategory: 'Mobiles' },
    { term: 'MacBook Air M3', category: 'laptops', trend: '+12%', displayCategory: 'Laptops' },
    { term: 'AirPods Pro 2', category: 'electronics', trend: '+6%', displayCategory: 'Electronics' },
    { term: 'PlayStation 5', category: 'gaming', trend: '+20%', displayCategory: 'Gaming' },
    { term: 'Nike Air Force 1', category: 'shoes', trend: '+4%', displayCategory: 'Shoes' }
  ];

  const categories = [
    { value: "all", label: "All Categories", icon: "🔍" },
    { value: "mobiles", label: "Mobiles & Tablets", icon: "📱" },
    { value: "laptops", label: "Laptops & Computers", icon: "💻" },
    { value: "electronics", label: "Electronics", icon: "🔌" },
    { value: "clothes", label: "Fashion & Clothing", icon: "👕" },
    { value: "shoes", label: "Shoes & Footwear", icon: "👟" },
    { value: "cases", label: "Cases & Covers", icon: "🛡️" },
    { value: "gaming", label: "Gaming", icon: "🎮" },
    { value: "home", label: "Home & Kitchen", icon: "🏠" },
    { value: "beauty", label: "Beauty & Personal Care", icon: "💄" }
  ];

  const features = [
    {
      icon: FiBarChart2,
      title: "AI Price Prediction",
      description: "Advanced machine learning models predict future prices with 95% accuracy",
      color: "bg-blue-500"
    },
    {
      icon: FiTrendingUp,
      title: "Real-time Tracking",
      description: "Monitor price changes across 50+ retailers in real-time",
      color: "bg-green-500"
    },
    {
      icon: FiBell,
      title: "Smart Alerts",
      description: "Get instant notifications when prices drop to your target",
      color: "bg-purple-500"
    },
    {
      icon: FiShield,
      title: "Price Protection",
      description: "We guarantee you'll find the best deals or we'll match them",
      color: "bg-orange-500"
    }
  ];

  const stats = [
    { value: "2M+", label: "Products Tracked", icon: FiShoppingCart },
    { value: "₹50L+", label: "Money Saved", icon: FiDollarSign },
    { value: "1M+", label: "Happy Users", icon: FiUsers },
    { value: "4.9", label: "User Rating", icon: FiStar }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-blue-900 to-indigo-900 opacity-95"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                           radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 40% 40%, rgba(120, 119, 198, 0.2) 0%, transparent 50%)`
        }}></div>
        
        <div className="relative z-10 container mx-auto px-6 py-20">
          {/* Navigation */}
          <nav className="flex items-center justify-between mb-16">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                <FiBarChart2 size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">PriceWise</h1>
                <p className="text-blue-100 text-sm">Smart Price Intelligence</p>
              </div>
            </div>
            <button
              onClick={() => setIsAlertOpen(true)}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-6 py-2 rounded-full border border-white/20 transition-all duration-300 flex items-center gap-2"
            >
              <FiBell size={16} />
              Price Alerts
            </button>
          </nav>

          {/* Hero Section */}
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8 border border-white/20">
              <FiZap className="text-yellow-300 mr-2" size={16} />
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
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 mb-12">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Category Selection */}
                <div className="mb-6">
                  <label className="block text-white text-sm font-medium mb-3">
                    Select Category
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {categories.map((category) => (
                      <button
                        key={category.value}
                        type="button"
                        onClick={() => setSelectedCategory(category.value)}
                        className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 flex flex-col items-center gap-2 ${
                          selectedCategory === category.value
                            ? 'bg-white text-blue-900 shadow-lg'
                            : 'bg-white/20 text-white hover:bg-white/30'
                        }`}
                      >
                        <span className="text-lg">{category.icon}</span>
                        <span className="text-xs text-center leading-tight">{category.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                    <FiSearch className="h-6 w-6 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder={selectedCategory === "all" 
                      ? "Search for any product... iPhone, Samsung, MacBook, Nike..."
                      : `Search in ${categories.find(c => c.value === selectedCategory)?.label}...`
                    }
                    className="w-full pl-14 pr-6 py-4 bg-white/90 backdrop-blur-sm border-0 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 text-lg shadow-xl"
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
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transform hover:-translate-y-1'
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
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="flex items-center justify-center mb-2">
                    <stat.icon className="text-white" size={24} />
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-blue-100 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose PriceWise?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powered by advanced AI and real-time data from India&apos;s largest retailers
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group hover:scale-105 transition-all duration-300">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl border border-gray-100">
                  <div className={`${feature.color} w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="text-white" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Products */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Trending Searches</h2>
            <p className="text-gray-600">Popular products our users are tracking right now</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularSearches.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  setSearchTerm(item.term);
                  setSelectedCategory(item.category);
                }}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 text-left group hover:scale-105 border border-gray-100"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    {item.displayCategory}
                  </span>
                  <span className="text-sm font-semibold text-green-600 flex items-center gap-1">
                    <FiTrendingUp size={14} />
                    {item.trend}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {item.term}
                </h3>
                <p className="text-sm text-gray-500 mt-1">Compare prices now →</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900 via-blue-900 to-indigo-900">
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
                className="bg-white text-blue-900 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 hover:cursor-pointer transition-all duration-300 shadow-xl"
              >
                Start Comparing Prices
              </button>
              <button
                onClick={() => setIsAlertOpen(true)}
                className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold text-lg hover:cursor-pointer hover:bg-white/20 transition-all duration-300 border border-white/20"
              >
                Set Price Alerts
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-blue-900 via-blue-900 to-indigo-900 text-white pt-12 pb-6 mt-0 border-t border-blue-800">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-3">
              <div className="bg-white/10 rounded-xl p-3">
                <FiBarChart2 size={24} className="text-blue-300" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">PriceWise</h3>
                <p className="text-blue-200 text-sm">Smart Price Intelligence</p>
              </div>
            </div>
            <div className="flex flex-col md:items-end items-center">
              <p className="text-blue-200 mb-1">Compare prices from 50+ retailers</p>
              <div className="w-32 h-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full mb-2 md:mb-1" />
              <p className="text-xs text-blue-100">© 2025 Team Bug Slayers. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Alert Modal */}
      {isAlertOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Set Price Alert</h3>
              <button
                onClick={() => setIsAlertOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ×
              </button>
            </div>
            <SetAlertForm onClose={() => setIsAlertOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}