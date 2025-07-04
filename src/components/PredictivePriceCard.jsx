"use client";
import { useState, useEffect } from "react";
import { FiActivity, FiTrendingUp, FiTrendingDown, FiMinus, FiInfo } from "react-icons/fi";

export default function PredictivePriceCard({ productUrl, currentPrice }) {
  const [predictionData, setPredictionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!productUrl) return;

    const fetchPrediction = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/predict-price?url=${encodeURIComponent(productUrl)}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch prediction');
        }
        
        setPredictionData(data);
      } catch (err) {
        console.error("Prediction error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPrediction();
  }, [productUrl]);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-3"></div>
          <div className="h-8 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !predictionData?.predictedPrice) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <FiActivity className="text-blue-500" /> Price Prediction
        </h3>
        <div className="text-center py-4">
          <FiInfo className="mx-auto text-gray-400 mb-2" size={24} />
          <p className="text-sm text-gray-500 mb-2">
            {error || "Unable to generate prediction"}
          </p>
          <p className="text-xs text-gray-400">
            Start tracking this product to get accurate predictions
          </p>
        </div>
      </div>
    );
  }

  const { 
    predictedPrice, 
    trend, 
    confidence, 
    currentPrice: apiCurrentPrice, 
    isMockPrediction,
    message 
  } = predictionData;
  const displayCurrentPrice = currentPrice || apiCurrentPrice;
  const priceDifference = predictedPrice - displayCurrentPrice;
  const percentageChange = ((priceDifference / displayCurrentPrice) * 100).toFixed(1);

  const getTrendIcon = () => {
    switch (trend) {
      case "increasing":
        return <FiTrendingUp className="text-red-500" />;
      case "decreasing":
        return <FiTrendingDown className="text-green-500" />;
      default:
        return <FiMinus className="text-gray-500" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case "increasing":
        return "text-red-500";
      case "decreasing":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  const getTrendMessage = () => {
    if (Math.abs(parseFloat(percentageChange)) < 1) {
      return "Price expected to remain stable";
    }
    return trend === "increasing" 
      ? "Price expected to increase" 
      : "Price expected to decrease";
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <FiActivity className="text-blue-500" /> Price Prediction
      </h3>
      
      <div className="space-y-4">
        {/* Predicted Price */}
        <div>
          <p className="text-3xl font-bold text-gray-900">
            ₹{predictedPrice.toLocaleString()}
          </p>
          <div className="flex items-center gap-2 mt-1">
            {getTrendIcon()}
            <span className={`text-sm font-medium ${getTrendColor()}`}>
              {priceDifference > 0 ? '+' : ''}₹{Math.abs(priceDifference).toFixed(0)} 
              ({priceDifference > 0 ? '+' : ''}{percentageChange}%)
            </span>
          </div>
        </div>

        {/* Trend Message */}
        <p className="text-sm text-gray-600">
          {getTrendMessage()}
        </p>

        {/* Confidence Level */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>Confidence Level</span>
            <span className="font-medium">{confidence}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${confidence}%` }}
            ></div>
          </div>
        </div>

        <p className="text-[11px] text-gray-400 mt-2">
          *Prediction based on historical data and market trends
        </p>
      </div>
    </div>
  );
}