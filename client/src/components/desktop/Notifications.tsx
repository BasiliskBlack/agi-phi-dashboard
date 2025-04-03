import React from 'react';
import { useSystem } from '@/contexts/SystemContext';

const Notifications: React.FC = () => {
  const { notifications, dismissNotification } = useSystem();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-16 right-4 z-40 space-y-4 w-80">
      {notifications.map((notification) => (
        <div key={notification.id} className="notification bg-phixeo-card border border-phixeo-blue p-4 rounded-lg shadow-lg">
          <div className="flex items-start">
            <div className="w-8 h-8 rounded-full bg-phixeo-blue flex-shrink-0 flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-sm">{notification.title}</h4>
              <p className="text-xs opacity-70 mt-1">{notification.message}</p>
            </div>
            <button 
              className="ml-auto text-gray-400 hover:text-white"
              onClick={() => dismissNotification(notification.id)}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Notifications;
