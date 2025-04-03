import React from 'react';
import { useSystem } from '@/contexts/SystemContext';

const Home: React.FC = () => {
  // Simplified component for troubleshooting
  return (
    <div className="bg-black text-white h-screen flex flex-col justify-center items-center">
      <h1 className="text-4xl font-bold text-amber-400 mb-4">Phixeo OS</h1>
      <p className="text-xl text-amber-200">Revolutionary AI-powered operating system</p>
    </div>
  );
};

export default Home;
