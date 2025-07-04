"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import PredictivePriceCard from "@/components/PredictivePriceCard";
import PriceTrendAnalysis from "@/components/PriceTrendAnalysis";
import CashbackComparison from "@/components/CashbackComparison";
import {
  FiSearch,
  FiLoader,
  FiAlertCircle,
  FiTrendingUp,
  FiArrowLeft,
  FiHome,
  FiBarChart2,
} from "react-icons/fi";

export default function ComparePageWrapper() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("query");
  const category = searchParams.get("category") || "all";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOption, setSortOption] = useState("bestMatch");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [predictedPrice, setPredictedPrice] = useState(null);

  // Category keywords for filtering
  const categoryKeywords = {
    mobiles: ['mobile', 'phone', 'smartphone', 'tablet', 'iphone', 'samsung', 'oneplus', 'xiaomi', 'oppo', 'vivo'],
    laptops: ['laptop', 'notebook', 'macbook', 'computer', 'pc', 'dell', 'hp', 'lenovo', 'asus'],
    electronics: ['headphone', 'earphone', 'speaker', 'camera', 'tv', 'watch', 'electronic'],
    clothes: ['shirt', 'pant', 'dress', 'jacket', 'clothing', 'apparel', 'fashion', 'wear'],
    shoes: ['shoe', 'sneaker', 'boot', 'sandal', 'footwear', 'nike', 'adidas', 'puma'],
    cases: ['case', 'cover', 'protector', 'sleeve', 'skin', 'shell'],
    gaming: ['gaming', 'game', 'console', 'playstation', 'xbox', 'controller', 'headset'],
    home: ['kitchen', 'home', 'appliance', 'furniture', 'decor'],
    beauty: ['beauty', 'cosmetic', 'skincare', 'makeup', 'perfume', 'cream']
  };

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
        const res = await fetch(`/api/fetch-products?query=${encodeURIComponent(query)}&category=${category}`);
        if (!res.ok) throw new Error(res.statusText);
        const data = await res.json();
        
        // Filter products based on category if not "all"
        let filteredProducts = data.results || [];
        if (category !== "all" && categoryKeywords[category]) {
          const keywords = categoryKeywords[category];
          filteredProducts = filteredProducts.filter(product => {
            const productText = `${product.title} ${product.platform}`.toLowerCase();
            return keywords.some(keyword => productText.includes(keyword.toLowerCase()));
          });
        }
        
        setProducts(filteredProducts);
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
  }, [query, category]);

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

  // Apply rating filter first
  const filteredByRating = products.filter(product => {
    if (ratingFilter === "all") return true;
    const productRating = product.rating || 0;
    switch (ratingFilter) {
      case "4plus":
        return productRating >= 4;
      case "3plus":
        return productRating >= 3;
      case "2plus":
        return productRating >= 2;
      case "1plus":
        return productRating >= 1;
      default:
        return true;
    }
  });

  // Sorting logic
  const sortedProducts = [...filteredByRating].sort((a, b) => {
    switch (sortOption) {
      case "priceLowHigh":
        return a.price - b.price;
      case "priceHighLow":
        return b.price - a.price;
      case "rating":
        return (b.rating || 0) - (a.rating || 0);
      case "cashback":
        // Sort by best cashback offer (extract percentage from first cashback offer)
        const getCashbackValue = (product) => {
          if (!product.cashbackOffers || product.cashbackOffers.length === 0) return 0;
          const match = product.cashbackOffers[0].match(/(\d+)%/);
          return match ? parseInt(match[1]) : 0;
        };
        return getCashbackValue(b) - getCashbackValue(a);
      default:
        return 0;
    }
  });

  // Calculate cashback analytics
  const getBestCashbackOffer = () => {
    if (!products.length) return null;
    let bestOffer = null;
    let bestValue = 0;
    
    products.forEach(product => {
      if (product.cashbackOffers && product.cashbackOffers.length > 0) {
        product.cashbackOffers.forEach(offer => {
          const match = offer.match(/(\d+)%/);
          if (match) {
            const value = parseInt(match[1]);
            if (value > bestValue) {
              bestValue = value;
              bestOffer = { ...product, bestCashback: offer };
            }
          }
        });
      }
    });
    
    return bestOffer;
  };

  const bestPrice = filteredByRating.length > 0 ? Math.min(...filteredByRating.map((p) => p.price)) : 0;
  const bestCashback = getBestCashbackOffer();

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
              <span className="text-yellow-100 text-sm font-semibold">
                {category !== "all" ? `${category.charAt(0).toUpperCase() + category.slice(1)} - ` : ""}Live Price Comparison
              </span>
            </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-yellow-50 mb-4 leading-tight">
            Compare <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Best Prices</span>
            <br />for <span className="text-yellow-200">{query || "your search"}</span>
          </h1>
          <p className="text-lg text-blue-100 mb-2 max-w-2xl mx-auto leading-relaxed">
            We scanned <span className="font-bold text-yellow-200">{products.length}</span> retailers to find you the best deals
            {category !== "all" && <span> in <strong>{category}</strong></span>}
            {ratingFilter !== "all" && <span> • Showing {ratingFilter === "4plus" ? "4+ star" : ratingFilter === "3plus" ? "3+ star" : ratingFilter === "2plus" ? "2+ star" : "1+ star"} products</span>}
          </p>
        </div>
        {/* Sort Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div className="flex items-center bg-blue-900 px-6 py-3 rounded-full border border-blue-800 shadow-sm">
            <FiSearch className="text-yellow-400 mr-2 text-lg" />
            <span className="text-yellow-100 font-semibold">{query}</span>
          </div>
          <div className="flex items-center gap-6">
            {/* Rating Filter */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-yellow-100 font-semibold">Rating:</span>
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="bg-blue-800 px-4 py-2 rounded-lg border border-blue-900 text-yellow-100 font-semibold focus:ring-2 focus:ring-yellow-400"
              >
                <option value="all">All Ratings</option>
                <option value="4plus">4+ Stars</option>
                <option value="3plus">3+ Stars</option>
                <option value="2plus">2+ Stars</option>
                <option value="1plus">1+ Stars</option>
              </select>
            </div>
            {/* Sort Filter */}
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
                <option value="cashback">Best Cashback</option>
              </select>
            </div>
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
        ) : sortedProducts.length > 0 ? (
          <>
            {/* Product Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {sortedProducts.map((product) => (
                <ProductCard key={product.link} product={product} />
              ))}
            </div>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mt-12">
              <div className="bg-blue-900 p-6 rounded-xl border border-blue-800 flex flex-col items-center">
                <span className="text-xs text-blue-200 mb-1">Best Deal</span>
                <p className="text-2xl font-bold text-yellow-100">₹{bestPrice.toLocaleString()}</p>
              </div>
              <div className="bg-blue-900 p-6 rounded-xl border border-blue-800 flex flex-col items-center">
                <span className="text-xs text-blue-200 mb-1">Average Price</span>
                <p className="text-2xl font-bold text-yellow-100">
                  ₹{filteredByRating.length > 0 ? (
                    filteredByRating.reduce((sum, p) => sum + p.price, 0) / filteredByRating.length
                  ).toFixed(2) : "0"}
                </p>
              </div>
              <div className="bg-blue-900 p-6 rounded-xl border border-blue-800 flex flex-col items-center">
                <span className="text-xs text-blue-200 mb-1">Best Cashback</span>
                {bestCashback ? (
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-300">{bestCashback.bestCashback?.match(/(\d+)%/)?.[1] || "N/A"}%</p>
                    <p className="text-xs text-blue-200">{bestCashback.platform}</p>
                  </div>
                ) : (
                  <p className="text-lg font-bold text-yellow-100">N/A</p>
                )}
              </div>
              <div className="bg-blue-900 p-6 rounded-xl border border-blue-800 flex flex-col items-center">
                <span className="text-xs text-blue-200 mb-1">Price Range</span>
                <p className="text-lg font-bold text-yellow-100">
                  {filteredByRating.length > 0 ? (
                    <>₹{Math.min(...filteredByRating.map((p) => p.price)).toLocaleString()} - ₹{Math.max(...filteredByRating.map((p) => p.price)).toLocaleString()}</>
                  ) : "N/A"}
                </p>
              </div>
              <div className="bg-blue-900 p-6 rounded-xl border border-blue-800 flex flex-col items-center">
                <span className="text-xs text-blue-200 mb-1">AI Prediction</span>
                <PredictivePriceCard 
                  productUrl={sortedProducts[0]?.link} 
                  currentPrice={sortedProducts[0]?.price}
                />
              </div>
            </div>
            {/* Cashback Comparison */}
            <CashbackComparison products={filteredByRating} />
            {/* Detailed Trend Analysis */}
            {sortedProducts.length > 0 && (
              <div className="mt-12">
                <PriceTrendAnalysis productUrl={sortedProducts[0]?.link} />
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
    </main>
  );
}
