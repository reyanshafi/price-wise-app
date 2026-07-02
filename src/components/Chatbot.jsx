"use client";
import { useState, useRef, useEffect } from "react";
import { 
  FiMessageCircle, 
  FiX, 
  FiSend, 
  FiCpu, 
  FiUser,
  FiMinimize2,
  FiMaximize2 
} from "react-icons/fi";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi! I'm your PriceWise AI assistant. I can help you find the best deals, compare prices, and answer questions about products. What can I help you with today?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { 
      sender: "user", 
      text: input, 
      timestamp: new Date().toISOString() 
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: input,
          context: "PriceWise user seeking shopping assistance"
        }),
      });

      const data = await response.json();
      
      if (data.reply) {
        const botMessage = { 
          sender: "bot", 
          text: data.reply, 
          timestamp: new Date().toISOString() 
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        throw new Error("No reply from assistant");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = { 
        sender: "bot", 
        text: "Sorry, I'm having trouble connecting right now. Please try again in a moment.", 
        timestamp: new Date().toISOString() 
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickActions = [
    "Find best smartphone deals",
    "Compare laptop prices",
    "Show trending products",
    "Help me save money"
  ];

  const handleQuickAction = (action) => {
    setInput(action);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-[var(--primary)] hover:bg-blue-700 text-white p-3 sm:p-4 rounded-none shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 z-50"
        aria-label="Open AI Assistant"
      >
        <FiMessageCircle size={24} />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-[var(--surface-1)] rounded-none shadow-xl border border-[var(--surface-3)] z-50 transition-all duration-300 ${
      isMinimized ? 'h-16 w-[calc(100vw-2rem)] sm:w-80' : 'h-96 w-[calc(100vw-2rem)] sm:w-96'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--surface-3)] bg-[var(--surface-2)] text-[var(--text-primary)] rounded-none">
        <div className="flex items-center gap-3">
          <div className="bg-[var(--surface-1)] border border-[var(--surface-3)] p-2 rounded-none">
            <FiCpu size={20} className="text-[var(--primary)]" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">PriceWise AI</h3>
            <p className="text-xs text-[var(--text-secondary)]">Your Shopping Assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-[var(--surface-3)] text-[var(--text-secondary)] rounded-none transition-colors"
          >
            {isMinimized ? <FiMaximize2 size={16} /> : <FiMinimize2 size={16} />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-[var(--surface-3)] text-[var(--text-secondary)] rounded-none transition-colors"
          >
            <FiX size={16} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-64">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-none ${
                    msg.sender === "user"
                      ? "bg-[var(--primary)] text-white"
                      : "bg-[var(--surface-2)] border border-[var(--surface-3)] text-[var(--text-primary)]"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {msg.sender === "bot" && (
                      <FiCpu size={16} className="text-[var(--primary)] mt-1 flex-shrink-0" />
                    )}
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    {msg.sender === "user" && (
                      <FiUser size={16} className="text-white/70 mt-1 flex-shrink-0" />
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[var(--surface-2)] border border-[var(--surface-3)] px-4 py-2 rounded-none">
                  <div className="flex items-center gap-2">
                    <FiCpu size={16} className="text-[var(--primary)]" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length === 1 && (
            <div className="px-4 py-2 border-t border-[var(--surface-3)]">
              <p className="text-xs text-[var(--text-secondary)] mb-2">Quick actions:</p>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action)}
                    className="px-2 py-1 bg-[var(--surface-2)] border border-[var(--surface-3)] text-[var(--text-secondary)] hover:text-[var(--primary)] rounded-none text-xs hover:border-[var(--primary)] transition-colors"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-[var(--surface-3)] bg-[var(--surface-1)] rounded-none">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about shopping..."
                className="flex-1 px-3 py-2 border border-[var(--surface-3)] bg-[var(--surface-2)] text-[var(--text-primary)] rounded-none focus:outline-none focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)] text-sm"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="bg-[var(--primary)] hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-none transition-all duration-200 transform hover:scale-105"
              >
                <FiSend size={16} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
