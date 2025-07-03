import { FiActivity } from "react-icons/fi";

export default function PredictivePriceCard({ predictedPrice }) {
  if (predictedPrice === null || isNaN(predictedPrice)) return null;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <FiActivity className="text-blue-500" /> Predicted Price
      </h3>
      <p className="text-3xl font-bold">₹{predictedPrice.toFixed(2)}</p>
      <p className="text-sm text-gray-500 mt-2">
        Based on historical price trends
      </p>
    </div>
  );
}