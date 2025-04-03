import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { WebSocket, WebSocketServer } from "ws";
import { 
  insertSystemMetricsSchema, 
  insertConversationSchema, 
  insertFileSchema 
} from "@shared/schema";

// Extend Express Request interface to include session
declare module 'express-session' {
  interface SessionData {
    userId?: string;
    username?: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Set up WebSocket server for real-time updates
  // Use a specific path to avoid conflicts with Vite's WebSocket
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: '/ws'
  });
  
  // WebSocket connection handling
  wss.on('connection', (ws: WebSocket) => {
    console.log('Client connected');
    
    // Send initial system state
    const initialData = {
      type: 'initialState',
      metrics: {
        cpu: {
          usage: 68,
          cores: 8,
          frequency: 3.5
        },
        memory: {
          total: 16384, // MB
          used: 6860,
          available: 9524,
          percent: 42
        },
        disk: {
          total: 524288, // MB
          used: 125829,
          available: 398459,
          percent: 24
        },
        network: {
          speed: 12,
          connections: 45
        },
        temperature: 48
      }
    };
    
    ws.send(JSON.stringify(initialData));
    
    // Set up interval to send updated metrics
    const metricsInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        const metrics = generateRandomMetrics();
        ws.send(JSON.stringify({
          type: 'metricsUpdate',
          metrics
        }));
      }
    }, 2000);
    
    // Handle client messages
    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle different message types
        if (data.type === 'command') {
          handleCommand(data.command, ws);
        } else if (data.type === 'aiQuery') {
          handleAIQuery(data.query, ws);
        }
      } catch (err) {
        console.error('Error processing message:', err);
      }
    });
    
    // Clean up on disconnect
    ws.on('close', () => {
      console.log('Client disconnected');
      clearInterval(metricsInterval);
    });
  });
  
  // System metrics endpoint
  app.get('/api/metrics', (req, res) => {
    const metrics = generateRandomMetrics();
    res.json(metrics);
  });
  
  // Save system metrics
  app.post('/api/metrics', async (req, res) => {
    try {
      const data = insertSystemMetricsSchema.parse(req.body);
      const result = await storage.createSystemMetrics(data);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: 'Invalid metrics data' });
    }
  });
  
  // File system endpoints
  app.get('/api/files', (req, res) => {
    const path = req.query.path as string || '/';
    const files = getFiles(path);
    res.json(files);
  });
  
  app.post('/api/files', async (req, res) => {
    try {
      const data = insertFileSchema.parse(req.body);
      const file = await storage.createFile(data);
      res.status(201).json(file);
    } catch (error) {
      res.status(400).json({ error: 'Invalid file data' });
    }
  });
  
  // AI conversation endpoints
  app.post('/api/ai/conversation', async (req, res) => {
    try {
      const { message } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Invalid message format' });
      }
      
      // Process the AI response
      const aiResponse = await processAIResponse(message);
      
      // Save the conversation if user is authenticated
      if (req.session && req.session.userId) {
        const userId = parseInt(req.session.userId, 10);
        const conversationData = {
          userId,
          userMessage: message,
          aiResponse
        };
        
        await storage.createConversation(conversationData);
      }
      
      res.json({ response: aiResponse });
    } catch (error) {
      res.status(500).json({ error: 'Error processing AI request' });
    }
  });
  
  // User management endpoints
  app.post('/api/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) { // In production, use proper password hashing
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Set user in session
      if (req.session) {
        req.session.userId = user.id.toString();
        req.session.username = user.username;
      }
      
      res.json({ 
        id: user.id, 
        username: user.username, 
        displayName: user.displayName || username,
        role: user.role 
      });
    } catch (error) {
      res.status(500).json({ error: 'Login failed' });
    }
  });
  
  app.post('/api/logout', (req, res) => {
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ error: 'Logout failed' });
        }
        res.json({ success: true });
      });
    } else {
      res.json({ success: true });
    }
  });
  
  app.get('/api/user', async (req, res) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    try {
      const user = await storage.getUser(req.session.userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({ 
        id: user.id, 
        username: user.username, 
        displayName: user.displayName || user.username,
        role: user.role 
      });
    } catch (error) {
      res.status(500).json({ error: 'Error fetching user' });
    }
  });
  
  return httpServer;
}

// Helper functions

// Generate random system metrics for simulation
function generateRandomMetrics() {
  const cpuUsage = Math.floor(20 + Math.random() * 70);
  const memoryUsage = Math.floor(20 + Math.random() * 50);
  const diskUsage = Math.floor(10 + Math.random() * 40);
  const networkSpeed = Math.floor(1 + Math.random() * 50);
  
  return {
    cpu: {
      usage: cpuUsage,
      cores: 8,
      frequency: 3.5 + Math.random() * 0.2
    },
    memory: {
      total: 16384, // MB
      used: Math.round((16384 * memoryUsage) / 100),
      available: 16384 - Math.round((16384 * memoryUsage) / 100),
      percent: memoryUsage
    },
    disk: {
      total: 524288, // MB
      used: Math.round((524288 * diskUsage) / 100),
      available: 524288 - Math.round((524288 * diskUsage) / 100),
      percent: diskUsage
    },
    network: {
      speed: networkSpeed,
      connections: Math.floor(30 + Math.random() * 30)
    },
    temperature: Math.floor(40 + Math.random() * 15),
    processes: updateProcesses()
  };
}

// Update process information
function updateProcesses() {
  const baseProcesses = [
    {
      id: 1024,
      name: 'phixeo_monitor.py',
      cpu: 28.5,
      memory: 420,
      status: 'running' as const
    },
    {
      id: 1025,
      name: 'phixeo_parser.py',
      cpu: 15.2,
      memory: 250,
      status: 'running' as const
    },
    {
      id: 1026,
      name: 'phixeo_security.py',
      cpu: 9.8,
      memory: 180,
      status: 'running' as const
    },
    {
      id: 1027,
      name: 'phixeo_runtime.py',
      cpu: 7.3,
      memory: 120,
      status: 'waiting' as const
    }
  ];
  
  return baseProcesses.map(process => {
    const newCpu = Math.min(100, Math.max(1, process.cpu + (Math.random() > 0.5 ? 1 : -1) * Math.random() * 5));
    const newMemory = Math.min(1000, Math.max(50, process.memory + (Math.random() > 0.5 ? 10 : -10) * Math.random()));
    const newStatus = Math.random() > 0.95 
      ? (process.status === 'running' ? 'waiting' : 'running') 
      : process.status;
      
    return {
      ...process,
      cpu: newCpu,
      memory: newMemory,
      status: newStatus
    };
  });
}

// Handle terminal commands
function handleCommand(command: string, ws: WebSocket) {
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
    const metrics = generateRandomMetrics();
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
  
  ws.send(JSON.stringify({
    type: 'commandResponse',
    response
  }));
}

// Process AI responses
async function processAIResponse(query: string): Promise<string> {
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
  const lowercaseQuery = query.toLowerCase();
  for (const [keyword, response] of Object.entries(responses)) {
    if (lowercaseQuery.includes(keyword)) {
      return response;
    }
  }
  
  // If no keyword match, return a random default response
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

// Handle AI queries
function handleAIQuery(query: string, ws: WebSocket) {
  // Simulate AI processing time
  setTimeout(async () => {
    const response = await processAIResponse(query);
    
    ws.send(JSON.stringify({
      type: 'aiResponse',
      response
    }));
  }, 1000 + Math.random() * 1000);
}

// Get files for a given path
function getFiles(path: string) {
  const defaultFileSystem = [
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
  
  const modulesFiles = [
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
  ];
  
  const dataFiles = [
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
  ];
  
  const configFiles = [
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
  ];
  
  if (path === '/') {
    return defaultFileSystem;
  } else if (path === '/modules') {
    return modulesFiles;
  } else if (path === '/data') {
    return dataFiles;
  } else if (path === '/config') {
    return configFiles;
  }
  
  // Default to empty directory
  return [];
}
