import React from 'react';
import { useSystem } from '@/contexts/SystemContext';
import Taskbar from '@/components/desktop/Taskbar';

const Home: React.FC = () => {
  return (
    <div className="bg-black text-white h-screen flex flex-col">
      <Taskbar />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-amber-400 mb-4">Phixeo OS</h1>
          <p className="text-xl text-amber-200">Revolutionary AI-powered operating system</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
