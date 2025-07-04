"use client";
import { useState, useEffect } from "react";
import { FiBarChart2, FiTrendingUp, FiTrendingDown, FiActivity, FiCalendar } from "react-icons/fi";

export default function PriceTrendAnalysis({ productUrl }) {
  const [trendData, setTrendData] = useState(null);
  const [predictionData, setPredictionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!productUrl) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch both trend and prediction data
        const [trendResponse, predictionResponse] = await Promise.all([
          fetch(`/api/trend?productUrl=${encodeURIComponent(productUrl)}`),
          fetch(`/api/predict-price?url=${encodeURIComponent(productUrl)}`)
        ]);

        const [trendResult, predictionResult] = await Promise.all([
          trendResponse.json(),
          predictionResponse.json()
        ]);

        if (trendResponse.ok) {
          setTrendData(trendResult);
        }
        
        if (predictionResponse.ok) {
          setPredictionData(predictionResult);
        }
      } catch (err) {
        console.error("Error fetching trend analysis:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [productUrl]);

  if (loading) {
    return (
      <div className="bg-white/20 backdrop-blur-sm p-8 rounded-2xl border border-white/20 shadow-xl">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error || !trendData?.history?.length) {
    return (
      <div className="bg-white/20 backdrop-blur-sm p-8 rounded-2xl border border-white/20 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <FiBarChart2 className="text-blue-500" /> Price Trend Analysis
        </h3>
        <div className="text-center py-8">
          <FiActivity className="mx-auto text-gray-400 mb-2" size={32} />
          <p className="text-gray-500">No historical data available for trend analysis</p>
        </div>
      </div>
    );
  }

  const { history, title } = trendData;
  const currentPrice = history[history.length - 1]?.price;
  const firstPrice = history[0]?.price;
  const priceChange = currentPrice - firstPrice;
  const percentageChange = ((priceChange / firstPrice) * 100).toFixed(1);

  // Calculate price statistics
  const prices = history.map(h => h.price);
  const maxPrice = Math.max(...prices);
  const minPrice = Math.min(...prices);
  const avgPrice = (prices.reduce((sum, price) => sum + price, 0) / prices.length).toFixed(0);

  // Determine if it's a good time to buy
  const currentPercentile = ((currentPrice - minPrice) / (maxPrice - minPrice)) * 100;
  const isBuyingTime = currentPercentile < 30; // If current price is in bottom 30% of range

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <FiBarChart2 className="text-blue-300" /> Price Trend Analysis
      </h3>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-white/10 rounded-lg">
          <p className="text-xs text-blue-100 uppercase tracking-wider">Current</p>
          <p className="text-lg font-bold text-white">₹{currentPrice?.toLocaleString()}</p>
        </div>
        <div className="text-center p-3 bg-white/10 rounded-lg">
          <p className="text-xs text-blue-100 uppercase tracking-wider">Average</p>
          <p className="text-lg font-bold text-white">₹{parseInt(avgPrice).toLocaleString()}</p>
        </div>
        <div className="text-center p-3 bg-white/10 rounded-lg">
          <p className="text-xs text-blue-100 uppercase tracking-wider">Lowest</p>
          <p className="text-lg font-bold text-green-300">₹{minPrice?.toLocaleString()}</p>
        </div>
        <div className="text-center p-3 bg-white/10 rounded-lg">
          <p className="text-xs text-blue-100 uppercase tracking-wider">Highest</p>
          <p className="text-lg font-bold text-red-300">₹{maxPrice?.toLocaleString()}</p>
        </div>
      </div>

      {/* Trend Direction */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-blue-100">Overall Trend</span>
          <div className="flex items-center gap-2">
            {priceChange >= 0 ? (
              <FiTrendingUp className="text-red-300" />
            ) : (
              <FiTrendingDown className="text-green-300" />
            )}
            <span className={`text-sm font-bold ${priceChange >= 0 ? 'text-red-300' : 'text-green-300'}`}>
              {priceChange >= 0 ? '+' : ''}₹{Math.abs(priceChange).toFixed(0)} ({priceChange >= 0 ? '+' : ''}{percentageChange}%)
            </span>
          </div>
        </div>
        
        <div className="w-full bg-blue-100/30 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${priceChange >= 0 ? 'bg-red-300' : 'bg-green-300'}`}
            style={{ width: `${Math.min(Math.abs(parseFloat(percentageChange)), 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Buy Recommendation */}
      <div className={`p-4 rounded-lg border-l-4 ${isBuyingTime ? 'bg-green-200/10 border-green-300' : 'bg-yellow-200/10 border-yellow-300'}`}>
        <div className="flex items-center gap-2 mb-2">
          <FiActivity className={isBuyingTime ? 'text-green-300' : 'text-yellow-300'} />
          <span className={`font-semibold ${isBuyingTime ? 'text-green-100' : 'text-yellow-100'}`}>
            {isBuyingTime ? 'Good Time to Buy!' : 'Consider Waiting'}
          </span>
        </div>
        <p className={`text-sm ${isBuyingTime ? 'text-green-100' : 'text-yellow-100'}`}>
          {isBuyingTime 
            ? `Current price is ${(100 - currentPercentile).toFixed(0)}% below the historical peak`
            : `Current price is ${currentPercentile.toFixed(0)}% of the historical range`
          }
        </p>
      </div>

      {/* Prediction Summary */}
      {predictionData && (
        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-100">Next Period Prediction</span>
            <div className="text-right">
              <p className="text-lg font-bold text-purple-100">₹{predictionData.predictedPrice?.toLocaleString()}</p>
              <p className="text-xs text-blue-100/80">{predictionData.confidence}% confidence</p>
            </div>
          </div>
        </div>
      )}

      {/* Data Points */}
      <div className="mt-4 pt-4 border-t border-white/20 flex items-center gap-2 text-xs text-blue-100/80">
        <FiCalendar size={12} />
        <span>Based on {history.length} data points</span>
        {history.length > 0 && (
          <span>• Last updated {new Date(history[history.length - 1].timestamp).toLocaleDateString()}</span>
        )}
      </div>
    </div>
  );
}
