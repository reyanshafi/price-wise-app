"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiSearch, FiLoader, FiBarChart2, FiArrowRight } from "react-icons/fi";
import SetAlertForm from "@/components/SetAlertForm";

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    setIsLoading(true);
    router.push(`/compare?query=${encodeURIComponent(searchTerm.trim())}`);
  };

  const popularSearches = [
    'iPhone 15 Pro', 'AirPods Pro 2', 'PlayStation 5', 
    'MacBook Air M2', 'Nike Air Force 1', 'Samsung Galaxy S23',
    'Dyson Airwrap', 'Kindle Paperwhite'
  ];

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 px-4 py-12">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-1/4 w-32 h-32 bg-white rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-0 right-1/3 w-40 h-40 bg-indigo-400 rounded-full filter blur-3xl"></div>
          </div>
          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 flex items-center justify-center gap-3">
              <FiBarChart2 className="text-blue-300" size={42} />
              PriceWise
            </h1>
            <p className="text-blue-100 font-medium text-lg">
              Smart shopping starts with price comparison
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8 md:p-10">
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="product-search" className="block text-sm font-medium text-gray-700 mb-3">
                What product would you like to compare today?
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="product-search"
                  type="text"
                  placeholder="e.g., iPhone 15 Pro Max, Samsung Galaxy S23 Ultra, MacBook Air M2"
                  className="block w-full pl-10 pr-3 py-3.5 border border-gray-300 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={isLoading || !searchTerm.trim()}
                className={`flex-1 flex items-center justify-center gap-2 ${isLoading || !searchTerm.trim() ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg`}
              >
                {isLoading ? (
                  <>
                    <FiLoader className="animate-spin h-5 w-5" />
                    Searching...
                  </>
                ) : (
                  <>
                    Compare Prices
                    <FiArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsAlertOpen(true)}
                className="flex-1 py-3.5 px-6 border border-blue-600 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all duration-200 shadow-sm"
              >
                Set Price Alert
              </button>
            </div>
          </form>

          {/* Popular Searches */}
          <div className="mt-10">
            <h3 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wider">
              Trending Products
            </h3>
            <div className="flex flex-wrap gap-3">
              {popularSearches.map((item) => (
                <button
                  key={item}
                  onClick={() => setSearchTerm(item)}
                  className="text-sm px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all duration-150 flex items-center gap-1"
                >
                  <FiSearch className="text-gray-400" size={14} />
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Alert Form Modal */}
        {isAlertOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
              <SetAlertForm onClose={() => setIsAlertOpen(false)} />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 text-center text-sm text-gray-500 border-t border-gray-200">
          <p>Compare prices from 50+ retailers • 100% free service</p>
        </div>
      </div>
    </main>
  );
}