"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import ProductCard from "@/components/ProductCard";
import PredictivePriceCard from "@/components/PredictivePriceCard";
import PriceTrendAnalysis from "@/components/PriceTrendAnalysis";
import Chatbot from "@/components/Chatbot";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/contexts/AuthContext";
import { AnalyticsService } from "@/services/analyticsService";
import {
  FiSearch,
  FiLoader,
  FiAlertCircle,
  FiTrendingUp,
  FiArrowLeft,
  FiHome,
  FiBarChart2,
  FiUser,
  FiLogOut,
  FiMenu,
  FiX,
  FiArrowRight,
  FiFilter,
  FiCheck,
} from "react-icons/fi";

function ComparePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("query");
  const { user, logout } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOption, setSortOption] = useState("bestMatch");
  const [predictedPrice, setPredictedPrice] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);
  
  // Filter state
  const [minPriceInput, setMinPriceInput] = useState("");
  const [maxPriceInput, setMaxPriceInput] = useState("");
  const [appliedMinPrice, setAppliedMinPrice] = useState(0);
  const [appliedMaxPrice, setAppliedMaxPrice] = useState(1000000);
  const [selectedRetailers, setSelectedRetailers] = useState([]);
  const [minDiscount, setMinDiscount] = useState(0);
  const [availableRetailers, setAvailableRetailers] = useState([]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      if (!query) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/fetch-products?query=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error(res.statusText);
        const data = await res.json();
        setProducts(data.results || []);
        
        // Track user search if logged in
        if (user && data.results) {
          await AnalyticsService.trackSearch(user.uid, query, data.results.length);
        }
        
        // Update filter limits based on fetched products
        if (data.results && data.results.length > 0) {
          const prices = data.results.map(p => p.price);
          const min = Math.min(...prices);
          const max = Math.max(...prices);
          setAppliedMinPrice(min);
          setAppliedMaxPrice(max);
          setMinPriceInput(min.toString());
          setMaxPriceInput(max.toString());

          const retailers = [...new Set(data.results.map(p => p.platform))];
          setAvailableRetailers(retailers);
          setSelectedRetailers(retailers);
        }
      } catch (err) {
        console.error("Failed to fetch products", err);
        setError("Failed to load products. Please try again.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timer);
  }, [query, user]);

  // Track price comparison when products are loaded
  useEffect(() => {
    const trackComparison = async () => {
      if (user && products.length > 0 && query) {
        await AnalyticsService.trackPriceComparison(user.uid, query, products);
      }
    };

    trackComparison();
  }, [products, user, query]);

  // Predict price using regression.js based on trend data
  useEffect(() => {
    const predictWithRegression = async () => {
      if (!products[0]?.link) return;

      try {
        const predictionRes = await fetch(`/api/predict-price?url=${encodeURIComponent(products[0].link)}`);
        const predictionData = await predictionRes.json();

        if (predictionData && predictionData.predictedPrice) {
          setPredictedPrice(predictionData.predictedPrice);
        } else {
          setPredictedPrice(null);
        }
      } catch (error) {
        console.error("Regression prediction failed:", error);
        setPredictedPrice(null);
      }
    };

    predictWithRegression();
  }, [products]);

  // Sorting logic
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortOption) {
      case "priceLowHigh":
        return a.price - b.price;
      case "priceHighLow":
        return b.price - a.price;
      case "rating":
        return (b.rating || 0) - (a.rating || 0);
      case "discount":
        const getDiscount = (p) => p.discount && p.discount !== "Check offers" ? parseInt(p.discount.match(/\d+/)?.[0] || 0) : 0;
        return getDiscount(b) - getDiscount(a);
      default:
        return 0;
    }
  });

  // Filter products by price range, retailers, and discount
  const filteredProducts = sortedProducts.filter(product => {
    const inPriceRange = product.price >= appliedMinPrice && product.price <= appliedMaxPrice;
    const isRetailerSelected = selectedRetailers.length === 0 || selectedRetailers.includes(product.platform);
    
    const pDiscount = product.discount && product.discount !== "Check offers" 
      ? parseInt(product.discount.match(/\d+/)?.[0] || 0) 
      : 0;
    const hasEnoughDiscount = pDiscount >= minDiscount;
    
    return inPriceRange && isRetailerSelected && hasEnoughDiscount;
  });

  const bestPrice = filteredProducts.length > 0 ? Math.min(...filteredProducts.map((p) => p.price)) : 0;

  return (
    <main className="min-h-screen bg-[var(--surface-2)]">
      {/* ── Navbar (mirrored from home page) ─────────────────────────────── */}
      <nav className="pw-navbar" style={{ position: 'relative', background: '#fff', borderBottom: '1px solid var(--border)' }}>
        <div className="pw-navbar-inner">
          <a href="/" className="pw-logo">
            <img src="/pricewise-logo.svg" alt="PriceWise" style={{ width: 110, height: "auto" }} />
          </a>
          <div className="pw-nav-actions">
            {user ? (
              <div className="relative">
                <div 
                  className="pw-user-pill cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <div className="pw-user-avatar">{user.displayName?.[0] || user.email?.[0]?.toUpperCase() || "U"}</div>
                  <span className="hidden sm:inline-block" style={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {user.displayName || user.email?.split("@")[0]}
                  </span>
                </div>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <a
                      href="/analytics"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <FiBarChart2 size={14} /> Analytics
                    </a>
                    <a
                      href="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <FiUser size={14} /> Settings
                    </a>
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

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <div className="mb-10 flex flex-col items-start border-b border-gray-200 pb-8">
          <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-900 mb-6 flex items-center gap-1 transition-colors">
            <FiArrowLeft size={14} /> Back to Search
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Prices for "{query}"
          </h1>
          <div className="flex items-center justify-between w-full">
            <p className="text-base text-gray-500">
              Scanned {products.length} retailers.
              {filteredProducts.length !== products.length && (
                <span> Showing {filteredProducts.length} in your price range.</span>
              )}
            </p>
            <button 
              className="md:hidden flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 text-sm font-medium border border-gray-200"
              onClick={() => setShowMobileFilters(true)}
            >
              <FiFilter size={16} /> Filters
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col md:flex-row gap-8 items-start relative">
          
          {/* Mobile Filter Overlay */}
          {showMobileFilters && (
            <div 
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setShowMobileFilters(false)}
            />
          )}

          {/* Left Sidebar (Filters) */}
          <aside className={`w-full md:w-72 flex-shrink-0 space-y-6 md:sticky md:top-6 fixed md:relative top-0 right-0 h-full md:h-auto bg-white z-50 md:z-0 transform transition-transform duration-300 md:transform-none overflow-y-auto md:overflow-visible shadow-2xl md:shadow-none p-6 md:p-0 ${showMobileFilters ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
            <div className="flex justify-between items-center md:hidden mb-6">
              <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider">Filters</h2>
              <button onClick={() => setShowMobileFilters(false)} className="text-gray-500 hover:text-gray-900">
                <FiX size={24} />
              </button>
            </div>

            <div className="bg-white md:p-5 md:border md:border-gray-200">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Filters & Sorting</h3>
              
              <div className="mb-6">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Search</label>
                <div className="flex items-center bg-gray-50 px-3 py-2 border border-gray-200">
                  <FiSearch className="text-gray-400 mr-2" />
                  <span className="text-gray-700 text-sm font-medium truncate">{query}</span>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Sort By</label>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="w-full bg-white px-3 py-2 border border-gray-200 text-sm text-gray-700 font-medium focus:ring-0 focus:border-blue-500 outline-none transition-colors appearance-none cursor-pointer"
                >
                  <option value="bestMatch">Best Match</option>
                  <option value="priceLowHigh">Price: Low to High</option>
                  <option value="priceHighLow">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                  <option value="discount">Highest Discount %</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Retailers</label>
                <div className="space-y-2">
                  {availableRetailers.map(retailer => (
                    <label key={retailer} className="flex items-center">
                      <input 
                        type="checkbox" 
                        checked={selectedRetailers.includes(retailer)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRetailers([...selectedRetailers, retailer]);
                          } else {
                            setSelectedRetailers(selectedRetailers.filter(r => r !== retailer));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 mr-2"
                      />
                      <span className="text-sm text-gray-700">{retailer}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Price Range</label>
                </div>
                
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1">
                    <input 
                      type="number" 
                      value={minPriceInput}
                      onChange={(e) => setMinPriceInput(e.target.value)}
                      placeholder="Min"
                      className="w-full bg-white px-3 py-2 border border-gray-200 text-sm text-gray-700 focus:ring-0 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <span className="text-gray-400">-</span>
                  <div className="flex-1">
                    <input 
                      type="number" 
                      value={maxPriceInput}
                      onChange={(e) => setMaxPriceInput(e.target.value)}
                      placeholder="Max"
                      className="w-full bg-white px-3 py-2 border border-gray-200 text-sm text-gray-700 focus:ring-0 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setAppliedMinPrice(Number(minPriceInput) || 0);
                    setAppliedMaxPrice(Number(maxPriceInput) || 1000000);
                  }}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-semibold py-2 px-4 transition-colors"
                >
                  Apply Filter
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Discount</label>
                <div className="space-y-2">
                  {[0, 10, 20, 50].map(discount => (
                    <label key={discount} className="flex items-center">
                      <input 
                        type="radio" 
                        name="discountFilter"
                        checked={minDiscount === discount}
                        onChange={() => setMinDiscount(discount)}
                        className="border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 mr-2"
                      />
                      <span className="text-sm text-gray-700">
                        {discount === 0 ? "All Items" : `${discount}% or more`}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Summary Cards directly in sidebar */}
            <div className="space-y-4">
              <div className="bg-white p-5 border border-gray-200 flex flex-col items-start">
                <span className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wider">Best Deal</span>
                <p className="text-2xl font-bold text-blue-600">₹{bestPrice.toLocaleString()}</p>
              </div>
              <div className="bg-white p-5 border border-gray-200 flex flex-col items-start">
                <span className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wider">Average Price</span>
                <p className="text-xl font-bold text-gray-900">
                  ₹{filteredProducts.length > 0 ? (
                    filteredProducts.reduce((sum, p) => sum + p.price, 0) / filteredProducts.length
                  ).toFixed(2) : '0'}
                </p>
              </div>
            </div>
          </aside>

          {/* Right Product Grid Area */}
          <div className="flex-1 min-w-0">
            {loading ? (
          <div className="flex justify-center items-center py-32">
            <FiLoader className="animate-spin text-4xl text-blue-400" />
            <span className="ml-4 text-2xl text-white">Scanning retailers...</span>
          </div>
        ) : error ? (
          <div className="text-center py-32">
            <FiAlertCircle className="text-5xl text-red-400 mx-auto mb-4" />
            <p className="text-2xl text-red-200">{error}</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <>
            {/* Product Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.slice(0, visibleCount).map((product) => (
                <ProductCard key={product.link} product={product} isBestDeal={product.price === bestPrice} />
              ))}
            </div>

            {/* Load More Button */}
            {visibleCount < filteredProducts.length && (
              <div className="mt-12 flex justify-center pb-12">
                <button
                  onClick={() => setVisibleCount(prev => prev + 12)}
                  className="bg-white border border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-800 font-semibold py-3 px-8 transition-colors duration-200"
                >
                  Load More Results
                </button>
              </div>
            )}


            {/* Detailed Trend Analysis */}
            {filteredProducts.length > 0 && (
              <div className="mt-12">
                <PriceTrendAnalysis productUrl={filteredProducts[0]?.link} />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-32 bg-white border border-gray-200">
            <FiSearch className="text-5xl text-gray-300 mb-4 mx-auto" />
            <p className="text-xl text-gray-500">
              No results found. Try a different query.
            </p>
          </div>
        )}
      </div>
      </div>
      </div>

      {/* Floating Action Buttons */}
      {/* AI Assistant */}
      <Chatbot />
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        initialMode="login"
      />
    </main>
  );
}

// Loading component for Suspense fallback
function LoadingFallback() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-950">
      <div className="relative z-10 container mx-auto px-6 py-16">
        <div className="flex justify-center items-center py-32">
          <FiLoader className="animate-spin text-4xl text-blue-400" />
          <span className="ml-4 text-2xl text-white">Loading...</span>
        </div>
      </div>
    </main>
  );
}

// Main component that wraps the content with Suspense
export default function ComparePageWrapper() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ComparePageContent />
    </Suspense>
  );
}