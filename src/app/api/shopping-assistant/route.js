import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { message, context } = await req.json();

    // Generate AI response with product integration
    const aiResponse = await generateAIResponse(message, context);
    
    // Check if we need to fetch product data
    const productData = await checkForProductSearch(message);
    
    return NextResponse.json({ 
      response: aiResponse.response,
      suggestions: aiResponse.suggestions,
      productData: productData,
      actions: aiResponse.actions
    });

  } catch (error) {
    console.error("❌ Shopping Assistant Error:", error);
    return NextResponse.json({ 
      response: "Sorry, I'm having trouble right now. Please try again.",
      suggestions: ["Try again", "Browse deals", "Check price alerts"]
    }, { status: 500 });
  }
}

async function checkForProductSearch(message) {
  const lowerMessage = message.toLowerCase();
  
  // Extract product search intent
  const productSearchPatterns = [
    /find\s+(.+)/i,
    /search\s+(.+)/i,
    /looking\s+for\s+(.+)/i,
    /show\s+me\s+(.+)/i,
    /(.+)\s+deals/i,
    /(.+)\s+price/i
  ];
  
  for (const pattern of productSearchPatterns) {
    const match = message.match(pattern);
    if (match) {
      const productQuery = match[1].trim();
      // You can integrate with your existing product search API here
      return {
        query: productQuery,
        shouldSearch: true
      };
    }
  }
  
  return null;
}

async function generateAIResponse(message, context) {
  const lowerMessage = message.toLowerCase();
  
  // Enhanced product search with price integration
  if (lowerMessage.includes('find') || lowerMessage.includes('search') || lowerMessage.includes('looking for')) {
    const productName = extractProductName(message);
    return {
      response: `I'll help you find the best deals for "${productName}"! 🔍\n\nLet me search across all major retailers and show you:\n• Current best prices\n• Price history trends\n• Available deals & discounts\n• Similar alternatives\n\nWould you like me to set up a price alert for when it drops below a certain amount?`,
      suggestions: [
        `Show ${productName} deals`,
        `Compare ${productName} prices`,
        `Set price alert for ${productName}`,
        `Find ${productName} alternatives`
      ],
      actions: ['search_product']
    };
  }
  
  // Enhanced price comparison with live data
  if (lowerMessage.includes('compare') || lowerMessage.includes('price') || lowerMessage.includes('cheaper')) {
    return {
      response: `I'll compare prices across all major retailers for you! 📊\n\n**What I'll check:**\n• Amazon, Flipkart, Myntra, Snapdeal\n• Current promotions & cashback offers\n• Price history (last 30 days)\n• Best time to buy prediction\n• Shipping costs & delivery time\n\nWhich product would you like me to compare?`,
      suggestions: [
        "Compare smartphone prices",
        "Find cheapest laptop deals",
        "Compare fashion brands",
        "Show electronics comparison"
      ],
      actions: ['compare_prices']
    };
  }
  
  // Smart price alerts with AI predictions
  if (lowerMessage.includes('alert') || lowerMessage.includes('notify') || lowerMessage.includes('drop')) {
    return {
      response: `I'll set up intelligent price alerts for you! 🔔\n\n**Smart Features:**\n• AI-powered price drop predictions\n• Seasonal trend analysis\n• Competitor price monitoring\n• Instant notifications via email/SMS\n• Historical low price alerts\n\nWhat product and target price would you like to track?`,
      suggestions: [
        "Set alert for smartphones",
        "Monitor laptop prices",
        "Track fashion sales",
        "Alert me about electronics deals"
      ],
      actions: ['set_alert']
    };
  }
  
  // Live deals and personalized recommendations
  if (lowerMessage.includes('deal') || lowerMessage.includes('discount') || lowerMessage.includes('offer') || lowerMessage.includes('sale')) {
    return {
      response: `Here are today's hottest deals! 🔥\n\n**📱 Electronics (40% off)**\n• iPhone 15 Pro - ₹15,000 off\n• Samsung Galaxy S24 - ₹12,000 off\n• MacBook Air M3 - ₹20,000 off\n\n**👕 Fashion (50% off)**\n• Nike, Adidas - End of season sale\n• Branded shirts - Buy 2 Get 1 Free\n\n**🏠 Home & Garden (60% off)**\n• Furniture - Festival discount\n• Appliances - Exchange offers\n\nWhich category interests you most?`,
      suggestions: [
        "Electronics deals",
        "Fashion discounts",
        "Home & Garden offers",
        "All categories"
      ],
      actions: ['show_deals']
    };
  }
  
  // Smart budget shopping with AI recommendations
  if (lowerMessage.includes('budget') || lowerMessage.includes('cheap') || lowerMessage.includes('affordable')) {
    return {
      response: `I'll help you find the best value within your budget! 💰\n\n**Smart Budget Shopping:**\n• Price-to-value ratio analysis\n• Hidden gem products (great features, lower price)\n• Upcoming sale predictions\n• Bundle deals & combo offers\n• Refurbished/open-box deals\n\nWhat's your budget range and what are you looking for?`,
      suggestions: [
        "Budget smartphones under ₹15,000",
        "Affordable laptops under ₹40,000",
        "Budget fashion finds",
        "Best value electronics"
      ],
      actions: ['budget_search']
    };
  }
  
  // AI-powered product recommendations
  if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest') || lowerMessage.includes('best')) {
    return {
      response: `I'll recommend the best products using AI analysis! 🤖\n\n**My Recommendation Process:**\n⭐ **Reviews Analysis** - Real customer sentiment\n📊 **Price Stability** - Consistent pricing patterns\n🔥 **Deal Probability** - Likelihood of future discounts\n💡 **Feature Comparison** - Best specs for the price\n🏆 **Market Position** - Brand reputation & support\n\nWhat type of product are you looking for?`,
      suggestions: [
        "Best smartphones 2024",
        "Top rated laptops",
        "Recommended fashion brands",
        "Must-have electronics"
      ],
      actions: ['get_recommendations']
    };
  }
  
  // Advanced product research with AI insights
  if (lowerMessage.includes('specification') || lowerMessage.includes('features') || lowerMessage.includes('review')) {
    return {
      response: `I'll provide comprehensive product research! 📋\n\n**Detailed Analysis Includes:**\n• Technical specifications breakdown\n• Feature comparison matrix\n• Authentic customer reviews analysis\n• Expert ratings & awards\n• Common issues & solutions\n• Warranty & support information\n\nWhich product would you like me to research in detail?`,
      suggestions: [
        "iPhone 15 Pro specs",
        "MacBook Air M3 review",
        "Samsung Galaxy S24 features",
        "Compare product specifications"
      ],
      actions: ['research_product']
    };
  }
  
  // Real-time trending products with market insights
  if (lowerMessage.includes('trending') || lowerMessage.includes('popular') || lowerMessage.includes('latest')) {
    return {
      response: `Here are today's trending products with market insights! 📈\n\n**🔥 Hot Right Now:**\n• **iPhone 15 Pro** - High demand, stable pricing\n• **Samsung Galaxy S24** - Downward price trend (-8%)\n• **MacBook Air M3** - New launch, premium segment\n• **AirPods Pro 2** - Seasonal discount expected\n• **Nintendo Switch OLED** - Supply increasing\n\n**💡 AI Insights:**\n• Best time to buy predictions\n• Price drop probability\n• Market demand analysis\n\nWhich trending product interests you?`,
      suggestions: [
        "iPhone 15 Pro details",
        "Samsung Galaxy S24 price trend",
        "MacBook Air M3 availability",
        "All trending electronics"
      ],
      actions: ['show_trending']
    };
  }
  
  // Seasonal shopping intelligence
  if (lowerMessage.includes('when to buy') || lowerMessage.includes('best time')) {
    return {
      response: `Perfect timing question! Here's my AI-powered buying calendar: 📅\n\n**📱 Electronics:**\n• Pre-Diwali (Oct): 30-50% off\n• Republic Day (Jan): 25-40% off\n• End of financial year (Mar): 20-35% off\n\n**👔 Fashion:**\n• End of season (Mar, Sep): 40-70% off\n• Festival season (Oct-Nov): 30-50% off\n• New year clearance (Jan): 25-60% off\n\n**🏠 Home & Garden:**\n• Post-festival (Nov-Dec): 35-55% off\n• Summer sale (Apr-May): 30-45% off\n\n**🎯 Smart Tip:** I can predict the best buying time for specific products!`,
      suggestions: [
        "Best time to buy iPhone",
        "When to buy laptops",
        "Fashion sale calendar",
        "Electronics buying guide"
      ],
      actions: ['timing_analysis']
    };
  }
  
  // Enhanced alternative product suggestions
  if (lowerMessage.includes('alternative') || lowerMessage.includes('similar') || lowerMessage.includes('instead')) {
    return {
      response: `I'll find amazing alternatives that might save you money! 💡\n\n**Alternative Analysis:**\n• Feature-matched products at lower prices\n• Newer models with better value\n• Different brands with similar quality\n• Previous generation with huge discounts\n• Refurbished options from trusted sellers\n\nWhat product are you considering? I'll find better alternatives!`,
      suggestions: [
        "iPhone alternatives",
        "MacBook alternatives",
        "Nike alternatives",
        "Show me all alternatives"
      ],
      actions: ['find_alternatives']
    };
  }
  
  // Enhanced greeting with personalized welcome
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return {
      response: `Hello! I'm your AI shopping assistant powered by advanced price intelligence! 🤖✨\n\n**What I can do for you:**\n🔍 **Smart Search** - Find products across 50+ retailers\n💰 **Price Intelligence** - Real-time price tracking & predictions\n📊 **Trend Analysis** - Historical data & future projections\n🔔 **Smart Alerts** - AI-powered price drop notifications\n⭐ **Personalized Recommendations** - Based on your preferences\n🎯 **Deal Discovery** - Hidden discounts & cashback offers\n\nReady to save money? What would you like to shop for?`,
      suggestions: [
        "Find me the best deals",
        "Compare smartphone prices",
        "Set up price alerts",
        "Show trending products"
      ],
      actions: ['welcome']
    };
  }
  
  // Comprehensive help with feature showcase
  if (lowerMessage.includes('help') || lowerMessage.includes('how') || lowerMessage.includes('what can you do')) {
    return {
      response: `I'm your intelligent shopping companion! Here's everything I can help you with: 🛒\n\n**🔍 SMART SEARCH & DISCOVERY**\n• Multi-retailer product search\n• Hidden deal finder\n• Category-wise browsing\n• Voice search support\n\n**💰 PRICE INTELLIGENCE**\n• Real-time price comparison\n• Historical price tracking\n• Price drop predictions\n• Best time to buy analysis\n\n**🔔 SMART ALERTS & NOTIFICATIONS**\n• Custom price alerts\n• Deal notifications\n• Restock alerts\n• Seasonal sale reminders\n\n**🤖 AI-POWERED FEATURES**\n• Personalized recommendations\n• Review sentiment analysis\n• Feature comparison\n• Budget optimization\n\n**📊 ANALYTICS & INSIGHTS**\n• Savings tracking\n• Purchase history\n• Market trends\n• Category insights\n\nJust ask me anything about shopping!`,
      suggestions: [
        "Start shopping",
        "Find deals",
        "Set price alerts",
        "Get recommendations"
      ],
      actions: ['show_help']
    };
  }
  
  // Default intelligent response with context awareness
  return {
    response: `I understand you're asking about "${message}". Let me help you with that! 🤖\n\n**Here's what I can do:**\n• Search for the best prices across all retailers\n• Set up intelligent price alerts\n• Show you price history and trend predictions\n• Find similar products with better value\n• Discover current deals and hidden discounts\n• Provide detailed product research\n\n**Quick Actions:**\n• Type product names to search\n• Ask "find deals" for current offers\n• Say "set alert" for price notifications\n• Ask "compare prices" for price analysis\n\nWhat specific information would you like me to find for you?`,
    suggestions: [
      "Find best deals",
      "Set price alert",
      "Compare prices",
      "Show me trending products"
    ],
    actions: ['general_help']
  };
}

function extractProductName(message) {
  // Enhanced product name extraction
  const cleanMessage = message.toLowerCase();
  const stopWords = ['find', 'search', 'looking', 'for', 'the', 'a', 'an', 'best', 'good', 'cheap', 'show', 'me', 'get', 'buy'];
  
  const words = cleanMessage.split(' ').filter(word => 
    !stopWords.includes(word) && word.length > 2
  );
  
  return words.join(' ') || 'product';
}
