// Product filtering utilities for better search results

/**
 * Calculate relevance score for a product based on search query
 * @param {string} productTitle - The product title
 * @param {string} searchQuery - The search query
 * @returns {number} - Relevance score (higher = more relevant)
 */
export function calculateRelevanceScore(productTitle, searchQuery) {
  if (!productTitle || !searchQuery) return 0;

  const title = productTitle.toLowerCase();
  const query = searchQuery.toLowerCase();
  const queryWords = query.split(/\s+/).filter(word => word.length > 2);
  
  let score = 0;
  
  // STRICT FILTERING: Heavy penalty for accessories and non-main products
  const accessoryKeywords = [
    'case', 'cover', 'screen guard', 'protector', 'tempered glass',
    'flip cover', 'back cover', 'leather case', 'silicone', 'transparent',
    'bumper', 'stand', 'wallet', 'ring holder', 'car mount', 'charger', 'cable',
    'adapter', 'earphone', 'headphone', 'power bank', 'memory card',
    'pouch', 'sleeve', 'cleaning kit', 'stylus', 'holder', 'mount',
    'grip', 'kickstand', 'temper', 'glass', 'film', 'skin', 'decal'
  ];
  
  // Check if this is an accessory - if so, heavily penalize
  for (const accessory of accessoryKeywords) {
    if (title.includes(accessory)) {
      score -= 500; // Very heavy penalty for accessories
    }
  }
  
  // BONUS for main product indicators
  const mainProductKeywords = [
    'smartphone', 'mobile phone', 'phone', 'tablet', 'laptop', 'computer',
    'tv', 'television', 'camera', 'printer', 'watch', 'smartwatch',
    'console', 'gaming', 'processor', 'ram', 'storage', 'display'
  ];
  
  let isMainProduct = false;
  for (const mainKeyword of mainProductKeywords) {
    if (title.includes(mainKeyword)) {
      score += 200; // Higher bonus for main products
      isMainProduct = true;
    }
  }
  
  // For specific phone models, check if it's actually the phone
  const phoneModels = ['a13', 'a53', 'a73', 'iphone', 'pixel', 'oneplus', 'redmi', 'poco'];
  for (const model of phoneModels) {
    if (query.includes(model) && title.includes(model)) {
      // Check if it's the actual phone or just an accessory
      if (title.includes('smartphone') || title.includes('mobile') || title.includes('phone')) {
        score += 300; // Very high bonus for actual phones
      } else if (!accessoryKeywords.some(acc => title.includes(acc))) {
        // Additional check for Samsung Galaxy A13 specifically
        if (model === 'a13' && title.includes('galaxy') && title.includes('samsung')) {
          score += 400; // Highest bonus for Samsung Galaxy A13
        } else {
          score += 100; // Moderate bonus if not clearly an accessory
        }
      }
    }
  }
  
  // Special handling for Samsung Galaxy A13
  if (query.includes('samsung') && query.includes('a13')) {
    if (title.includes('galaxy') && title.includes('a13') && title.includes('samsung')) {
      // This is likely the Samsung Galaxy A13 phone
      if (!accessoryKeywords.some(acc => title.includes(acc))) {
        score += 500; // Highest possible bonus
      }
    }
  }
  
  // Exact query match gets highest score
  if (title.includes(query)) {
    score += 250;
  }
  
  // Word matching with priority
  let wordMatches = 0;
  for (const word of queryWords) {
    if (title.includes(word)) {
      wordMatches++;
      score += 25;
      
      // Bonus for word at the beginning
      if (title.startsWith(word)) {
        score += 20;
      }
      
      // Bonus for exact word match (not partial)
      const titleWords = title.split(/\s+/);
      if (titleWords.includes(word)) {
        score += 15;
      }
    }
  }
  
  // Bonus for high word match percentage
  const matchPercentage = wordMatches / queryWords.length;
  if (matchPercentage >= 0.8) {
    score += 100;
  } else if (matchPercentage >= 0.6) {
    score += 50;
  }
  
  // Brand matching bonus
  const brands = ['samsung', 'apple', 'iphone', 'canon', 'sony', 'lg', 'mi', 'redmi', 'oneplus', 'vivo', 'oppo', 'huawei', 'google', 'pixel'];
  for (const brand of brands) {
    if (query.includes(brand) && title.includes(brand)) {
      score += 40;
    }
  }
  
  // Model number matching (very important)
  const modelNumbers = query.match(/[a-z0-9]+\d+[a-z0-9]*/gi) || [];
  for (const model of modelNumbers) {
    if (title.includes(model.toLowerCase())) {
      score += 80;
    }
  }
  
  // Size/capacity matching
  const sizePattern = /(\d+(?:\.\d+)?)\s*(gb|tb|inch|"|mp|mah)/gi;
  const querySizes = [...query.matchAll(sizePattern)];
  const titleSizes = [...title.matchAll(sizePattern)];
  
  for (const querySize of querySizes) {
    for (const titleSize of titleSizes) {
      if (querySize[0].toLowerCase() === titleSize[0].toLowerCase()) {
        score += 60;
      }
    }
  }
  
  return score;
}

/**
 * Filter products based on relevance to search query
 * @param {Array} products - Array of products
 * @param {string} searchQuery - The search query
 * @param {number} minScore - Minimum relevance score (default: 100)
 * @param {number} maxResults - Maximum number of results (default: 8)
 * @returns {Array} - Filtered and sorted products
 */
export function filterRelevantProducts(products, searchQuery, minScore = 100, maxResults = 8) {
  if (!products || !searchQuery) return [];

  // Calculate relevance scores
  const scoredProducts = products.map(product => ({
    ...product,
    relevanceScore: calculateRelevanceScore(product.title, searchQuery)
  }));

  // STRICT FILTERING: Only show products with positive scores (no accessories)
  let filteredProducts = scoredProducts
    .filter(product => product.relevanceScore > 0) // Only positive scores
    .sort((a, b) => b.relevanceScore - a.relevanceScore);

  // If we have high-quality results, use higher threshold
  if (filteredProducts.length >= 5) {
    filteredProducts = filteredProducts.filter(product => product.relevanceScore >= minScore);
  }

  // Remove duplicates based on title similarity
  const uniqueProducts = removeDuplicateProducts(filteredProducts);

  // Only return main products, no accessories
  const mainProducts = uniqueProducts.filter(product => product.relevanceScore >= 50);

  // Log for debugging
  console.log(`🔍 Search: "${searchQuery}"`);
  console.log(`📊 Total products: ${products.length}`);
  console.log(`✅ Filtered products: ${mainProducts.length}`);
  
  // Show top scored products for debugging
  mainProducts.slice(0, 3).forEach(product => {
    console.log(`📱 ${product.title} (Score: ${product.relevanceScore})`);
  });

  return mainProducts.slice(0, maxResults);
}

/**
 * Remove duplicate products based on title similarity
 * @param {Array} products - Array of products
 * @returns {Array} - Products with duplicates removed
 */
export function removeDuplicateProducts(products) {
  const unique = [];
  const seen = new Set();

  for (const product of products) {
    // Create a normalized key for comparison
    const key = normalizeProductTitle(product.title);
    
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(product);
    }
  }

  return unique;
}

/**
 * Normalize product title for duplicate detection
 * @param {string} title - Product title
 * @returns {string} - Normalized title
 */
function normalizeProductTitle(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove special characters
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim()
    .split(' ')
    .slice(0, 5) // Take first 5 words
    .join(' ');
}

/**
 * Get product category based on title
 * @param {string} title - Product title
 * @returns {string} - Product category
 */
export function getProductCategory(title) {
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('iphone') || titleLower.includes('phone') || titleLower.includes('mobile')) {
    return 'Mobile';
  }
  if (titleLower.includes('laptop') || titleLower.includes('computer')) {
    return 'Computer';
  }
  if (titleLower.includes('headphone') || titleLower.includes('earphone') || titleLower.includes('earbuds')) {
    return 'Audio';
  }
  if (titleLower.includes('camera') || titleLower.includes('lens')) {
    return 'Camera';
  }
  if (titleLower.includes('watch') || titleLower.includes('smartwatch')) {
    return 'Wearable';
  }
  if (titleLower.includes('tv') || titleLower.includes('television')) {
    return 'TV';
  }
  if (titleLower.includes('printer') || titleLower.includes('scanner')) {
    return 'Printer';
  }
  
  return 'Other';
}
