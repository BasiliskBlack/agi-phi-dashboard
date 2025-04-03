import React, { useState, useEffect } from 'react';
import { COLORS, PHI, SPACING, RADIUS, FONT_SIZE } from '@/lib/phixeo-styles';
import PhixeoEditor from './PhixeoEditor';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Terminal, 
  Maximize2, 
  Minimize2, 
  X, 
  Code, 
  BarChart3, 
  Settings, 
  HardDrive, 
  Cpu, 
  Clock,
  Zap,
  BotIcon,
  MessageSquare
} from 'lucide-react';
import PhixeoChat from './PhixeoChat';

type Window = {
  id: string;
  title: string;
  component: React.ReactNode;
  width: number;
  height: number;
  x: number;
  y: number;
  isActive: boolean;
  isMaximized: boolean;
};

type SystemMetrics = {
  cpu: number;
  memory: number;
  optimizationLevel: number;
  efficiency: number;
  storage: number;
  network: number;
};

const DEFAULT_METRICS: SystemMetrics = {
  cpu: 15,
  memory: 25,
  optimizationLevel: 7,
  efficiency: 92,
  storage: 32,
  network: 8
};

const PhixeoOS: React.FC = () => {
  const [windows, setWindows] = useState<Window[]>([]);
  const [activeWindow, setActiveWindow] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<SystemMetrics>(DEFAULT_METRICS);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [phixeoOutput, setPhixeoOutput] = useState("");
  
  // Initialize with default windows
  useEffect(() => {
    const editorWindow: Window = {
      id: 'editor',
      title: 'Phixeo Code Editor',
      component: (
        <PhixeoEditor 
          height="100%" 
          onRunComplete={(result) => {
            // Simulate system optimization
            setTimeout(() => {
              setMetrics(prev => ({
                ...prev,
                efficiency: Math.min(99, prev.efficiency + Math.round(Math.random() * 2)),
                memory: Math.max(5, prev.memory - Math.round(Math.random() * 5)),
                cpu: Math.max(2, prev.cpu - Math.round(Math.random() * 3)),
              }));
            }, 1000);
          }}
        />
      ),
      width: 900,
      height: 600,
      x: window.innerWidth / 2 - 450,
      y: window.innerHeight / 2 - 300,
      isActive: true,
      isMaximized: false,
    };
    
    const terminalWindow: Window = {
      id: 'terminal',
      title: 'Phixeo Terminal',
      component: (
        <div className="terminal w-full h-full p-4 bg-black text-amber-400 font-mono overflow-auto">
          <div className="mb-2">Phixeo OS Terminal v1.0</div>
          <div className="mb-2">Use Phixeo commands to control the system</div>
          <div className="mb-4">Type 'help' for available commands</div>
          
          <div className="flex flex-col">
            <div className="flex">
              <span className="text-amber-600 mr-2">phixeo$</span>
              <span>system.status()</span>
            </div>
            <div className="ml-4 mb-2">
              System running at optimal efficiency<br />
              CPU Usage: {metrics.cpu}%<br />
              Memory Usage: {metrics.memory}%<br />
              Optimization Level: {metrics.optimizationLevel}<br />
              Efficiency Score: {metrics.efficiency}%
            </div>
            
            <div className="flex">
              <span className="text-amber-600 mr-2">phixeo$</span>
              <span>system.optimize()</span>
            </div>
            <div className="ml-4 mb-2">
              Running fractal optimization...<br />
              Applied golden ratio algorithms<br />
              Efficiency increased by {(Math.random() * 5).toFixed(2)}%
            </div>
          </div>
        </div>
      ),
      width: 600,
      height: 400,
      x: window.innerWidth / 2 - 300,
      y: window.innerHeight / 2 - 200,
      isActive: false,
      isMaximized: false,
    };
    
    setWindows([editorWindow, terminalWindow]);
    setActiveWindow('editor');
  }, []);
  
  // Update system metrics periodically to simulate Phixeo optimization
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        cpu: Math.max(2, prev.cpu + (Math.random() > 0.7 ? 1 : -1)),
        memory: Math.max(5, prev.memory + (Math.random() > 0.6 ? 1 : -1)),
        network: Math.max(1, Math.min(100, prev.network + (Math.random() > 0.5 ? 1 : -1))),
      }));
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  const activateWindow = (id: string) => {
    setWindows(prev => 
      prev.map(window => ({
        ...window,
        isActive: window.id === id
      }))
    );
    setActiveWindow(id);
  };
  
  const closeWindow = (id: string) => {
    setWindows(prev => prev.filter(window => window.id !== id));
    if (activeWindow === id) {
      const remainingWindows = windows.filter(window => window.id !== id);
      setActiveWindow(remainingWindows.length > 0 ? remainingWindows[0].id : null);
    }
  };
  
  const maximizeWindow = (id: string) => {
    setWindows(prev => 
      prev.map(window => 
        window.id === id 
          ? { ...window, isMaximized: !window.isMaximized }
          : window
      )
    );
  };
  
  const startDrag = (id: string, e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left mouse button
    
    const window = windows.find(w => w.id === id);
    if (!window) return;
    
    setIsDragging(true);
    activateWindow(id);
    setDragOffset({
      x: e.clientX - window.x,
      y: e.clientY - window.y
    });
    
    // Prevent text selection during drag
    e.preventDefault();
  };
  
  const onDrag = (id: string, e: React.MouseEvent) => {
    if (!isDragging || activeWindow !== id) return;
    
    const window = windows.find(w => w.id === id);
    if (!window || window.isMaximized) return;
    
    setWindows(prev => 
      prev.map(w => 
        w.id === id 
          ? { 
              ...w, 
              x: Math.max(0, Math.min(document.body.clientWidth - w.width, e.clientX - dragOffset.x)),
              y: Math.max(0, Math.min(document.body.clientHeight - w.height, e.clientY - dragOffset.y))
            }
          : w
      )
    );
  };
  
  const stopDrag = () => {
    setIsDragging(false);
  };
  
  const openTerminal = () => {
    // Check if terminal is already open
    const terminalWindow = windows.find(w => w.id === 'terminal');
    if (terminalWindow) {
      activateWindow('terminal');
    } else {
      const newWindow: Window = {
        id: 'terminal',
        title: 'Phixeo Terminal',
        component: (
          <div className="terminal w-full h-full p-4 bg-black text-amber-400 font-mono overflow-auto">
            <div className="mb-2">Phixeo OS Terminal v1.0</div>
            <div className="mb-2">Use Phixeo commands to control the system</div>
            <div className="mb-4">Type 'help' for available commands</div>
            
            <div className="flex flex-col">
              <div className="flex">
                <span className="text-amber-600 mr-2">phixeo$</span>
                <span>system.status()</span>
              </div>
              <div className="ml-4 mb-2">
                System running at optimal efficiency<br />
                CPU Usage: {metrics.cpu}%<br />
                Memory Usage: {metrics.memory}%<br />
                Optimization Level: {metrics.optimizationLevel}<br />
                Efficiency Score: {metrics.efficiency}%
              </div>
            </div>
          </div>
        ),
        width: 600,
        height: 400,
        x: window.innerWidth / 2 - 300,
        y: window.innerHeight / 2 - 200,
        isActive: true,
        isMaximized: false,
      };
      
      setWindows(prev => [...prev, newWindow]);
      setActiveWindow('terminal');
    }
  };
  
  const openEditor = () => {
    // Check if editor is already open
    const editorWindow = windows.find(w => w.id === 'editor');
    if (editorWindow) {
      activateWindow('editor');
    } else {
      const newWindow: Window = {
        id: 'editor',
        title: 'Phixeo Code Editor',
        component: (
          <PhixeoEditor 
            height="100%" 
            onRunComplete={(result) => {
              // Simulate system optimization
              setTimeout(() => {
                setMetrics(prev => ({
                  ...prev,
                  efficiency: Math.min(99, prev.efficiency + Math.round(Math.random() * 2)),
                  memory: Math.max(5, prev.memory - Math.round(Math.random() * 5)),
                  cpu: Math.max(2, prev.cpu - Math.round(Math.random() * 3)),
                }));
              }, 1000);
            }}
          />
        ),
        width: 900,
        height: 600,
        x: window.innerWidth / 2 - 450,
        y: window.innerHeight / 2 - 300,
        isActive: true,
        isMaximized: false,
      };
      
      setWindows(prev => [...prev, newWindow]);
      setActiveWindow('editor');
    }
  };
  
  const openAIChat = () => {
    // Check if AI chat is already open
    const chatWindow = windows.find(w => w.id === 'chat');
    if (chatWindow) {
      activateWindow('chat');
    } else {
      const newWindow: Window = {
        id: 'chat',
        title: 'Phixeo AI Assistant',
        component: <PhixeoChat />,
        width: 450,
        height: 600,
        x: window.innerWidth / 2 - 225,
        y: window.innerHeight / 2 - 300,
        isActive: true,
        isMaximized: false,
      };
      
      setWindows(prev => [...prev, newWindow]);
      setActiveWindow('chat');
    }
  };

  const openSystemMonitor = () => {
    // Check if system monitor is already open
    const monitorWindow = windows.find(w => w.id === 'monitor');
    if (monitorWindow) {
      activateWindow('monitor');
    } else {
      const newWindow: Window = {
        id: 'monitor',
        title: 'Phixeo System Monitor',
        component: (
          <div className="w-full h-full p-6 bg-gray-900 text-amber-400 overflow-auto">
            <h2 className="text-xl font-bold mb-6 text-amber-500">System Metrics</h2>
            
            <div className="grid grid-cols-2 gap-6">
              {/* CPU Usage */}
              <div className="bg-gray-800 p-4 rounded-lg border border-amber-900/30">
                <div className="flex items-center mb-2">
                  <Cpu className="text-amber-500 mr-2" size={20} />
                  <h3 className="text-lg font-medium">CPU Usage</h3>
                </div>
                <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-600 to-amber-500" 
                    style={{ width: `${metrics.cpu}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-2">
                  <span>{metrics.cpu}%</span>
                  <span>Optimized by Phixeo</span>
                </div>
              </div>
              
              {/* Memory Usage */}
              <div className="bg-gray-800 p-4 rounded-lg border border-amber-900/30">
                <div className="flex items-center mb-2">
                  <HardDrive className="text-amber-500 mr-2" size={20} />
                  <h3 className="text-lg font-medium">Memory Usage</h3>
                </div>
                <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-600 to-amber-500" 
                    style={{ width: `${metrics.memory}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-2">
                  <span>{metrics.memory}%</span>
                  <span>Fractal compression active</span>
                </div>
              </div>
              
              {/* Efficiency Score */}
              <div className="bg-gray-800 p-4 rounded-lg border border-amber-900/30">
                <div className="flex items-center mb-2">
                  <Zap className="text-amber-500 mr-2" size={20} />
                  <h3 className="text-lg font-medium">Efficiency Score</h3>
                </div>
                <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-400" 
                    style={{ width: `${metrics.efficiency}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-2">
                  <span>{metrics.efficiency}%</span>
                  <span>Golden ratio optimized</span>
                </div>
              </div>
              
              {/* Network Usage */}
              <div className="bg-gray-800 p-4 rounded-lg border border-amber-900/30">
                <div className="flex items-center mb-2">
                  <BarChart3 className="text-amber-500 mr-2" size={20} />
                  <h3 className="text-lg font-medium">Network Usage</h3>
                </div>
                <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-600 to-amber-500" 
                    style={{ width: `${metrics.network}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-2">
                  <span>{metrics.network}%</span>
                  <span>Neural compression active</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-black/50 rounded-lg border border-amber-900/30">
              <h3 className="text-lg font-medium mb-3 text-amber-500">Phixeo Optimization Summary</h3>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>System optimized with φ (phi) golden ratio algorithms</li>
                <li>Memory usage reduced by {100 - metrics.memory}% through fractal compression</li>
                <li>Neural optimization level: {metrics.optimizationLevel}/10</li>
                <li>Predictive caching enabled for system operations</li>
                <li>Code efficiency increased by {(Math.random() * 80 + 10).toFixed(1)}%</li>
              </ul>
            </div>
          </div>
        ),
        width: 700,
        height: 500,
        x: window.innerWidth / 2 - 350,
        y: window.innerHeight / 2 - 250,
        isActive: true,
        isMaximized: false,
      };
      
      setWindows(prev => [...prev, newWindow]);
      setActiveWindow('monitor');
    }
  };

  return (
    <div 
      className="phixeo-os"
      style={{ 
        width: '100vw', 
        height: '100vh', 
        backgroundColor: COLORS.black,
        background: `radial-gradient(circle at center, ${COLORS.accent1} 0%, ${COLORS.black} 100%)`,
        overflow: 'hidden',
        position: 'relative',
        userSelect: 'none',
      }}
      onMouseUp={stopDrag}
      onMouseLeave={stopDrag}
    >
      {/* Desktop */}
      <div className="desktop-container" style={{ width: '100%', height: '100%' }}>
        {/* Windows */}
        {windows.map(window => (
          <div 
            key={window.id}
            className="window"
            style={{
              position: 'absolute',
              width: window.isMaximized ? '100vw' : `${window.width}px`,
              height: window.isMaximized ? '100vh' : `${window.height}px`,
              left: window.isMaximized ? 0 : window.x,
              top: window.isMaximized ? 0 : window.y,
              zIndex: window.isActive ? 10 : 5,
              borderRadius: window.isMaximized ? 0 : RADIUS.md,
              overflow: 'hidden',
              boxShadow: window.isActive 
                ? `0 10px 25px rgba(0,0,0,0.3), 0 0 8px ${COLORS.goldAlpha(0.2)}`
                : '0 5px 15px rgba(0,0,0,0.2)',
              border: `1px solid ${window.isActive ? COLORS.darkGold : COLORS.accent1}`,
              transition: 'box-shadow 0.3s ease',
            }}
            onClick={() => activateWindow(window.id)}
          >
            {/* Window Header */}
            <div 
              className="window-header"
              style={{
                height: '40px',
                backgroundColor: COLORS.accent1,
                borderBottom: `1px solid ${window.isActive ? COLORS.darkGold : COLORS.accent1}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: `0 ${SPACING.md}`,
                cursor: 'move',
              }}
              onMouseDown={(e) => startDrag(window.id, e)}
              onMouseMove={(e) => onDrag(window.id, e)}
            >
              <div style={{ 
                fontWeight: 'bold', 
                color: window.isActive ? COLORS.gold : COLORS.gray,
                display: 'flex',
                alignItems: 'center',
                gap: SPACING.sm
              }}>
                {window.id === 'editor' && <Code size={18} />}
                {window.id === 'terminal' && <Terminal size={18} />}
                {window.id === 'monitor' && <BarChart3 size={18} />}
                {window.id === 'chat' && <MessageSquare size={18} />}
                {window.title}
              </div>
              <div style={{ display: 'flex', gap: SPACING.sm }}>
                <button 
                  className="window-control"
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    backgroundColor: '#FFC107',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: window.isActive ? 1 : 0.5,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    maximizeWindow(window.id);
                  }}
                >
                  {window.isMaximized ? 
                    <Minimize2 size={8} color="#000" /> : 
                    <Maximize2 size={8} color="#000" />
                  }
                </button>
                <button 
                  className="window-control"
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    backgroundColor: '#F44336',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: window.isActive ? 1 : 0.5,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    closeWindow(window.id);
                  }}
                >
                  <X size={8} color="#000" />
                </button>
              </div>
            </div>
            
            {/* Window Content */}
            <div 
              className="window-content"
              style={{
                height: 'calc(100% - 40px)',
                overflow: 'auto',
                backgroundColor: '#1E1E1E',
              }}
            >
              {window.component}
            </div>
          </div>
        ))}
      </div>
      
      {/* Dock */}
      <div 
        className="dock"
        style={{
          position: 'absolute',
          bottom: SPACING.md,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: SPACING.md,
          padding: SPACING.sm,
          borderRadius: RADIUS.lg,
          backgroundColor: COLORS.blackAlpha(0.7),
          backdropFilter: 'blur(10px)',
          border: `1px solid ${COLORS.accent1}`,
        }}
      >
        <button 
          className="dock-icon phixeo-fractal"
          style={{
            width: '50px',
            height: '50px',
            borderRadius: RADIUS.md,
            backgroundColor: windows.some(w => w.id === 'editor' && w.isActive) 
              ? COLORS.accent1 
              : 'transparent',
            border: `1px solid ${windows.some(w => w.id === 'editor') ? COLORS.darkGold : 'transparent'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: COLORS.gold,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onClick={openEditor}
        >
          <Code size={24} />
        </button>
        
        <button 
          className="dock-icon"
          style={{
            width: '50px',
            height: '50px',
            borderRadius: RADIUS.md,
            backgroundColor: windows.some(w => w.id === 'terminal' && w.isActive) 
              ? COLORS.accent1 
              : 'transparent',
            border: `1px solid ${windows.some(w => w.id === 'terminal') ? COLORS.darkGold : 'transparent'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: COLORS.gold,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onClick={openTerminal}
        >
          <Terminal size={24} />
        </button>
        
        <button 
          className="dock-icon"
          style={{
            width: '50px',
            height: '50px',
            borderRadius: RADIUS.md,
            backgroundColor: windows.some(w => w.id === 'monitor' && w.isActive) 
              ? COLORS.accent1 
              : 'transparent',
            border: `1px solid ${windows.some(w => w.id === 'monitor') ? COLORS.darkGold : 'transparent'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: COLORS.gold,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onClick={openSystemMonitor}
        >
          <BarChart3 size={24} />
        </button>
        
        <button 
          className="dock-icon"
          style={{
            width: '50px',
            height: '50px',
            borderRadius: RADIUS.md,
            backgroundColor: windows.some(w => w.id === 'chat' && w.isActive) 
              ? COLORS.accent1 
              : 'transparent',
            border: `1px solid ${windows.some(w => w.id === 'chat') ? COLORS.darkGold : 'transparent'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: COLORS.gold,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onClick={openAIChat}
        >
          <MessageSquare size={24} />
        </button>
        
        <button 
          className="dock-icon"
          style={{
            width: '50px',
            height: '50px',
            borderRadius: RADIUS.md,
            backgroundColor: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: COLORS.gold,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <Settings size={24} />
        </button>
      </div>
      
      {/* Status bar */}
      <div 
        className="status-bar"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '28px',
          backgroundColor: COLORS.blackAlpha(0.8),
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `0 ${SPACING.md}`,
          borderBottom: `1px solid ${COLORS.accent1}`,
          color: COLORS.gold,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.md }}>
          <span style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: SPACING.xs }}>
            <span className="phi-icon">φ</span> Phixeo OS
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.md }}>
          <Badge variant="outline" className="bg-amber-950/30 text-amber-500 border-amber-700/30">
            <Cpu size={14} className="mr-1" /> {metrics.cpu}%
          </Badge>
          <Badge variant="outline" className="bg-amber-950/30 text-amber-500 border-amber-700/30">
            <HardDrive size={14} className="mr-1" /> {metrics.memory}%
          </Badge>
          <Badge variant="outline" className="bg-amber-950/30 text-amber-500 border-amber-700/30">
            <Zap size={14} className="mr-1" /> {metrics.efficiency}%
          </Badge>
          <span>
            <Clock size={16} className="inline-block mr-1" />
            {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PhixeoOS;