import regression from "regression";

/**
 * Predict the next price based on trend data using conservative regression
 * @param {Array} trendData - Array of objects with { timestamp, price }
 * @returns {Number} - Predicted price
 */
export function predictPrice(trendData) {
  if (!trendData || trendData.length < 2) return null;

  try {
    // Get recent prices for baseline
    const recentPrices = trendData.slice(-5).map(d => d.price);
    const currentPrice = recentPrices[recentPrices.length - 1];
    const avgRecentPrice = recentPrices.reduce((sum, p) => sum + p, 0) / recentPrices.length;
    
    // Calculate simple moving average trend
    const shortTermPrices = trendData.slice(-3).map(d => d.price);
    const longTermPrices = trendData.slice(-6, -3).map(d => d.price);
    
    const shortTermAvg = shortTermPrices.reduce((sum, p) => sum + p, 0) / shortTermPrices.length;
    const longTermAvg = longTermPrices.length > 0 
      ? longTermPrices.reduce((sum, p) => sum + p, 0) / longTermPrices.length 
      : shortTermAvg;
    
    // Calculate trend direction and strength
    const trendStrength = (shortTermAvg - longTermAvg) / longTermAvg;
    
    // Conservative prediction: limit change to ±5% max
    const maxChange = 0.05;
    const limitedTrend = Math.max(-maxChange, Math.min(maxChange, trendStrength));
    
    // Apply trend to current price
    const prediction = currentPrice * (1 + limitedTrend);
    
    // Additional safety check: ensure prediction is within reasonable bounds
    const priceRange = Math.max(...recentPrices) - Math.min(...recentPrices);
    const reasonableBound = priceRange * 0.5;
    
    const lowerBound = avgRecentPrice - reasonableBound;
    const upperBound = avgRecentPrice + reasonableBound;
    
    return Math.max(lowerBound, Math.min(upperBound, prediction));

  } catch (error) {
    console.error("Error in price prediction:", error);
    // Fallback: return current price with minimal variation
    const currentPrice = trendData[trendData.length - 1].price;
    const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
    return currentPrice * (1 + variation);
  }
}

/**
 * Get price trend analysis
 * @param {Array} trendData - Array of objects with { timestamp, price }
 * @returns {Object} - Trend analysis including direction, volatility, etc.
 */
export function analyzeTrend(trendData) {
  if (!trendData || trendData.length < 2) return null;

  const prices = trendData.map(d => d.price);
  const firstPrice = prices[0];
  const lastPrice = prices[prices.length - 1];
  
  // Calculate overall trend
  const overallChange = ((lastPrice - firstPrice) / firstPrice) * 100;
  
  // Calculate volatility (standard deviation)
  const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length;
  const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length;
  const volatility = Math.sqrt(variance);
  
  // Determine trend direction
  let direction = "stable";
  if (overallChange > 5) direction = "increasing";
  else if (overallChange < -5) direction = "decreasing";
  
  // Calculate trend strength (how consistent the trend is)
  let consistentMoves = 0;
  for (let i = 1; i < prices.length; i++) {
    if ((direction === "increasing" && prices[i] > prices[i-1]) ||
        (direction === "decreasing" && prices[i] < prices[i-1]) ||
        (direction === "stable" && Math.abs(prices[i] - prices[i-1]) < mean * 0.05)) {
      consistentMoves++;
    }
  }
  
  const trendStrength = consistentMoves / (prices.length - 1);
  
  return {
    direction,
    overallChange: parseFloat(overallChange.toFixed(2)),
    volatility: parseFloat(volatility.toFixed(2)),
    trendStrength: parseFloat(trendStrength.toFixed(2)),
    meanPrice: parseFloat(mean.toFixed(2)),
    dataPoints: trendData.length
  };
}
