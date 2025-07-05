// Mock AI responses for when OpenAI quota is exceeded
const mockResponses = {
  greetings: [
    "Hello! I'm PriceWise AI Assistant. How can I help you find the best deals today?",
    "Hi there! I'm here to help you save money on your shopping. What are you looking for?",
    "Welcome to PriceWise! I can help you compare prices and find great deals. What can I do for you?"
  ],
  search: [
    "I'd recommend using our search feature to find the best prices for that product across multiple retailers!",
    "Great choice! Try searching for that item using our price comparison tool above.",
    "Let me help you find the best deals! Use our search bar to compare prices from different stores."
  ],
  deals: [
    "Here are some tips to find the best deals: Check our trending products section, set up price alerts, and compare prices across multiple retailers.",
    "To maximize your savings, try searching during sale seasons and use our price prediction feature to know when to buy.",
    "Pro tip: Use our analytics dashboard to track your savings and discover your shopping patterns!"
  ],
  default: [
    "I'm here to help you with price comparisons and finding the best deals. What would you like to know?",
    "Feel free to ask me about products, prices, or shopping tips. I'm here to help you save money!",
    "Let me know what you're shopping for, and I'll guide you to the best deals available!"
  ]
};

function generateMockResponse(message) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return mockResponses.greetings[Math.floor(Math.random() * mockResponses.greetings.length)];
  }
  
  if (lowerMessage.includes('search') || lowerMessage.includes('find') || lowerMessage.includes('buy')) {
    return mockResponses.search[Math.floor(Math.random() * mockResponses.search.length)];
  }
  
  if (lowerMessage.includes('deal') || lowerMessage.includes('discount') || lowerMessage.includes('save')) {
    return mockResponses.deals[Math.floor(Math.random() * mockResponses.deals.length)];
  }
  
  return mockResponses.default[Math.floor(Math.random() * mockResponses.default.length)];
}

export async function POST(req) {
  try {
    const { message, context } = await req.json();

    // For now, use mock responses due to OpenAI quota limitations
    // TODO: Replace with actual OpenAI API when billing is set up
    const reply = generateMockResponse(message);

    return new Response(
      JSON.stringify({ reply }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error with OpenAI API:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch response from AI assistant" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
