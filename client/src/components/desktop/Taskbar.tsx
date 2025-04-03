import React from 'react';
import { useWindow } from '@/contexts/WindowContext';
import { useSystem } from '@/contexts/SystemContext';

const Taskbar: React.FC = () => {
  const { openWindow, isWindowOpen } = useWindow();
  const { currentTime, currentDate, userInitials } = useSystem();

  const menuItems = [
    { name: 'Dashboard', type: 'system-monitor' as const, active: isWindowOpen('system-monitor') },
    { name: 'Monitor', type: 'system-monitor' as const, active: false },
    { name: 'Editor', type: 'code-editor' as const, active: isWindowOpen('code-editor') },
    { name: 'Security', type: 'terminal' as const, active: false },
    { name: 'Licensing', type: 'file-explorer' as const, active: false }
  ];

  const handleMenuClick = (type: any) => {
    openWindow(type);
  };

  return (
    <header className="bg-phixeo-card border-b border-gray-800 h-12 flex items-center px-4 z-30">
      <div className="w-8 h-8 rounded-full bg-phixeo-purple flex items-center justify-center mr-4">
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd"></path>
        </svg>
      </div>
      
      <div className="flex space-x-4">
        {menuItems.map((item, index) => (
          <div 
            key={index}
            className={`px-3 py-1 rounded-md text-sm font-medium ${item.active ? 'bg-phixeo-highlight' : 'text-opacity-70'} cursor-pointer`}
            onClick={() => handleMenuClick(item.type)}
          >
            {item.name}
          </div>
        ))}
      </div>
      
      <div className="ml-auto flex items-center space-x-4">
        <div className="text-sm text-phixeo-text opacity-70">{currentTime}</div>
        <div className="flex items-center">
          <svg className="w-4 h-4 text-phixeo-teal mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          <span className="text-xs opacity-70">{currentDate}</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-phixeo-blue flex items-center justify-center">
          <span className="text-xs font-medium">{userInitials}</span>
        </div>
      </div>
    </header>
  );
};

export default Taskbar;
