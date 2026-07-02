"use client";
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FiSearch, FiLoader, FiBarChart2, FiArrowRight, FiTrendingUp,
  FiShoppingCart, FiDollarSign, FiStar, FiZap, FiShield,
  FiUsers, FiAlertCircle, FiSmartphone, FiMonitor, FiHeadphones,
  FiShoppingBag, FiHome, FiHeart, FiTruck, FiCoffee,
  FiUser, FiLogOut, FiBell,
} from "react-icons/fi";
import Chatbot from "@/components/Chatbot";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/contexts/AuthContext";
import { AnalyticsService } from "@/services/analyticsService";

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const { user, logout } = useAuth();

  // Navbar scroll effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setIsLoading(true);
    if (user) {
      try { await AnalyticsService.trackSearch(user.uid, searchTerm.trim(), 0); }
      catch (_) {}
    }
    router.push(`/compare?query=${encodeURIComponent(searchTerm.trim())}`);
  };

  const handleCategoryClick = async (category) => {
    setIsLoading(true);
    if (user) {
      try { await AnalyticsService.trackSearch(user.uid, category.searchTerm, 0); }
      catch (_) {}
    }
    router.push(`/compare?query=${encodeURIComponent(category.searchTerm)}`);
  };

  const categories = [
    { name: "Electronics", icon: FiSmartphone,  color: "#4a82ff", searchTerm: "smartphone" },
    { name: "Computers",   icon: FiMonitor,     color: "#7c5cfc", searchTerm: "laptop" },
    { name: "Audio",       icon: FiHeadphones,  color: "#16b998", searchTerm: "headphones" },
    { name: "Fashion",     icon: FiShoppingBag, color: "#f06292", searchTerm: "clothing" },
    { name: "Home",        icon: FiHome,        color: "#ef8c3a", searchTerm: "home appliances" },
    { name: "Beauty",      icon: FiHeart,       color: "#e8526a", searchTerm: "beauty products" },
    { name: "Sports",      icon: FiTruck,       color: "#26bfa5", searchTerm: "sports equipment" },
    { name: "Food",        icon: FiCoffee,      color: "#c4a14b", searchTerm: "food items" },
  ];

  const popularSearches = [
    { term: "iPhone 15 Pro Max",     category: "Electronics", trend: "+15%" },
    { term: "Samsung Galaxy S24",    category: "Electronics", trend: "+8%"  },
    { term: "MacBook Air M3",        category: "Laptops",     trend: "+12%" },
    { term: "AirPods Pro 2",         category: "Audio",       trend: "+6%"  },
    { term: "PlayStation 5",         category: "Gaming",      trend: "+20%" },
    { term: "Nike Air Force 1",      category: "Fashion",     trend: "+4%"  },
  ];

  const features = [
    { icon: FiBarChart2,   title: "AI Price Prediction",  desc: "ML models predict future prices with high accuracy across all major retailers.",       bg: "#eef3ff", color: "#4a82ff" },
    { icon: FiTrendingUp,  title: "Real-time Tracking",   desc: "Monitor price changes across 50+ retailers instantly as they happen.",                  bg: "#ecfdf5", color: "#16a34a" },
    { icon: FiBell,        title: "Smart Alerts",         desc: "Get notified the moment a product drops to your target price via email.",               bg: "#fdf4ff", color: "#9333ea" },
    { icon: FiShield,      title: "Price Protection",     desc: "Compare prices side-by-side and never pay more than you should.",                       bg: "#fff7ed", color: "#ea580c" },
  ];

  const stats = [
    { value: "2M+",   label: "Products Tracked" },
    { value: "₹50L+", label: "Money Saved" },
    { value: "1M+",   label: "Happy Users" },
    { value: "4.9★",  label: "User Rating" },
  ];

  const userInitial = user?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || "U";
  const userName = user?.displayName || user?.email?.split("@")[0] || "";

  return (
    <div style={{ minHeight: "100vh", background: "#fff" }}>

      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <nav className={`pw-navbar${scrolled ? " scrolled" : ""}`}>
        <div className="pw-navbar-inner">

          {/* Logo */}
          <Link href="/" className="pw-logo">
            <img src="/pricewise-logo.svg" alt="PriceWise" style={{ width: 110, height: "auto" }} />
          </Link>



          {/* Actions */}
          <div className="pw-nav-actions">
            {user ? (
              <div className="relative">
                <div 
                  className="pw-user-pill cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <div className="pw-user-avatar">{userInitial}</div>
                  <span className="hidden sm:inline-block" style={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {userName}
                  </span>
                </div>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <Link
                      href="/analytics"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <FiBarChart2 size={14} /> Analytics
                    </Link>
                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <FiUser size={14} /> Settings
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      onClick={logout}
                    >
                      <FiLogOut size={14} /> Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                className="btn btn-primary"
                onClick={() => setShowAuthModal(true)}
                style={{ padding: "10px 24px" }}
              >
                Get started
                <FiArrowRight size={15} style={{ marginLeft: 2 }} />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <div className="pw-hero-wrapper">
        <section className="pw-hero">

          {/* Badge */}
        <div className="pw-badge animate-fade-up">
          <FiZap size={13} />
          AI-Powered Price Intelligence
        </div>

        {/* Title */}
        <h1 className="pw-hero-title animate-fade-up anim-delay-1">
          Compare prices.<br />
          <span className="accent">Never overpay.</span>
        </h1>

        {/* Subtitle */}
        <p className="pw-hero-subtitle animate-fade-up anim-delay-2">
          Search any product and instantly compare prices across Amazon, Flipkart,
          Myntra, Nykaa and 20+ more — all in one place.
        </p>

        {/* Search */}
        <div className="pw-search-wrap animate-fade-up anim-delay-3">
          <form onSubmit={handleSubmit}>
            <div className="pw-search-box">
              <FiSearch className="pw-search-icon" size={18} />
              <input
                id="hero-search"
                type="text"
                className="pw-search-input"
                placeholder="Search for iPhone, Samsung, Nike shoes…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
              <button
                type="submit"
                className="pw-search-btn"
                disabled={isLoading || !searchTerm.trim()}
              >
                {isLoading ? (
                  <>
                    <FiLoader size={15} style={{ animation: "spin 1s linear infinite" }} />
                    Searching…
                  </>
                ) : (
                  <>
                    Compare prices
                    <FiArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          </form>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 10 }}>
            Try: &quot;iPhone 15&quot;, &quot;Samsung TV&quot;, &quot;Nike Air Max&quot;, &quot;boAt earbuds&quot;
          </p>
        </div>
        </section>

        {/* Marquee replacing stats row */}
        <div className="pw-marquee-container animate-fade-up anim-delay-4">
          <p className="pw-marquee-title">Compare Prices From Your Favorite Stores</p>
          <div className="pw-marquee-track">
            {/* First set */}
            <div className="pw-marquee-item flex items-center gap-3"><img src="https://www.google.com/s2/favicons?domain=amazon.in&sz=128" alt="Amazon" className="h-6 w-6 object-contain rounded-sm" /><span className="text-xl font-black tracking-widest text-gray-900">AMAZON</span></div>
            <div className="pw-marquee-item flex items-center gap-3"><img src="https://www.google.com/s2/favicons?domain=flipkart.com&sz=128" alt="Flipkart" className="h-6 w-6 object-contain rounded-sm" /><span className="text-xl font-black tracking-widest text-gray-900">FLIPKART</span></div>
            <div className="pw-marquee-item flex items-center gap-3"><img src="https://www.google.com/s2/favicons?domain=myntra.com&sz=128" alt="Myntra" className="h-6 w-6 object-contain rounded-sm" /><span className="text-xl font-black tracking-widest text-gray-900">MYNTRA</span></div>
            <div className="pw-marquee-item flex items-center gap-3"><img src="https://www.google.com/s2/favicons?domain=nykaa.com&sz=128" alt="Nykaa" className="h-6 w-6 object-contain rounded-sm" /><span className="text-xl font-black tracking-widest text-gray-900">NYKAA</span></div>
            <div className="pw-marquee-item flex items-center gap-3"><img src="https://www.google.com/s2/favicons?domain=reliancedigital.in&sz=128" alt="Reliance Digital" className="h-6 w-6 object-contain rounded-sm" /><span className="text-xl font-black tracking-widest text-gray-900">RELIANCE DIGITAL</span></div>
            <div className="pw-marquee-item flex items-center gap-3"><img src="https://www.google.com/s2/favicons?domain=croma.com&sz=128" alt="Croma" className="h-6 w-6 object-contain rounded-sm" /><span className="text-xl font-black tracking-widest text-gray-900">CROMA</span></div>
            <div className="pw-marquee-item flex items-center gap-3"><img src="https://www.google.com/s2/favicons?domain=ajio.com&sz=128" alt="Ajio" className="h-6 w-6 object-contain rounded-sm" /><span className="text-xl font-black tracking-widest text-gray-900">AJIO</span></div>
            <div className="pw-marquee-item flex items-center gap-3"><img src="https://www.google.com/s2/favicons?domain=tatacliq.com&sz=128" alt="Tata CLiQ" className="h-6 w-6 object-contain rounded-sm" /><span className="text-xl font-black tracking-widest text-gray-900">TATA CLiQ</span></div>
            
            {/* Duplicate set for seamless scrolling */}
            <div className="pw-marquee-item flex items-center gap-3"><img src="https://www.google.com/s2/favicons?domain=amazon.in&sz=128" alt="Amazon" className="h-6 w-6 object-contain rounded-sm" /><span className="text-xl font-black tracking-widest text-gray-900">AMAZON</span></div>
            <div className="pw-marquee-item flex items-center gap-3"><img src="https://www.google.com/s2/favicons?domain=flipkart.com&sz=128" alt="Flipkart" className="h-6 w-6 object-contain rounded-sm" /><span className="text-xl font-black tracking-widest text-gray-900">FLIPKART</span></div>
            <div className="pw-marquee-item flex items-center gap-3"><img src="https://www.google.com/s2/favicons?domain=myntra.com&sz=128" alt="Myntra" className="h-6 w-6 object-contain rounded-sm" /><span className="text-xl font-black tracking-widest text-gray-900">MYNTRA</span></div>
            <div className="pw-marquee-item flex items-center gap-3"><img src="https://www.google.com/s2/favicons?domain=nykaa.com&sz=128" alt="Nykaa" className="h-6 w-6 object-contain rounded-sm" /><span className="text-xl font-black tracking-widest text-gray-900">NYKAA</span></div>
            <div className="pw-marquee-item flex items-center gap-3"><img src="https://www.google.com/s2/favicons?domain=reliancedigital.in&sz=128" alt="Reliance Digital" className="h-6 w-6 object-contain rounded-sm" /><span className="text-xl font-black tracking-widest text-gray-900">RELIANCE DIGITAL</span></div>
            <div className="pw-marquee-item flex items-center gap-3"><img src="https://www.google.com/s2/favicons?domain=croma.com&sz=128" alt="Croma" className="h-6 w-6 object-contain rounded-sm" /><span className="text-xl font-black tracking-widest text-gray-900">CROMA</span></div>
            <div className="pw-marquee-item flex items-center gap-3"><img src="https://www.google.com/s2/favicons?domain=ajio.com&sz=128" alt="Ajio" className="h-6 w-6 object-contain rounded-sm" /><span className="text-xl font-black tracking-widest text-gray-900">AJIO</span></div>
            <div className="pw-marquee-item flex items-center gap-3"><img src="https://www.google.com/s2/favicons?domain=tatacliq.com&sz=128" alt="Tata CLiQ" className="h-6 w-6 object-contain rounded-sm" /><span className="text-xl font-black tracking-widest text-gray-900">TATA CLiQ</span></div>
          </div>
        </div>
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="pw-footer" style={{ borderTop: "1px solid var(--border)", padding: "24px 0", textAlign: "center" }}>
        <p className="pw-footer-copy" style={{ margin: 0, fontSize: 13 }}>
          Developed by Rayan Shafi
        </p>
      </footer>

      {/* Chatbot */}
      <Chatbot />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode="login"
      />
    </div>
  );
}
