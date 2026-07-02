import { useState, useEffect } from "react";
import { FiX, FiAlertCircle, FiLoader } from "react-icons/fi";
import { useAuth } from "@/contexts/AuthContext";

export default function NotifyMeModal({ isOpen, onClose, product }) {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user && user.email) {
      setEmail(user.email);
    }
    // Pre-fill target price to 10% less than current price as a suggestion
    if (product && product.price) {
      const suggested = Math.floor(product.price * 0.9);
      setTargetPrice(suggested.toString());
    }
  }, [user, product]);

  if (!isOpen || !product) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch('/api/set-alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productUrl: product.link,
          targetPrice: parseFloat(targetPrice),
          email: email,
          productTitle: product.title,
          currentPrice: product.price,
          platform: product.platform
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 2500);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to set alert');
      }
    } catch (err) {
      console.error('Error setting alert:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative bg-white w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 p-1 transition-colors"
        >
          <FiX className="w-5 h-5" />
        </button>

        <div className="p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-orange-100 p-3 rounded-full text-orange-600">
              <FiAlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Set Price Alert</h2>
              <p className="text-sm text-gray-500">We'll email you when the price drops!</p>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 border border-gray-100">
            <div className="w-16 h-16 bg-white p-1 border border-gray-200 flex-shrink-0 flex items-center justify-center">
              <img src={product.image} alt="Product" className="max-w-full max-h-full object-contain" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-gray-900 truncate">{product.title}</p>
              <p className="text-xs text-gray-500 mt-1">Current Price: <span className="font-bold text-gray-900">₹{product.price?.toLocaleString()}</span> on {product.platform}</p>
            </div>
          </div>

          {success ? (
            <div className="text-center py-8">
              <div className="text-green-500 text-5xl mb-4 flex justify-center">
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Alert Created!</h3>
              <p className="text-sm text-gray-600">You'll receive an email at <span className="font-medium text-gray-900">{email}</span> as soon as the price drops to ₹{parseFloat(targetPrice).toLocaleString()} or lower.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm rounded-none"
                  placeholder="Where should we notify you?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Price (₹)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="1"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm rounded-none"
                  placeholder={`e.g. ${Math.floor(product.price * 0.9)}`}
                />
                <p className="text-xs text-gray-500 mt-1">Current price is ₹{product.price?.toLocaleString()}. Set it lower to catch a deal!</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm rounded-none mt-6"
              >
                {loading ? (
                  <FiLoader className="animate-spin mr-2" />
                ) : null}
                Create Price Alert
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
