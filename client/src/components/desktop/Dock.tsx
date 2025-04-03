import React from 'react';
import { useWindow } from '@/contexts/WindowContext';

const Dock: React.FC = () => {
  const { openWindow } = useWindow();

  const dockApps = [
    {
      type: 'system-monitor',
      color: 'blue',
      icon: 'M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z'
    },
    {
      type: 'ai-assistant',
      color: 'purple',
      icon: 'M10 12a2 2 0 100-4 2 2 0 000 4z M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z'
    },
    {
      type: 'parser-visualization',
      color: 'teal',
      icon: 'M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z'
    },
    {
      type: 'code-editor',
      color: 'pink',
      icon: 'M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z'
    },
    {
      type: 'file-explorer',
      color: 'orange',
      icon: 'M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z'
    }
  ];

  return (
    <div className="app-dock fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-phixeo-card bg-opacity-70 backdrop-blur-md p-2 rounded-xl flex items-center space-x-2 border border-gray-800 shadow-lg z-20">
      {dockApps.map((app, index) => (
        <button 
          key={index} 
          className={`app-icon bg-phixeo-${app.color} bg-opacity-20 hover:bg-opacity-30`}
          onClick={() => openWindow(app.type as any)}
        >
          <svg className={`w-6 h-6 text-phixeo-${app.color}`} fill="currentColor" viewBox="0 0 20 20">
            <path d={app.icon}></path>
          </svg>
        </button>
      ))}
    </div>
  );
};

export default Dock;
