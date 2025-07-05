import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const product = searchParams.get('product');
    const price = parseFloat(searchParams.get('price'));

    if (!product || !price) {
      return NextResponse.json({ error: 'Missing product or price' }, { status: 400 });
    }

    // Simulate AI analysis (in real app, this would call OpenAI or similar)
    const insights = generateInsights(product, price);
    
    return NextResponse.json(insights);
  } catch (error) {
    console.error('Error generating AI insights:', error);
    return NextResponse.json({ error: 'Failed to generate insights' }, { status: 500 });
  }
}

function generateInsights(product, price) {
  // Mock AI insights based on product category and price
  const category = detectCategory(product);
  const insights = {
    prediction: generatePrediction(category, price),
    bestTime: getBestTimeToBy(category),
    volatility: getVolatility(category),
    recommendation: generateRecommendation(category, price),
    marketTrend: getMarketTrend(category)
  };

  return insights;
}

function detectCategory(product) {
  const electronics = ['phone', 'laptop', 'tablet', 'headphone', 'camera', 'tv'];
  const fashion = ['shirt', 'dress', 'shoe', 'bag', 'watch', 'jacket'];
  const home = ['furniture', 'kitchen', 'bed', 'chair', 'table', 'appliance'];
  
  const productLower = product.toLowerCase();
  
  if (electronics.some(item => productLower.includes(item))) return 'electronics';
  if (fashion.some(item => productLower.includes(item))) return 'fashion';
  if (home.some(item => productLower.includes(item))) return 'home';
  
  return 'general';
}

function generatePrediction(category, price) {
  const patterns = {
    electronics: { trend: Math.random() > 0.6 ? 'down' : 'up', percentage: 5 + Math.random() * 15 },
    fashion: { trend: Math.random() > 0.5 ? 'down' : 'up', percentage: 10 + Math.random() * 25 },
    home: { trend: Math.random() > 0.7 ? 'down' : 'up', percentage: 3 + Math.random() * 12 },
    general: { trend: Math.random() > 0.6 ? 'down' : 'up', percentage: 5 + Math.random() * 20 }
  };
  
  return patterns[category] || patterns.general;
}

function getBestTimeToBy(category) {
  const timing = {
    electronics: ['Black Friday', 'End of financial year', 'New model launches'],
    fashion: ['End of season', 'Festival sales', 'Clearance events'],
    home: ['New Year sales', 'Moving season', 'Festive periods'],
    general: ['Weekend sales', 'Month-end offers', 'Holiday seasons']
  };
  
  const times = timing[category] || timing.general;
  return times[Math.floor(Math.random() * times.length)];
}

function getVolatility(category) {
  const volatility = {
    electronics: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)],
    fashion: ['Very High', 'High', 'Medium'][Math.floor(Math.random() * 3)],
    home: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
    general: ['Medium', 'High', 'Low'][Math.floor(Math.random() * 3)]
  };
  
  return volatility[category] || 'Medium';
}

function generateRecommendation(category, price) {
  const recommendations = {
    electronics: [
      'Tech prices typically drop 20-30% during major sales. Consider waiting for upcoming events.',
      'New model releases often trigger discounts on older versions. Check for upcoming launches.',
      'Compare specifications before buying. Sometimes previous generation offers better value.',
      'Extended warranties are often overpriced. Third-party options might be cheaper.'
    ],
    fashion: [
      'End-of-season sales offer the best discounts. Wait for seasonal clearances.',
      'Subscribe to brand newsletters for exclusive early access to sales.',
      'Check size charts carefully as return shipping can be expensive.',
      'Consider similar styles from different brands for better deals.'
    ],
    home: [
      'Bulk purchases during sales can offer significant savings for home items.',
      'Check local stores for installation and delivery costs before online purchase.',
      'Read reviews carefully as returns can be complicated for large items.',
      'Consider floor models and display units for additional discounts.'
    ],
    general: [
      'Set price alerts to track price drops over time.',
      'Check multiple retailers before making a purchase decision.',
      'Consider cashback and reward programs for additional savings.',
      'Read customer reviews and ratings before purchasing.'
    ]
  };
  
  const categoryRecs = recommendations[category] || recommendations.general;
  return categoryRecs[Math.floor(Math.random() * categoryRecs.length)];
}

function getMarketTrend(category) {
  return Math.random() > 0.5 ? 'bullish' : 'bearish';
}
