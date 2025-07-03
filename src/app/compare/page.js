"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import PredictivePriceCard from "@/components/PredictivePriceCard"; // New component
import {
  FiSearch,
  FiLoader,
  FiAlertCircle,
  FiTrendingUp,
  FiArrowLeft,
  FiHome,
} from "react-icons/fi";

export default function ComparePageWrapper() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("query");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOption, setSortOption] = useState("bestMatch");
  const [predictedPrice, setPredictedPrice] = useState(null);

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
        const trendRes = await fetch(`/api/trend?url=${encodeURIComponent(products[0].link)}`);
        const trendData = await trendRes.json();

        if (!trendData || !Array.isArray(trendData.trend)) return;

        // Format: [[0, price0], [1, price1], ...]
        const dataPoints = trendData.trend.map((price, index) => [index, price]);
        const result = regression.linear(dataPoints);
        const predicted = result.predict(dataPoints.length)[1]; // next day prediction

        setPredictedPrice(predicted);
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

  const bestPrice = products.length > 0 ? Math.min(...products.map((p) => p.price)) : 0;

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Navigation */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-700 hover:text-primary-600"
          >
            <FiArrowLeft /> <span className="font-medium">Back</span>
          </button>
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-gray-700 hover:text-primary-600"
          >
            <FiHome /> <span className="font-medium">Home</span>
          </button>
        </div>

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 font-sans">
            Comparing prices for{" "}
            <span className="text-primary-600 underline decoration-wavy decoration-primary-400/50">
              {query || "your search"}
            </span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
            We have scanned {products.length} retailers to find you the best deals
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
            <FiSearch className="text-gray-400 mr-2 text-lg" />
            <span className="text-gray-600 font-medium">{query}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 font-medium">Sort by:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 focus:ring-primary-500"
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
          <div className="flex justify-center items-center py-20">
            <FiLoader className="animate-spin text-3xl text-primary-500" />
            <span className="ml-4 text-lg text-gray-600">Scanning retailers...</span>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <FiAlertCircle className="text-4xl text-red-500 mx-auto mb-4" />
            <p className="text-lg text-red-600">{error}</p>
          </div>
        ) : sortedProducts.length > 0 ? (
          <>
            {/* Product Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedProducts.map((product) => (
                <ProductCard key={product.link} product={product} />
              ))}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-10">
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FiTrendingUp className="text-green-500" /> Best Deal
                </h3>
                <p className="text-3xl font-bold">₹{bestPrice.toLocaleString()}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <h3 className="text-lg font-semibold">Average Price</h3>
                <p className="text-3xl font-bold">
                  ₹
                  {(
                    products.reduce((sum, p) => sum + p.price, 0) / products.length
                  ).toFixed(2)}
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <h3 className="text-lg font-semibold">Price Range</h3>
                <p className="text-3xl font-bold">
                  ₹{Math.min(...products.map((p) => p.price)).toLocaleString()} - ₹
                  {Math.max(...products.map((p) => p.price)).toLocaleString()}
                </p>
              </div>
              <PredictivePriceCard predictedPrice={predictedPrice} />
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <FiSearch className="text-4xl text-gray-400 mb-4" />
            <p className="text-lg text-gray-600">
              No results found. Try a different query.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}