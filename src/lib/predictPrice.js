import regression from "regression";

/**
 * Predict the next price based on trend data using multiple regression models
 * @param {Array} trendData - Array of objects with { timestamp, price }
 * @returns {Number} - Predicted price
 */
export function predictPrice(trendData) {
  if (!trendData || trendData.length < 2) return null;

  try {
    // Convert timestamps to days since first data point for better regression
    const firstTimestamp = new Date(trendData[0].timestamp).getTime();
    const formattedData = trendData.map((point) => {
      const daysSinceStart = (new Date(point.timestamp).getTime() - firstTimestamp) / (1000 * 60 * 60 * 24);
      return [daysSinceStart, point.price];
    });

    // Try different regression models and pick the best one
    let bestModel = null;
    let bestR2 = -Infinity;

    const models = [
      { type: 'linear', result: regression.linear(formattedData) },
      { type: 'polynomial', result: regression.polynomial(formattedData, { order: 2 }) },
      { type: 'exponential', result: regression.exponential(formattedData) }
    ];

    // Find the model with the best R² value
    for (const model of models) {
      if (model.result.r2 > bestR2) {
        bestR2 = model.result.r2;
        bestModel = model.result;
      }
    }

    if (!bestModel) {
      // Fallback to simple linear regression
      const result = regression.linear(formattedData);
      const nextDay = formattedData[formattedData.length - 1][0] + 1;
      return result.predict(nextDay)[1];
    }

    // Predict price for next day
    const nextDay = formattedData[formattedData.length - 1][0] + 1;
    const prediction = bestModel.predict(nextDay)[1];

    // Ensure prediction is reasonable (within 50% of recent price range)
    const recentPrices = trendData.slice(-5).map(d => d.price);
    const minRecent = Math.min(...recentPrices);
    const maxRecent = Math.max(...recentPrices);
    const range = maxRecent - minRecent;
    
    // Clamp prediction to reasonable bounds
    const lowerBound = minRecent - (range * 0.5);
    const upperBound = maxRecent + (range * 0.5);
    
    return Math.max(lowerBound, Math.min(upperBound, prediction));

  } catch (error) {
    console.error("Error in price prediction:", error);
    // Fallback: simple average of recent trend
    const recentPrices = trendData.slice(-3).map(d => d.price);
    return recentPrices.reduce((sum, price) => sum + price, 0) / recentPrices.length;
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
