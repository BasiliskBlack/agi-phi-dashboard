import React, { useState } from 'react';
import SacredGeometryDashboard from '@/components/SacredGeometryDashboard';

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
          <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-700 to-amber-400 bg-clip-text text-transparent">
            Φ AGI OS
          </h1>
          <p className="text-xl text-amber-500/70">
            Loading sacred geometry dashboard...
          </p>
          <div className="flex items-center justify-center space-x-2 mt-8">
            <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse delay-150"></div>
            <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse delay-300"></div>
          </div>
          <div className="phixeo-fractal text-sm text-amber-600/70 mt-8">
            <span>Initializing quantum/phi UI...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-black">
      <SacredGeometryDashboard />
    </div>
  );
};

export default Home;
