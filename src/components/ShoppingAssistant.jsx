import { useState, useRef, useEffect } from 'react';
import { FiMessageCircle, FiSend, FiX, FiBox, FiUser, FiShoppingBag, FiTrendingUp, FiDollarSign } from 'react-icons/fi';

export default function ShoppingAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: "Hi! I'm your AI shopping assistant. I can help you find the best deals, compare prices, predict trends, and set up smart alerts. What are you looking for today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: [
        "Find best smartphone deals",
        "Compare laptop prices",
        "Set up price alerts",
        "Show trending products"
      ]
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (messageText = inputText) => {
    if (!messageText.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text: messageText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);
    setSuggestions([]);

    try {
      const response = await fetch('/api/shopping-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          context: {
            previousMessages: messages.slice(-5), // Send last 5 messages for context
            timestamp: new Date().toISOString()
          }
        })
      });

      const data = await response.json();
      
      const botMessage = {
        id: messages.length + 2,
        type: 'bot',
        text: data.response,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: data.suggestions || []
      };

      setMessages(prev => [...prev, botMessage]);
      setSuggestions(data.suggestions || []);
      setIsTyping(false);

    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        id: messages.length + 2,
        type: 'bot',
        text: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: ["Try again", "Find deals manually", "Check price alerts"]
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const quickActions = [
    { icon: FiShoppingBag, text: "Find Deals", action: "Show me today's best deals" },
    { icon: FiTrendingUp, text: "Trending", action: "What's trending right now?" },
    { icon: FiDollarSign, text: "Price Alerts", action: "Help me set up price alerts" }
  ];

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-500 to-blue-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50"
      >
        {isOpen ? <FiX size={24} /> : <FiMessageCircle size={24} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 w-96 h-[500px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col z-50">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-4 rounded-t-lg">
            <h3 className="font-bold flex items-center gap-2">
              <FiMessageCircle size={20} />
              AI Shopping Assistant
            </h3>
            <p className="text-sm opacity-90">Powered by smart price intelligence</p>
          </div>

          {/* Quick Actions */}
          <div className="p-3 border-b border-gray-100">
            <div className="flex gap-2">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(action.action)}
                  className="flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs text-gray-700 transition-colors"
                >
                  <action.icon size={12} />
                  {action.text}
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="space-y-2">
                <div
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs p-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-blue-500 text-white ml-4'
                        : 'bg-gray-100 text-gray-800 mr-4'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {message.type === 'bot' && <FiMessageCircle size={16} className="mt-1 text-purple-500" />}
                      <div>
                        <p className="text-sm whitespace-pre-line">{message.text}</p>
                        <p className="text-xs opacity-70 mt-1">{message.time}</p>
                      </div>
                      {message.type === 'user' && <FiUser size={16} className="mt-1" />}
                    </div>
                  </div>
                </div>
                
                {/* Suggestions */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1 ml-2">
                    {message.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="px-2 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-xs transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 p-3 rounded-lg mr-4">
                  <div className="flex items-center gap-2">
                    <FiMessageCircle size={16} className="text-purple-500" />
                    <div>
                      <p className="text-sm">AI is thinking...</p>
                      <div className="flex gap-1 mt-1">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about products, prices, deals..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={isTyping}
                className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white p-2 rounded-lg transition-colors"
              >
                <FiSend size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
