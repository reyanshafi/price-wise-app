"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import ProductCard from "@/components/ProductCard";
import PredictivePriceCard from "@/components/PredictivePriceCard";
import PriceTrendAnalysis from "@/components/PriceTrendAnalysis";
import ShoppingAssistant from "@/components/ShoppingAssistant";
import {
  FiSearch,
  FiLoader,
  FiAlertCircle,
  FiTrendingUp,
  FiArrowLeft,
  FiHome,
  FiBarChart2,
} from "react-icons/fi";

function ComparePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("query");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOption, setSortOption] = useState("bestMatch");
  const [predictedPrice, setPredictedPrice] = useState(null);
  
  // Price range slider state
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [maxPrice, setMaxPrice] = useState(100000);
  const [minPrice, setMinPrice] = useState(0);

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
        
        // Update price range based on fetched products
        if (data.results && data.results.length > 0) {
          const prices = data.results.map(p => p.price);
          const min = Math.min(...prices);
          const max = Math.max(...prices);
          setMinPrice(min);
          setMaxPrice(max);
          setPriceRange([min, max]);
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
  }, [query]);

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
      default:
        return 0;
    }
  });

  // Filter products by price range
  const filteredProducts = sortedProducts.filter(product => 
    product.price >= priceRange[0] && product.price <= priceRange[1]
  );

  const bestPrice = filteredProducts.length > 0 ? Math.min(...filteredProducts.map((p) => p.price)) : 0;

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-950">
      <div className="relative z-10 container mx-auto px-6 py-16">
        {/* Navigation */}
        <nav className="flex items-center justify-between mb-12">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
              <FiBarChart2 size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">PriceWise</h1>
              <p className="text-blue-100 text-sm">Smart Price Intelligence</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.back()}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-6 py-2 rounded-full border border-white/20 transition-all duration-300 flex items-center gap-2"
            >
              <FiArrowLeft /> Back
            </button>
            <button
              onClick={() => router.push("/")}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-6 py-2 rounded-full border border-white/20 transition-all duration-300 flex items-center gap-2"
            >
              <FiHome /> Home
            </button>
          </div>
        </nav>

        {/* Header */}
        <div className="mb-10 text-center">
            <div className="inline-flex items-center bg-blue-800/80 rounded-full px-4 py-2 mb-6 border border-blue-900">
              <FiTrendingUp className="text-yellow-400 mr-2" size={16} />
              <span className="text-yellow-100 text-sm font-semibold">Live Price Comparison</span>
            </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-yellow-50 mb-4 leading-tight">
            Compare <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Best Prices</span>
            <br />for <span className="text-yellow-200">{query || "your search"}</span>
          </h1>
          <p className="text-lg text-blue-100 mb-2 max-w-2xl mx-auto leading-relaxed">
            We scanned <span className="font-bold text-yellow-200">{products.length}</span> retailers to find you the best deals
            {filteredProducts.length !== products.length && (
              <span className="block text-sm text-blue-200 mt-1">
                Showing <span className="font-bold text-yellow-200">{filteredProducts.length}</span> products in your price range
              </span>
            )}
          </p>
        </div>

        {/* Sort Controls and Price Range Slider */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
          <div className="flex items-center bg-blue-900 px-6 py-3 rounded-full border border-blue-800 shadow-sm">
            <FiSearch className="text-yellow-400 mr-2 text-lg" />
            <span className="text-yellow-100 font-semibold">{query}</span>
          </div>
          
          {/* Price Range Slider */}
          <div className="flex flex-col gap-3 bg-blue-900/50 backdrop-blur-sm p-4 rounded-xl border border-blue-800">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-yellow-100 font-semibold whitespace-nowrap">Price Range:</span>
              <div className="flex items-center gap-2">
                <div className="text-xs text-blue-200">
                  ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
                </div>
                {(priceRange[0] !== minPrice || priceRange[1] !== maxPrice) && (
                  <button
                    onClick={() => setPriceRange([minPrice, maxPrice])}
                    className="text-xs text-yellow-400 hover:text-yellow-300 underline"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-blue-300 min-w-[60px]">₹{minPrice.toLocaleString()}</span>
              <div className="relative flex-1 min-w-[200px]">
                {/* Min Price Slider */}
                <input
                  type="range"
                  min={minPrice}
                  max={maxPrice}
                  value={priceRange[0]}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (value <= priceRange[1]) {
                      setPriceRange([value, priceRange[1]]);
                    }
                  }}
                  className="absolute w-full h-2 bg-blue-700 rounded-lg appearance-none cursor-pointer slider-thumb-yellow"
                  style={{ zIndex: 1 }}
                />
                {/* Max Price Slider */}
                <input
                  type="range"
                  min={minPrice}
                  max={maxPrice}
                  value={priceRange[1]}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (value >= priceRange[0]) {
                      setPriceRange([priceRange[0], value]);
                    }
                  }}
                  className="absolute w-full h-2 bg-blue-700 rounded-lg appearance-none cursor-pointer slider-thumb-orange"
                  style={{ zIndex: 2 }}
                />
              </div>
              <span className="text-xs text-blue-300 min-w-[60px]">₹{maxPrice.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-yellow-100 font-semibold">Sort by:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="bg-blue-800 px-4 py-2 rounded-lg border border-blue-900 text-yellow-100 font-semibold focus:ring-2 focus:ring-yellow-400"
            >
              <option value="bestMatch">Best Match</option>
              <option value="priceLowHigh">Price: Low to High</option>
              <option value="priceHighLow">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {/* Product Grid or Messages */}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProducts.map((product) => (
                <ProductCard key={product.link} product={product} />
              ))}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
              <div className="bg-blue-900 p-6 rounded-xl border border-blue-800 flex flex-col items-center">
                <span className="text-xs text-blue-200 mb-1">Best Deal</span>
                <p className="text-2xl font-bold text-yellow-100">₹{bestPrice.toLocaleString()}</p>
              </div>
              <div className="bg-blue-900 p-6 rounded-xl border border-blue-800 flex flex-col items-center">
                <span className="text-xs text-blue-200 mb-1">Average Price</span>
                <p className="text-2xl font-bold text-yellow-100">
                  ₹{filteredProducts.length > 0 ? (
                    filteredProducts.reduce((sum, p) => sum + p.price, 0) / filteredProducts.length
                  ).toFixed(2) : '0'}
                </p>
              </div>
              <div className="bg-blue-900 p-6 rounded-xl border border-blue-800 flex flex-col items-center">
                <span className="text-xs text-blue-200 mb-1">Price Range</span>
                <p className="text-lg font-bold text-yellow-100">
                  {filteredProducts.length > 0 ? (
                    `₹${Math.min(...filteredProducts.map((p) => p.price)).toLocaleString()} - ₹${Math.max(...filteredProducts.map((p) => p.price)).toLocaleString()}`
                  ) : 'No products'}
                </p>
              </div>
              <div className="bg-blue-900 p-6 rounded-xl border border-blue-800 flex flex-col items-center">
                <span className="text-xs text-blue-200 mb-1">AI Prediction</span>
                <PredictivePriceCard 
                  productUrl={filteredProducts[0]?.link} 
                  currentPrice={filteredProducts[0]?.price}
                />
              </div>
            </div>

            {/* Detailed Trend Analysis */}
            {filteredProducts.length > 0 && (
              <div className="mt-12">
                <PriceTrendAnalysis productUrl={filteredProducts[0]?.link} />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-32">
            <FiSearch className="text-5xl text-white mb-4" />
            <p className="text-2xl text-blue-100">
              No results found. Try a different query.
            </p>
          </div>
        )}
      </div>

      {/* Floating Action Buttons */}
      <ShoppingAssistant />
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