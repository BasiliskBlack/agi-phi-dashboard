import React from 'react';

interface DesktopProps {
  children: React.ReactNode;
}

const Desktop: React.FC<DesktopProps> = ({ children }) => {
  return (
    <div className="flex-1 relative overflow-hidden">
      {children}
    </div>
  );
};

export default Desktop;
