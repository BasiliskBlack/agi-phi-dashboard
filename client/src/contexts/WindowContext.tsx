import React, { createContext, useContext, useState } from 'react';

export type WindowType = 'ai-assistant' | 'system-monitor' | 'code-editor' | 'parser-visualization' | 'file-explorer' | 'terminal';

interface WindowState {
  id: string;
  type: WindowType;
  title: string;
  isOpen: boolean;
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isMinimized: boolean;
  isMaximized: boolean;
  color: string;
  icon: string;
}

interface WindowContextType {
  windows: WindowState[];
  openWindow: (type: WindowType) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  moveWindow: (id: string, x: number, y: number) => void;
  resizeWindow: (id: string, width: number, height: number) => void;
  getWindowState: (id: string) => WindowState | undefined;
  isWindowOpen: (type: WindowType) => boolean;
  getOpenWindowByType: (type: WindowType) => WindowState | undefined;
}

const WindowContext = createContext<WindowContextType | undefined>(undefined);

// Generate a unique ID
const generateId = () => `window-${Math.random().toString(36).substr(2, 9)}`;

// Default window configurations
const defaultWindowConfigs: Record<
  WindowType,
  Omit<WindowState, 'id' | 'isOpen' | 'zIndex'>
> = {
  'ai-assistant': {
    type: 'ai-assistant',
    title: 'Phixeo AI Assistant',
    position: { x: window.innerWidth - 450, y: 50 },
    size: { width: 380, height: 480 },
    isMinimized: false,
    isMaximized: false,
    color: 'purple',
    icon: 'M10 12a2 2 0 100-4 2 2 0 000 4z M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z'
  },
  'system-monitor': {
    type: 'system-monitor',
    title: 'System Monitor',
    position: { x: 80, y: 100 },
    size: { width: 720, height: 460 },
    isMinimized: false,
    isMaximized: false,
    color: 'blue',
    icon: 'M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z'
  },
  'code-editor': {
    type: 'code-editor',
    title: 'Phixeo Editor',
    position: { x: window.innerWidth - 650, y: window.innerHeight - 350 },
    size: { width: 600, height: 300 },
    isMinimized: false,
    isMaximized: false,
    color: 'pink',
    icon: 'M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z'
  },
  'parser-visualization': {
    type: 'parser-visualization',
    title: 'Phixeo Parser Visualization',
    position: { x: 100, y: window.innerHeight - 430 },
    size: { width: 600, height: 380 },
    isMinimized: false,
    isMaximized: false,
    color: 'teal',
    icon: 'M11.4933 1.16644C11.1989 0.944204 10.8011 0.944204 10.5067 1.16644L3.0067 6.69982C2.7346 6.90632 2.7346 7.32285 3.0067 7.52935L10.5067 13.0627C10.6511 13.1723 10.8256 13.2279 11 13.2279C11.1744 13.2279 11.3489 13.1723 11.4933 13.0627L18.9933 7.52935C19.2654 7.32285 19.2654 6.90632 18.9933 6.69982L11.4933 1.16644ZM11 11.7723L4.87134 7.11458L11 2.45683L17.1287 7.11458L11 11.7723Z M11.4933 7.16644C11.1989 6.9442 10.8011 6.9442 10.5067 7.16644L3.0067 12.6998C2.7346 12.9063 2.7346 13.3228 3.0067 13.5294L10.5067 19.0627C10.6511 19.1723 10.8256 19.2279 11 19.2279C11.1744 19.2279 11.3489 19.1723 11.4933 19.0627L18.9933 13.5294C19.2654 13.3228 19.2654 12.9063 18.9933 12.6998L11.4933 7.16644ZM11 17.7723L4.87134 13.1146L11 8.45683L17.1287 13.1146L11 17.7723Z'
  },
  'file-explorer': {
    type: 'file-explorer',
    title: 'File Explorer',
    position: { x: 200, y: 150 },
    size: { width: 600, height: 400 },
    isMinimized: false,
    isMaximized: false,
    color: 'orange',
    icon: 'M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z'
  },
  'terminal': {
    type: 'terminal',
    title: 'Terminal',
    position: { x: 150, y: 200 },
    size: { width: 600, height: 350 },
    isMinimized: false,
    isMaximized: false,
    color: 'pink',
    icon: 'M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z'
  }
};

export const WindowProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [windows, setWindows] = useState<WindowState[]>([
    // Initialize with some default windows
    {
      id: generateId(),
      ...defaultWindowConfigs['ai-assistant'],
      isOpen: true,
      zIndex: 10
    },
    {
      id: generateId(),
      ...defaultWindowConfigs['system-monitor'],
      isOpen: true,
      zIndex: 5
    },
    {
      id: generateId(),
      ...defaultWindowConfigs['code-editor'],
      isOpen: true,
      zIndex: 6
    },
    {
      id: generateId(),
      ...defaultWindowConfigs['parser-visualization'],
      isOpen: true,
      zIndex: 7
    }
  ]);

  const getMaxZIndex = () => {
    return windows.reduce((max, window) => (window.zIndex > max ? window.zIndex : max), 0);
  };

  const openWindow = (type: WindowType) => {
    // Check if window of this type is already open
    const existingWindow = windows.find(w => w.type === type && w.isOpen);
    
    if (existingWindow) {
      // Just focus the existing window
      focusWindow(existingWindow.id);
      return;
    }

    // Create a new window
    const newWindow: WindowState = {
      id: generateId(),
      ...defaultWindowConfigs[type],
      isOpen: true,
      zIndex: getMaxZIndex() + 1
    };

    setWindows([...windows, newWindow]);
  };

  const closeWindow = (id: string) => {
    setWindows(
      windows.map(window =>
        window.id === id ? { ...window, isOpen: false } : window
      )
    );
  };

  const minimizeWindow = (id: string) => {
    setWindows(
      windows.map(window =>
        window.id === id ? { ...window, isMinimized: true } : window
      )
    );
  };

  const maximizeWindow = (id: string) => {
    setWindows(
      windows.map(window =>
        window.id === id ? { ...window, isMaximized: true, isMinimized: false } : window
      )
    );
  };

  const restoreWindow = (id: string) => {
    setWindows(
      windows.map(window =>
        window.id === id ? { ...window, isMaximized: false, isMinimized: false } : window
      )
    );
  };

  const focusWindow = (id: string) => {
    const maxZ = getMaxZIndex();
    
    setWindows(
      windows.map(window =>
        window.id === id 
          ? { ...window, zIndex: maxZ + 1, isMinimized: false } 
          : window
      )
    );
  };

  const moveWindow = (id: string, x: number, y: number) => {
    setWindows(
      windows.map(window =>
        window.id === id ? { ...window, position: { x, y } } : window
      )
    );
  };

  const resizeWindow = (id: string, width: number, height: number) => {
    setWindows(
      windows.map(window =>
        window.id === id ? { ...window, size: { width, height } } : window
      )
    );
  };

  const getWindowState = (id: string) => {
    return windows.find(window => window.id === id);
  };

  const isWindowOpen = (type: WindowType) => {
    return windows.some(window => window.type === type && window.isOpen);
  };

  const getOpenWindowByType = (type: WindowType) => {
    return windows.find(window => window.type === type && window.isOpen);
  };

  return (
    <WindowContext.Provider
      value={{
        windows,
        openWindow,
        closeWindow,
        minimizeWindow,
        maximizeWindow,
        restoreWindow,
        focusWindow,
        moveWindow,
        resizeWindow,
        getWindowState,
        isWindowOpen,
        getOpenWindowByType
      }}
    >
      {children}
    </WindowContext.Provider>
  );
};

export const useWindow = () => {
  const context = useContext(WindowContext);
  if (context === undefined) {
    throw new Error('useWindow must be used within a WindowProvider');
  }
  return context;
};
