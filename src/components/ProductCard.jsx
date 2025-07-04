"use client";
import { useState } from "react";
import { FiExternalLink, FiTrendingUp, FiLoader, FiBell, FiX } from "react-icons/fi";

export default function ProductCard({ product }) {
  const [showPrediction, setShowPrediction] = useState(false);
  const [predictionData, setPredictionData] = useState(null);
  const [loadingPrediction, setLoadingPrediction] = useState(false);
  const [showNotifyMe, setShowNotifyMe] = useState(false);
  const [notifyData, setNotifyData] = useState({
    email: '',
    targetPrice: ''
  });
  const [notifyLoading, setNotifyLoading] = useState(false);
  const [notifySuccess, setNotifySuccess] = useState(false);
  
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
    setShowNotifyMe(true);
    setNotifySuccess(false);
  };

  const handleNotifyChange = (e) => {
    const { name, value } = e.target;
    setNotifyData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNotifySubmit = async (e) => {
    e.preventDefault();
    setNotifyLoading(true);

    try {
      const response = await fetch('/api/set-alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productUrl: link,
          targetPrice: parseFloat(notifyData.targetPrice),
          email: notifyData.email,
          productTitle: title,
          currentPrice: price,
          platform: platform
        }),
      });

      if (response.ok) {
        setNotifySuccess(true);
        setNotifyData({ email: '', targetPrice: '' });
        setTimeout(() => {
          setShowNotifyMe(false);
          setNotifySuccess(false);
        }, 2000);
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to set alert');
      }
    } catch (error) {
      console.error('Error setting alert:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setNotifyLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col h-full shadow-sm hover:shadow-md transition-shadow">
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
      <div className="p-4 flex flex-col flex-grow">
        <div className="mb-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
            {platform}
          </p>
          <h2 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight">
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
            <p className="text-xs text-gray-400 line-through">₹{originalPrice.toLocaleString()}</p>
          )}

          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-lg font-bold text-gray-900">₹{price.toLocaleString()}</p>
            {hasDiscount && (
              <span className="text-xs font-medium bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
                Save {discountPercentage}%
              </span>
            )}
          </div>

          {shippingAmount > 0 ? (
            <p className="text-xs text-gray-600 mt-1">
              + ₹{shippingAmount.toLocaleString()} shipping •{" "}
              <span className="font-medium text-gray-700">
                ₹{totalPrice.toLocaleString()} total
              </span>
            </p>
          ) : (
            <p className="text-xs text-green-600 font-medium mt-1">Free Shipping</p>
          )}

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
        <div className="mt-4 space-y-2">
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-md text-center transition-colors flex items-center justify-center gap-2"
          >
            <FiExternalLink size={14} />
            View on {platform}
          </a>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handlePredictionToggle}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium py-2 px-3 rounded-md text-center transition-colors flex items-center justify-center gap-1 border border-gray-300"
            >
              <FiTrendingUp size={12} />
              {showPrediction ? 'Hide' : 'Predict'}
            </button>
            
            <button
              onClick={handleNotifyMe}
              className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium py-2 px-3 rounded-md text-center transition-colors flex items-center justify-center gap-1"
            >
              <FiBell size={12} />
              Notify Me
            </button>
          </div>
        </div>

        {/* Notify Me Section */}
        {showNotifyMe && (
          <div className="mt-3 p-4 bg-orange-50 rounded-md border border-orange-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-orange-800 flex items-center gap-1">
                <FiBell size={14} />
                Set Price Alert
              </h4>
              <button
                onClick={() => setShowNotifyMe(false)}
                className="text-orange-600 hover:text-orange-800"
              >
                <FiX size={16} />
              </button>
            </div>
            
            {notifySuccess ? (
              <div className="text-center py-3">
                <div className="text-green-600 text-2xl mb-2">✅</div>
                <p className="text-sm text-green-700 font-medium">Alert set successfully!</p>
                <p className="text-xs text-green-600 mt-1">You'll be notified when the price drops</p>
              </div>
            ) : (
              <form onSubmit={handleNotifySubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-orange-700 mb-1">
                    Your Email
                  </label>
                  <input
                    type="email"
                    required
                    value={notifyData.email}
                    onChange={(e) => setNotifyData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-orange-700 mb-1">
                    Target Price (Current: ₹{price.toLocaleString()})
                  </label>
                  <input
                    type="number"
                    required
                    min="100"
                    max={price - 100}
                    value={notifyData.targetPrice}
                    onChange={(e) => setNotifyData(prev => ({ ...prev, targetPrice: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder={`Less than ₹${price.toLocaleString()}`}
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={notifyLoading}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
                >
                  {notifyLoading ? (
                    <>
                      <FiLoader className="animate-spin" size={14} />
                      Setting Alert...
                    </>
                  ) : (
                    <>
                      <FiBell size={14} />
                      Set Alert
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

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