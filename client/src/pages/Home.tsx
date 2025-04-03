import React, { useState } from 'react';
import { useSystem } from '@/contexts/SystemContext';
import PhixeoOS from '@/components/PhixeoOS';

const Home: React.FC = () => {
  const [loading, setLoading] = useState(true);

  // Simulate a quick loading screen
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="bg-black text-white h-screen flex flex-col items-center justify-center">
        <div className="text-center space-y-6">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-[#B8860B] to-[#FFD700] bg-clip-text text-transparent">
            Phixeo OS
          </h1>
          <p className="text-xl text-gray-400">
            Loading revolutionary AI-powered operating system
          </p>
          <div className="flex items-center justify-center space-x-2 mt-8">
            <div className="w-3 h-3 bg-gold rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-gold rounded-full animate-pulse delay-150"></div>
            <div className="w-3 h-3 bg-gold rounded-full animate-pulse delay-300"></div>
          </div>
          <div className="text-xs text-gray-600 mt-8">
            Using fractal algorithms to optimize startup...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black text-white min-h-screen p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with branding */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#B8860B] to-[#FFD700]"></div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#B8860B] to-[#FFD700] bg-clip-text text-transparent">
              Phixeo OS
            </h1>
          </div>
          <div className="text-sm text-gray-400">
            Web Demo • v1.0
          </div>
        </div>
        
        {/* Main OS Interface */}
        <PhixeoOS />
        
        {/* Footer with explanation */}
        <div className="mt-8 pt-6 border-t border-gray-800 text-center text-sm text-gray-400">
          <p>
            Phixeo OS showcases the revolutionary efficiency of Phixeo language. 
            Traditional development would require 1.5-2 years and over 100,000 lines of code. 
            With Phixeo, it was built in minutes with 90% less code.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
