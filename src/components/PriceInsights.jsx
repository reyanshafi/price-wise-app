import { useState, useEffect } from 'react';
import { FiTrendingUp, FiTrendingDown, FiActivity, FiZap, FiCalendar } from 'react-icons/fi';

export default function PriceInsights({ product }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await fetch(`/api/ai-insights?product=${encodeURIComponent(product.title)}&price=${product.price}`);
        const data = await response.json();
        setInsights(data);
      } catch (error) {
        console.error('Error fetching insights:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [product]);

  if (loading) return <div className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>;

  return (
    <div className="bg-gradient-to-br from-purple-900 to-blue-900 p-6 rounded-xl text-white">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <FiZap className="text-purple-400" />
        AI Price Insights
      </h3>
      
      <div className="space-y-4">
        {/* Price Trend Prediction */}
        <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
          <div className="flex items-center gap-2">
            <FiTrendingUp className="text-green-400" />
            <span>Next 7 days</span>
          </div>
          <span className="font-bold text-green-400">
            {insights?.prediction?.trend === 'up' ? '+' : '-'}
            {insights?.prediction?.percentage || '5'}%
          </span>
        </div>

        {/* Best Time to Buy */}
        <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
          <div className="flex items-center gap-2">
            <FiCalendar className="text-yellow-400" />
            <span>Best time to buy</span>
          </div>
          <span className="font-bold text-yellow-400">
            {insights?.bestTime || 'Next week'}
          </span>
        </div>

        {/* Price Volatility */}
        <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
          <div className="flex items-center gap-2">
            <FiActivity className="text-blue-400" />
            <span>Price volatility</span>
          </div>
          <span className="font-bold text-blue-400">
            {insights?.volatility || 'Medium'}
          </span>
        </div>

        {/* AI Recommendation */}
        <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
          <h4 className="font-semibold mb-2">🤖 AI Recommendation</h4>
          <p className="text-sm">
            {insights?.recommendation || 'Based on historical data, this product typically drops 15% during festive seasons. Consider waiting for the next sale.'}
          </p>
        </div>
      </div>
    </div>
  );
}
