import React, { useState, useRef, useEffect } from 'react';
import { useSystem } from '@/contexts/SystemContext';

const AIAssistantWindow: React.FC = () => {
  const { aiMessages, addUserMessage, addAIResponse } = useSystem();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom of messages when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      addUserMessage(message);
      
      // Simulate AI response
      setTimeout(() => {
        const responses = [
          "Phixeo represents a paradigm shift in programming efficiency. By leveraging golden ratio-based geometric constants and fractal optimization, it reduces development time by orders of magnitude.",
          "Our analysis shows it can compress 1.5-2 years of development effort into mere minutes through its revolutionary visual programming interface and AI acceleration.",
          "Phixeo's efficiency comes from its revolutionary approach to data structures. By using the golden ratio (phi) and tetrahedral constants, it optimizes memory usage in ways traditional languages cannot.",
          "The neural processing capabilities of Phixeo allow it to predict optimal code paths before execution, reducing runtime overhead by up to 87%.",
          "Phixeo's parser has achieved what was previously thought impossible - O(log n) complexity for code compilation through its fractal node architecture."
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        addAIResponse(randomResponse);
      }, 1000);
      
      setMessage('');
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {aiMessages.map((msg) => (
          <div key={msg.id} className={`flex items-start mb-4 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
            {msg.sender === 'ai' && (
              <div className="w-8 h-8 rounded-full bg-phixeo-purple flex-shrink-0 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"></path>
                </svg>
              </div>
            )}
            <div className={`${msg.sender === 'ai' ? 'ml-3 bg-gray-800' : 'mr-3 bg-phixeo-blue bg-opacity-30'} rounded-lg p-3 text-sm max-w-[85%]`}>
              <p>{msg.content}</p>
            </div>
            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-full bg-phixeo-blue flex-shrink-0 flex items-center justify-center">
                <span className="text-xs font-medium">JD</span>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-phixeo-purple"
          placeholder="Ask me anything about Phixeo..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button 
          type="submit" 
          className="absolute right-3 top-3 text-phixeo-purple"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path>
          </svg>
        </button>
      </form>
    </div>
  );
};

export default AIAssistantWindow;
