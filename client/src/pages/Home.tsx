import React, { useState } from 'react';
import PhixeoOS from '@/components/PhixeoOS';
import PhixAI from '@/components/PhixAI';
import { COLORS } from '@/lib/phixeo-styles';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Cpu, Terminal, Zap, Code } from 'lucide-react';

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
            Phixeo OS
          </h1>
          <p className="text-xl text-amber-500/70">
            Loading revolutionary AI-powered operating system
          </p>
          <div className="flex items-center justify-center space-x-2 mt-8">
            <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse delay-150"></div>
            <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse delay-300"></div>
          </div>
          <div className="phixeo-fractal text-sm text-amber-600/70 mt-8">
            <span>Using fractal optimization to bootstrap system...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-black">
      <Tabs defaultValue="os" className="h-full">
        <TabsList className="fixed top-2 left-1/2 transform -translate-x-1/2 z-50 bg-black border border-amber-800/30 p-1">
          <TabsTrigger value="os" className="data-[state=active]:bg-amber-900/30">
            <Cpu className="w-4 h-4 mr-2" />
            Phixeo OS
          </TabsTrigger>
          <TabsTrigger value="ai" className="data-[state=active]:bg-amber-900/30">
            <Zap className="w-4 h-4 mr-2" />
            Phix AI
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="os" className="h-full m-0 p-0">
          <PhixeoOS />
        </TabsContent>
        
        <TabsContent value="ai" className="h-full m-0 p-0 flex justify-center items-center bg-gradient-to-b from-black to-slate-900">
          <PhixAI />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Home;
