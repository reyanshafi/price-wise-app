import regression from "regression";

/**
 * Predict the next price based on trend data
 * @param {Array} trendData - Array of objects with { timestamp, price }
 * @returns {Number} - Predicted price
 */
export function predictPrice(trendData) {
  if (!trendData || trendData.length < 2) return null;

  // Convert to [x, y] pairs where x = index or timestamp, y = price
  const formattedData = trendData.map((point, index) => [index, point.price]);

  const result = regression.linear(formattedData);
  const prediction = result.predict(formattedData.length); // Predict next value

  return prediction[1]; // y-value (predicted price)
}
