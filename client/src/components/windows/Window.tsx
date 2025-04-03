import React, { useState, useRef, useEffect } from 'react';
import { useWindow } from '@/contexts/WindowContext';
import { cn } from '@/lib/utils';

interface WindowProps {
  id: string;
  title: string;
  color: string;
  icon: string;
  children: React.ReactNode;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  isMinimized?: boolean;
  isMaximized?: boolean;
}

const Window: React.FC<WindowProps> = ({
  id,
  title,
  color,
  icon,
  children,
  position,
  size,
  zIndex,
  isMinimized = false,
  isMaximized = false
}) => {
  const { closeWindow, minimizeWindow, maximizeWindow, restoreWindow, focusWindow, moveWindow } = useWindow();
  const windowRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Handle dragging
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        moveWindow(id, newX, newY);
      }
    };

    const onMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging, dragOffset, id, moveWindow]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only start dragging if clicking on the header (not on buttons)
    if (e.target instanceof HTMLElement && !e.target.closest('button')) {
      focusWindow(id);
      setIsDragging(true);
      
      // Calculate offset from the top-left corner of the window
      if (windowRef.current) {
        const rect = windowRef.current.getBoundingClientRect();
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    }
  };

  // Handle window focus on click
  const handleWindowClick = () => {
    focusWindow(id);
  };

  // Calculate window styles
  const windowStyles: React.CSSProperties = {
    left: position.x,
    top: position.y,
    width: isMaximized ? '100%' : `${size.width}px`,
    height: isMaximized ? '100%' : `${size.height}px`,
    zIndex,
    position: 'absolute',
    display: isMinimized ? 'none' : 'flex',
    flexDirection: 'column'
  };

  return (
    <div
      ref={windowRef}
      className="window"
      style={windowStyles}
      onClick={handleWindowClick}
    >
      <div 
        ref={headerRef}
        className={cn(`window-header window-header-${color}`)}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full bg-phixeo-${color} flex items-center justify-center mr-3`}>
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d={icon}></path>
            </svg>
          </div>
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <div className="flex space-x-2">
          <button 
            className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white hover:bg-opacity-10"
            onClick={() => minimizeWindow(id)}
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 12H6"></path>
            </svg>
          </button>
          <button 
            className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white hover:bg-opacity-10"
            onClick={() => closeWindow(id)}
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
      <div className="window-content">
        {children}
      </div>
    </div>
  );
};

export default Window;
