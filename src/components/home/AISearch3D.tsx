'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export const AISearch3D = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '👋 Hi! I\'m your AI shopping assistant. Ask me anything about products, recommendations, or deals!',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `That's a great question! Based on your search for "${input}", I recommend checking out our premium collection. You might find exactly what you're looking for! 🛍️`,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 800);
  };

  const suggestionQueries = [
    'Show me trending products',
    'Best deals today',
    'Premium quality items',
    'New arrivals',
  ];

  return (
    <section className="py-20 px-4 md:px-8 bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/15 rounded-full blur-3xl opacity-60" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/15 rounded-full blur-3xl opacity-60" />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Ask AI About Products</span>
          </h2>
          <p className="text-foreground/60 text-lg">Get instant recommendations powered by artificial intelligence</p>
        </motion.div>

        {/* Chat container */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, type: 'spring' }}
          className="glass-effect rounded-2xl overflow-hidden shadow-2xl shadow-primary/30"
        >
          {/* Messages area */}
          <div className={`transition-all duration-300 ${isExpanded ? 'h-96' : 'h-auto'} overflow-y-auto p-6`}>
            <div className="space-y-4">
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-3 rounded-xl ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-primary to-secondary text-background rounded-br-none'
                        : 'glass-effect border border-primary/30 text-foreground rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="flex justify-start"
                >
                  <div className="glass-effect border border-primary/30 px-4 py-3 rounded-xl rounded-bl-none">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Suggestions */}
          {messages.length === 1 && !isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="px-6 py-4 border-t border-border/30"
            >
              <p className="text-sm text-foreground/60 mb-3">Try asking about:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {suggestionQueries.map((query, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02, backgroundColor: 'rgba(167, 139, 250, 0.2)' }}
                    onClick={() => setInput(query)}
                    className="text-left px-3 py-2 text-sm text-primary border border-primary/30 rounded-lg hover:border-primary/60 transition-colors"
                  >
                    {query}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Input area */}
          <div className="p-6 border-t border-border/30 bg-background/50">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask about products, prices, recommendations..."
                className="flex-1 bg-muted border border-border/50 text-foreground placeholder:text-foreground/40 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-background font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                {isLoading ? '...' : '→'}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
