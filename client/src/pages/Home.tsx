import React from 'react';
import Desktop from '@/components/desktop/Desktop';
import Taskbar from '@/components/desktop/Taskbar';
import Dock from '@/components/desktop/Dock';
import Notifications from '@/components/desktop/Notifications';
import WindowManager from '@/components/windows/WindowManager';
import { useSystem } from '@/contexts/SystemContext';

const Home: React.FC = () => {
  const { metrics, refreshMetrics } = useSystem();

  return (
    <div className="bg-phixeo-bg text-phixeo-text h-screen flex flex-col">
      <Taskbar />
      <Desktop>
        <WindowManager />
      </Desktop>
      <Dock />
      <Notifications />
    </div>
  );
};

export default Home;
