import { FiDollarSign, FiCreditCard, FiPercent } from "react-icons/fi";

export default function CashbackComparison({ products }) {
  if (!products || products.length === 0) return null;

  // Extract all unique cashback offers
  const allCashbackOffers = [];
  const allBankOffers = [];

  products.forEach(product => {
    if (product.cashbackOffers) {
      product.cashbackOffers.forEach(offer => {
        allCashbackOffers.push({
          offer,
          platform: product.platform,
          price: product.price,
          title: product.title
        });
      });
    }
    if (product.bankOffers) {
      product.bankOffers.forEach(offer => {
        allBankOffers.push({
          offer,
          platform: product.platform,
          price: product.price,
          title: product.title
        });
      });
    }
  });

  // Sort by cashback percentage
  const topCashbackOffers = allCashbackOffers
    .map(item => ({
      ...item,
      percentage: item.offer.match(/(\d+)%/)?.[1] || 0
    }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 5);

  return (
    <div className="mt-12 bg-gradient-to-r from-green-900/50 to-blue-900/50 rounded-xl border border-green-800 p-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center bg-green-800/50 rounded-full px-4 py-2 mb-4">
          <FiDollarSign className="text-green-400 mr-2" size={20} />
          <span className="text-green-100 font-semibold">Cashback & Offers Analysis</span>
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">
          Maximize Your <span className="text-green-400">Savings</span>
        </h2>
        <p className="text-blue-100">Compare cashback offers and bank deals across platforms</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Cashback Offers */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
          <div className="flex items-center mb-4">
            <FiPercent className="text-green-400 mr-2" size={18} />
            <h3 className="text-xl font-semibold text-white">Top Cashback Offers</h3>
          </div>
          <div className="space-y-3">
            {topCashbackOffers.slice(0, 3).map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="flex-1">
                  <p className="text-green-300 font-medium text-sm">{item.offer}</p>
                  <p className="text-blue-200 text-xs">{item.platform} • ₹{item.price.toLocaleString()}</p>
                </div>
                <div className="bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">
                  {item.percentage}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bank Offers */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
          <div className="flex items-center mb-4">
            <FiCreditCard className="text-blue-400 mr-2" size={18} />
            <h3 className="text-xl font-semibold text-white">Bank Offers</h3>
          </div>
          <div className="space-y-3">
            {allBankOffers.slice(0, 3).map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="flex-1">
                  <p className="text-blue-300 font-medium text-sm">{item.offer}</p>
                  <p className="text-blue-200 text-xs">{item.platform} • ₹{item.price.toLocaleString()}</p>
                </div>
                <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">
                  BANK
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Savings Calculator */}
      <div className="mt-8 p-6 bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-lg border border-yellow-800">
        <h4 className="text-lg font-semibold text-yellow-100 mb-3">💡 Smart Savings Tip</h4>
        <p className="text-yellow-200 text-sm mb-2">
          {topCashbackOffers.length > 0 && (
            <>
              With the best cashback offer of <strong>{topCashbackOffers[0]?.percentage}%</strong> on {topCashbackOffers[0]?.platform}, 
              you could save up to <strong>₹{Math.floor((topCashbackOffers[0]?.price * topCashbackOffers[0]?.percentage) / 100)}</strong> on this purchase!
            </>
          )}
        </p>
        <p className="text-yellow-300 text-xs">
          * Savings calculated based on advertised cashback rates. Actual savings may vary based on terms and conditions.
        </p>
      </div>
    </div>
  );
}
