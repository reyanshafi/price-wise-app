"use client";
import { useState, useEffect } from "react";
import { FiExternalLink, FiTrendingUp, FiLoader, FiAlertCircle } from "react-icons/fi";
import { useAuth } from "@/contexts/AuthContext";
import { AnalyticsService } from "@/services/analyticsService";
import NotifyMeModal from "./NotifyMeModal";

export default function ProductCard({ product, isBestDeal }) {
  const { user } = useAuth();
  const [showPrediction, setShowPrediction] = useState(false);
  const [predictionData, setPredictionData] = useState(null);
  const [loadingPrediction, setLoadingPrediction] = useState(false);
  const [showNotifyMeModal, setShowNotifyMeModal] = useState(false);

  
  const {
    title,
    platform,
    price,
    image,
    link,
    shipping,
    discount,
    rating,
    originalPrice,
    coupon,
    taxNote,
    bankOffers,
    cashbackOffers,
  } = product;

  const shippingAmount = parseInt(shipping?.replace(/[^\d]/g, "")) || 0;
  const totalPrice = price + shippingAmount;
  const hasDiscount = discount && discount !== "Check offers";
  const discountPercentage = hasDiscount
    ? parseInt(discount.match(/\d+/)?.[0] || 0)
    : 0;

  // Track product view when component mounts
  useEffect(() => {
    const trackView = async () => {
      if (user && product) {
        await AnalyticsService.trackProductView(user.uid, {
          name: title,
          price: price,
          retailer: platform,
          link: link
        });
      }
    };

    trackView();
  }, [user, product, title, price, platform, link]);



  const fetchPrediction = async () => {
    if (predictionData) return;
    
    setLoadingPrediction(true);
    try {
      const response = await fetch(
        `/api/predict-price?url=${encodeURIComponent(link)}&currentPrice=${price}`
      );
      const data = await response.json();
      setPredictionData(data);
    } catch (error) {
      console.error("Failed to fetch prediction:", error);
      setPredictionData({ error: "Failed to load prediction" });
    } finally {
      setLoadingPrediction(false);
    }
  };

  const handlePredictionToggle = () => {
    setShowPrediction(!showPrediction);
    if (!showPrediction && !predictionData) {
      fetchPrediction();
    }
  };

  const handleNotifyMe = () => {
    setShowNotifyMeModal(true);
  };

  return (
    <div className="relative bg-white border border-gray-200 overflow-hidden flex flex-col h-full hover:border-blue-500 transition-colors duration-200">
      {/* Discount Ribbon */}
      {hasDiscount && (
        <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
          {discount}
        </div>
      )}

      {/* Product Image */}
      <div className="relative pt-[100%] bg-gray-50 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="absolute top-0 left-0 w-full h-full object-contain p-4"
          loading="lazy"
        />
      </div>

      {/* Product Info */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow">
        <div className="mb-3">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">
            {platform}
          </p>
          <h2 className="text-base font-semibold text-gray-900 line-clamp-2 leading-tight">
            {title}
          </h2>
        </div>

        {/* Rating */}
        {rating && (
          <div className="flex items-center mb-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-3 h-3 ${i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-xs text-gray-500 ml-1">{rating.toFixed(1)}</span>
          </div>
        )}

        {/* Pricing */}
        <div className="mt-auto">
          {originalPrice && (
            <p className="text-sm text-gray-400 line-through">₹{originalPrice.toLocaleString()}</p>
          )}

          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl font-bold text-gray-900">₹{price.toLocaleString()}</p>
            {hasDiscount && (
              <span className="text-sm font-medium bg-green-100 text-green-800 px-2 py-0.5 rounded">
                Save {discountPercentage}%
              </span>
            )}
          </div>

          {shippingAmount > 0 ? (
            <p className="text-sm text-orange-600 mt-1">
              + ₹{shippingAmount.toLocaleString()} shipping
            </p>
          ) : (
            <p className="text-sm text-green-600 mt-1">
              ✓ Free shipping
            </p>
          )}

          <div className="border-t border-gray-200 mt-4 pt-4">
            <p className="text-base font-semibold text-gray-800">
              Total: ₹{totalPrice.toLocaleString()}
            </p>
          </div>

          {/* Coupon & Tax Info */}
          {coupon && (
            <p className="text-xs text-blue-600 font-medium mt-1">{coupon}</p>
          )}
          {taxNote && (
            <p className="text-xs text-gray-500 mt-1">{taxNote}</p>
          )}

          {/* Cashback Offers */}
          {(cashbackOffers && cashbackOffers.length > 0) && (
            <div className="mt-2 p-2 bg-gradient-to-r from-green-50 to-blue-50 rounded border border-green-200">
              <p className="text-xs font-semibold text-green-800 mb-1">💰 Cashback Offers</p>
              {cashbackOffers.slice(0, 2).map((offer, index) => (
                <p key={index} className="text-xs text-green-700 mb-0.5">• {offer}</p>
              ))}
            </div>
          )}

          {/* Bank Offers */}
          {(bankOffers && bankOffers.length > 0) && (
            <div className="mt-2 p-2 bg-gradient-to-r from-orange-50 to-yellow-50 rounded border border-orange-200">
              <p className="text-xs font-semibold text-orange-800 mb-1">🏦 Bank Offers</p>
              {bankOffers.slice(0, 2).map((offer, index) => (
                <p key={index} className="text-xs text-orange-700 mb-0.5">• {offer}</p>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-5 space-y-3">
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={async () => {
              // Track potential purchase when user clicks "Buy Now"
              if (user) {
                await AnalyticsService.trackPurchase(user.uid, {
                  name: title,
                  price: price,
                  retailer: platform
                }, price);
              }
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-base font-medium py-3 px-4 rounded-none text-center transition-colors flex items-center justify-center gap-2"
          >
            <FiExternalLink size={16} />
            View on {platform}
          </a>
          
          <div className="grid grid-cols-2 gap-3">
            <button
            onClick={handlePredictionToggle}
            className="flex-1 flex items-center justify-center gap-1 bg-white border border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 font-medium text-sm py-3 px-3 transition-colors duration-200 rounded-none"
          >
            <FiTrendingUp className={showPrediction ? "text-blue-600" : "text-gray-400"} size={14} />
            {showPrediction ? 'Hide' : 'Predict'}
          </button>
          
            <button
              onClick={handleNotifyMe}
              className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium py-3 px-3 rounded-none text-center transition-colors flex items-center justify-center gap-1"
            >
              <FiAlertCircle size={14} />
              Notify Me
            </button>
          </div>
        </div>

        {/* Notify Me Modal */}
        <NotifyMeModal 
          isOpen={showNotifyMeModal} 
          onClose={() => setShowNotifyMeModal(false)} 
          product={product} 
        />

        {/* Price Prediction Section */}
        {showPrediction && (
          <div className="mt-3 p-3 bg-blue-50 rounded-md border border-blue-100">
            {loadingPrediction ? (
              <div className="text-center py-2">
                <FiLoader className="animate-spin mx-auto mb-1 text-blue-500" size={16} />
                <p className="text-xs text-blue-600">Loading prediction...</p>
              </div>
            ) : predictionData?.error ? (
              <div className="text-center">
                <p className="text-xs text-red-600">{predictionData.error}</p>
              </div>
            ) : predictionData ? (
              <div className="text-center">
                <h4 className="text-xs font-medium text-blue-800 mb-1 flex items-center justify-center gap-1">
                  <FiTrendingUp size={12} />
                  Price Prediction
                </h4>
                <div className="space-y-1">
                  <p className="text-base font-bold text-blue-900">
                    ₹{predictionData.predictedPrice?.toLocaleString()}
                  </p>
                  <div className="flex justify-between text-xs text-blue-700">
                    <span>Trend: {predictionData.trend}</span>
                    <span>Confidence: {predictionData.confidence}%</span>
                  </div>
                  {predictionData.isMockPrediction && (
                    <p className="text-xs text-yellow-700 bg-yellow-50 p-1 rounded mt-1">
                      Estimated prediction
                    </p>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}