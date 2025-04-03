import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { getRandomInt, generateRandomCPUUsage, generateRandomMemoryUsage, generateRandomDiskUsage, generateRandomNetworkUsage } from '@/lib/utils';

interface SystemMetrics {
  cpu: {
    usage: number;
    cores: number;
    frequency: number;
  };
  memory: {
    total: number;
    available: number;
    used: number;
    percent: number;
  };
  disk: {
    total: number;
    used: number;
    available: number;
    percent: number;
  };
  network: {
    speed: number;
    connections: number;
  };
  temperature: number;
  processes: Process[];
  performanceHistory: {
    cpu: number[];
    memory: number[];
    network: number[];
  };
}

interface Process {
  id: number;
  name: string;
  cpu: number;
  memory: number;
  status: 'running' | 'waiting' | 'stopped';
}

interface AIMessage {
  id: string;
  sender: 'ai' | 'user';
  content: string;
  timestamp: Date;
}

interface SystemContextType {
  metrics: SystemMetrics;
  aiMessages: AIMessage[];
  addUserMessage: (content: string) => void;
  addAIResponse: (content: string) => void;
  sendCommand: (command: string) => void;
  currentTime: string;
  currentDate: string;
  userName: string;
  userInitials: string;
  refreshMetrics: () => void;
  notifications: Notification[];
  dismissNotification: (id: string) => void;
  files: FileItem[];
  navigateDirectory: (path: string) => void;
  currentDirectory: string;
  isConnected: boolean;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error';
  timestamp: Date;
}

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'directory';
  size?: number;
  lastModified: Date;
  path: string;
}

const SystemContext = createContext<SystemContextType | undefined>(undefined);

const defaultProcesses: Process[] = [
  {
    id: 1024,
    name: 'phixeo_monitor.py',
    cpu: 28.5,
    memory: 420,
    status: 'running'
  },
  {
    id: 1025,
    name: 'phixeo_parser.py',
    cpu: 15.2,
    memory: 250,
    status: 'running'
  },
  {
    id: 1026,
    name: 'phixeo_security.py',
    cpu: 9.8,
    memory: 180,
    status: 'running'
  },
  {
    id: 1027,
    name: 'phixeo_runtime.py',
    cpu: 7.3,
    memory: 120,
    status: 'waiting'
  }
];

const defaultFileSystem: FileItem[] = [
  {
    id: '1',
    name: 'phixeo_os.py',
    type: 'file',
    size: 32768,
    lastModified: new Date('2023-07-12'),
    path: '/phixeo_os.py'
  },
  {
    id: '2',
    name: 'phixeo_parser.py',
    type: 'file',
    size: 16384,
    lastModified: new Date('2023-07-10'),
    path: '/phixeo_parser.py'
  },
  {
    id: '3',
    name: 'phixeo_security.py',
    type: 'file',
    size: 24576,
    lastModified: new Date('2023-07-11'),
    path: '/phixeo_security.py'
  },
  {
    id: '4',
    name: 'phixeo_runtime.py',
    type: 'file',
    size: 8192,
    lastModified: new Date('2023-07-13'),
    path: '/phixeo_runtime.py'
  },
  {
    id: '5',
    name: 'modules',
    type: 'directory',
    lastModified: new Date('2023-07-01'),
    path: '/modules'
  },
  {
    id: '6',
    name: 'data',
    type: 'directory',
    lastModified: new Date('2023-07-05'),
    path: '/data'
  },
  {
    id: '7',
    name: 'config',
    type: 'directory',
    lastModified: new Date('2023-07-03'),
    path: '/config'
  }
];

export const SystemProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: {
      usage: 68,
      cores: 8,
      frequency: 3.5
    },
    memory: {
      total: 16384, // MB
      used: 6860,   // MB
      available: 9524,
      percent: 42
    },
    disk: {
      total: 524288, // MB (512 GB)
      used: 125829,  // MB
      available: 398459,
      percent: 24
    },
    network: {
      speed: 12, // Mbps
      connections: 45
    },
    temperature: 48,
    processes: defaultProcesses,
    performanceHistory: {
      cpu: Array(20).fill(0).map(() => getRandomInt(20, 90)),
      memory: Array(20).fill(0).map(() => getRandomInt(20, 70)),
      network: Array(20).fill(0).map(() => getRandomInt(1, 50))
    }
  });

  const [aiMessages, setAIMessages] = useState<AIMessage[]>([
    {
      id: '1',
      sender: 'ai',
      content: 'Welcome to Phixeo OS. How can I assist you today?',
      timestamp: new Date()
    }
  ]);

  const [currentTime, setCurrentTime] = useState<string>(
    new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  );

  const [currentDate, setCurrentDate] = useState<string>(
    new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  );

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'System Update Available',
      message: 'Phixeo Runtime v1.2.4 is ready to install',
      type: 'info',
      timestamp: new Date()
    }
  ]);

  const [files, setFiles] = useState<FileItem[]>(defaultFileSystem);
  const [currentDirectory, setCurrentDirectory] = useState<string>('/');

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })
      );
      setCurrentDate(
        now.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        })
      );
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Simulate system metrics updates
  const refreshMetrics = () => {
    // Generate new random values
    const newCpuUsage = generateRandomCPUUsage();
    const newMemoryUsage = generateRandomMemoryUsage();
    const newDiskUsage = generateRandomDiskUsage();
    const newNetworkSpeed = generateRandomNetworkUsage();

    // Calculate actual memory values based on percentage
    const totalMemory = 16384; // 16 GB
    const usedMemory = Math.round((totalMemory * newMemoryUsage) / 100);
    const availableMemory = totalMemory - usedMemory;

    // Calculate actual disk values based on percentage
    const totalDisk = 524288; // 512 GB
    const usedDisk = Math.round((totalDisk * newDiskUsage) / 100);
    const availableDisk = totalDisk - usedDisk;

    // Update performance history
    const updatedCpuHistory = [...metrics.performanceHistory.cpu.slice(1), newCpuUsage];
    const updatedMemoryHistory = [...metrics.performanceHistory.memory.slice(1), newMemoryUsage];
    const updatedNetworkHistory = [...metrics.performanceHistory.network.slice(1), newNetworkSpeed];

    // Update processes with random variations
    const updatedProcesses = metrics.processes.map(process => ({
      ...process,
      cpu: Math.min(100, Math.max(1, process.cpu + (Math.random() > 0.5 ? 1 : -1) * Math.random() * 5)),
      memory: Math.min(1000, Math.max(50, process.memory + (Math.random() > 0.5 ? 10 : -10) * Math.random())),
      status: Math.random() > 0.95 ? (process.status === 'running' ? 'waiting' : 'running') : process.status
    }));

    setMetrics({
      cpu: {
        usage: newCpuUsage,
        cores: 8,
        frequency: 3.5 + Math.random() * 0.2
      },
      memory: {
        total: totalMemory,
        used: usedMemory,
        available: availableMemory,
        percent: newMemoryUsage
      },
      disk: {
        total: totalDisk,
        used: usedDisk,
        available: availableDisk,
        percent: newDiskUsage
      },
      network: {
        speed: newNetworkSpeed,
        connections: Math.floor(30 + Math.random() * 30)
      },
      temperature: Math.floor(40 + Math.random() * 15),
      processes: updatedProcesses,
      performanceHistory: {
        cpu: updatedCpuHistory,
        memory: updatedMemoryHistory,
        network: updatedNetworkHistory
      }
    });
  };

  // WebSocket connection for real-time updates
  const wsRef = useRef<WebSocket | null>(null);
  
  // Handle sending AI queries to the server
  const sendAIQuery = useCallback((query: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'aiQuery',
        query
      }));
    }
  }, []);

  // Handle sending commands to the server
  const sendCommand = useCallback((command: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'command',
        command
      }));
    } else {
      console.log(`Executing local command: ${command}`);
      // Simulate command response locally
      setTimeout(() => {
        let response = '';
        const cmd = command.trim().toLowerCase();
        
        if (cmd === 'help') {
          response = `
Available commands:
  help        - Display this help message
  clear       - Clear the terminal
  ls          - List files in the current directory
  status      - Show system status
  about       - About Phixeo OS
  optimize    - Run system optimization
  exit        - Exit terminal
`;
        } else if (cmd === 'ls') {
          response = `
Directory listing for /home/phixeo:
  phixeo_os.py
  phixeo_parser.py
  phixeo_security.py
  phixeo_runtime.py
  modules/
  data/
  config/
`;
        } else if (cmd === 'status') {
          response = `
System Status:
  CPU: ${metrics.cpu.usage}% usage (${metrics.cpu.cores} cores @ ${metrics.cpu.frequency.toFixed(1)}GHz)
  Memory: ${(metrics.memory.used / 1024).toFixed(1)}GB/${(metrics.memory.total / 1024).toFixed(1)}GB (${metrics.memory.percent}% used)
  Disk: ${(metrics.disk.used / 1024).toFixed(1)}GB/${(metrics.disk.total / 1024).toFixed(1)}GB (${metrics.disk.percent}% used)
  Network: ${metrics.network.speed}Mbps, ${metrics.network.connections} connections
  Security Status: No threats detected
  Runtime Efficiency: ${(98 + Math.random() * 1.5).toFixed(1)}%
`;
        } else if (cmd === 'about') {
          response = `
Phixeo OS v1.2.4
==============
A revolutionary AI-powered operating system utilizing the Phixeo programming language.
Built with golden ratio-based geometric constants and fractal optimization.

Features:
- Advanced AI assistance with context awareness
- Visual programming through fractal node architecture
- O(log n) complexity for code compilation
- Neural processing for optimal code path prediction
- Memory optimization via tetrahedral constants

Copyright (c) 2023 Phixeo Technologies
`;
        } else if (cmd === 'optimize') {
          response = `
[OPTIMIZATION] Starting system optimization...
[OPTIMIZATION] Analyzing memory patterns...
[OPTIMIZATION] Applying golden ratio algorithm...
[OPTIMIZATION] Restructuring tetrahedral nodes...
[OPTIMIZATION] Optimizing fractal connections...
[OPTIMIZATION] Complete! System efficiency improved by ${(10 + Math.random() * 5).toFixed(1)}%
`;
        } else if (cmd === 'exit') {
          response = 'Closing terminal session...';
        } else {
          response = `Command not found: ${cmd}. Type "help" for available commands.`;
        }
        
        // Add a notification for optimizations
        if (cmd === 'optimize') {
          const newNotification: Notification = {
            id: Date.now().toString(),
            title: 'Optimization Complete',
            message: `System efficiency improved by ${(10 + Math.random() * 5).toFixed(1)}%`,
            type: 'info',
            timestamp: new Date()
          };
          setNotifications(prev => [...prev, newNotification]);
        }
      }, 300 + Math.random() * 200);
    }
  }, [metrics]);

  // Set up WebSocket connection with specific path
  useEffect(() => {
    try {
      // Initially use local updates
      const localUpdateIntervalId = setInterval(refreshMetrics, 5000);
      
      // Protocol detection (ws:// or wss://)
      const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
      const host = window.location.host;
      // Use the specific WebSocket path
      const wsUrl = `${protocol}${host}/ws`;
      
      console.log(`Attempting to connect to WebSocket at ${wsUrl}`);
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      
      ws.onopen = () => {
        console.log('WebSocket connection established');
        setIsConnected(true);
        // Clear local updates if WebSocket connection established
        clearInterval(localUpdateIntervalId);
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'initialState' || data.type === 'metricsUpdate') {
            if (data.metrics) {
              // Keep history and add new values
              const currentMetrics = { ...metrics };
              const updatedCpuHistory = [...currentMetrics.performanceHistory.cpu.slice(1), data.metrics.cpu.usage];
              const updatedMemoryHistory = [...currentMetrics.performanceHistory.memory.slice(1), data.metrics.memory.percent];
              const updatedNetworkHistory = [...currentMetrics.performanceHistory.network.slice(1), data.metrics.network.speed];
              
              setMetrics({
                ...data.metrics,
                processes: data.metrics.processes || currentMetrics.processes,
                performanceHistory: {
                  cpu: updatedCpuHistory,
                  memory: updatedMemoryHistory,
                  network: updatedNetworkHistory
                }
              });
            }
          } else if (data.type === 'aiResponse') {
            addAIResponse(data.response);
          } else if (data.type === 'commandResponse') {
            console.log('Command response:', data.response);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };
      
      ws.onclose = () => {
        console.log('WebSocket connection closed');
        setIsConnected(false);
      };
      
      return () => {
        clearInterval(localUpdateIntervalId);
        if (ws) ws.close();
      };
    } catch (error) {
      console.error('Error setting up WebSocket:', error);
      // Fallback to local updates if WebSocket setup fails
      const intervalId = setInterval(refreshMetrics, 5000);
      return () => clearInterval(intervalId);
    }
  }, []);

  const addUserMessage = (content: string) => {
    const newMessage: AIMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content,
      timestamp: new Date()
    };
    setAIMessages(prev => [...prev, newMessage]);
    
    // Generate simple AI response locally
    setTimeout(() => {
      // Predefined responses based on keywords
      const responses: { [key: string]: string } = {
        'hello': 'Hello! I am the Phixeo AI Assistant. How can I help you today?',
        'help': 'I can assist with system monitoring, code optimization, file management, and explaining Phixeo functionality. Just ask!',
        'what is phixeo': 'Phixeo is a revolutionary programming system that leverages golden ratio-based geometric constants and fractal optimization to dramatically reduce development time.',
        'efficiency': 'Phixeo achieves unprecedented efficiency through its fractal node architecture, which enables O(log n) complexity for code compilation.',
        'features': 'Phixeo features include visual programming, AI-assisted development, neural processing for code path prediction, memory optimization via tetrahedral constants, and much more.',
        'code': 'Phixeo code uses a unique approach based on mathematical constants like the golden ratio (phi = 1.618...) and pi to create optimized data structures.',
        'optimization': 'Our optimization algorithms can reduce development time by up to 90%, compressing what would typically take 1.5-2 years into just minutes.',
        'security': 'Phixeo includes advanced security modules that use neural pattern recognition to identify and neutralize threats in real-time.'
      };
      
      // Default responses for when no keyword match is found
      const defaultResponses = [
        "Phixeo represents a paradigm shift in programming efficiency. By leveraging golden ratio-based geometric constants and fractal optimization, it reduces development time by orders of magnitude.",
        "Our analysis shows Phixeo can compress 1.5-2 years of development effort into mere minutes through its revolutionary visual programming interface and AI acceleration.",
        "Phixeo's efficiency comes from its revolutionary approach to data structures. By using the golden ratio (phi) and tetrahedral constants, it optimizes memory usage in ways traditional languages cannot.",
        "The neural processing capabilities of Phixeo allow it to predict optimal code paths before execution, reducing runtime overhead by up to 87%.",
        "Phixeo's parser has achieved what was previously thought impossible - O(log n) complexity for code compilation through its fractal node architecture."
      ];
      
      // Check if the query contains any of our keywords
      const lowercaseQuery = content.toLowerCase();
      let response = '';
      
      for (const [keyword, resp] of Object.entries(responses)) {
        if (lowercaseQuery.includes(keyword)) {
          response = resp;
          break;
        }
      }
      
      // If no keyword match, return a random default response
      if (!response) {
        response = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
      }
      
      addAIResponse(response);
    }, 1000 + Math.random() * 1000);
  };

  const addAIResponse = (content: string) => {
    const newMessage: AIMessage = {
      id: Date.now().toString(),
      sender: 'ai',
      content,
      timestamp: new Date()
    };
    setAIMessages(prev => [...prev, newMessage]);
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const navigateDirectory = (path: string) => {
    setCurrentDirectory(path);
    
    // In a real application, we would fetch the contents of the directory here
    // For this demo, we'll just simulate different files for different directories
    if (path === '/') {
      setFiles(defaultFileSystem);
    } else if (path === '/modules') {
      setFiles([
        {
          id: 'm1',
          name: 'core',
          type: 'directory',
          lastModified: new Date('2023-07-01'),
          path: '/modules/core'
        },
        {
          id: 'm2',
          name: 'ai',
          type: 'directory',
          lastModified: new Date('2023-07-01'),
          path: '/modules/ai'
        },
        {
          id: 'm3',
          name: 'security',
          type: 'directory',
          lastModified: new Date('2023-07-01'),
          path: '/modules/security'
        },
        {
          id: 'm4',
          name: 'ui',
          type: 'directory',
          lastModified: new Date('2023-07-01'),
          path: '/modules/ui'
        },
        {
          id: 'm5',
          name: '__init__.py',
          type: 'file',
          size: 512,
          lastModified: new Date('2023-07-01'),
          path: '/modules/__init__.py'
        }
      ]);
    } else if (path === '/data') {
      setFiles([
        {
          id: 'd1',
          name: 'metrics.json',
          type: 'file',
          size: 8192,
          lastModified: new Date('2023-07-05'),
          path: '/data/metrics.json'
        },
        {
          id: 'd2',
          name: 'logs',
          type: 'directory',
          lastModified: new Date('2023-07-05'),
          path: '/data/logs'
        },
        {
          id: 'd3',
          name: 'cache',
          type: 'directory',
          lastModified: new Date('2023-07-05'),
          path: '/data/cache'
        }
      ]);
    } else if (path === '/config') {
      setFiles([
        {
          id: 'c1',
          name: 'settings.json',
          type: 'file',
          size: 4096,
          lastModified: new Date('2023-07-03'),
          path: '/config/settings.json'
        },
        {
          id: 'c2',
          name: 'system.conf',
          type: 'file',
          size: 2048,
          lastModified: new Date('2023-07-03'),
          path: '/config/system.conf'
        },
        {
          id: 'c3',
          name: 'ai.conf',
          type: 'file',
          size: 3072,
          lastModified: new Date('2023-07-03'),
          path: '/config/ai.conf'
        }
      ]);
    }
  };

  const userName = 'John Doe';
  const userInitials = 'JD';
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // Update connection status based on WebSocket readyState
  useEffect(() => {
    const checkConnection = () => {
      setIsConnected(wsRef.current?.readyState === WebSocket.OPEN);
    };
    
    const intervalId = setInterval(checkConnection, 2000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <SystemContext.Provider
      value={{
        metrics,
        aiMessages,
        addUserMessage,
        addAIResponse,
        sendCommand,
        currentTime,
        currentDate,
        userName,
        userInitials,
        refreshMetrics,
        notifications,
        dismissNotification,
        files,
        navigateDirectory,
        currentDirectory,
        isConnected
      }}
    >
      {children}
    </SystemContext.Provider>
  );
};

export const useSystem = () => {
  const context = useContext(SystemContext);
  if (context === undefined) {
    throw new Error('useSystem must be used within a SystemProvider');
  }
  return context;
};
