import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import PhixeoEditor from './PhixeoEditor';
import { Progress } from '@/components/ui/progress';
import { 
  Terminal, 
  Cpu, 
  HardDrive, 
  Activity, 
  Database, 
  Shield, 
  Code, 
  Zap, 
  MessagesSquare,
  Settings,
  FileText,
  Folder,
  Clock,
  BarChart,
  AlertTriangle
} from 'lucide-react';

// Calculate the current time for the OS interface
const getCurrentTime = () => {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * PhixeoOS Component - Demonstrates the Phixeo OS interface
 */
const PhixeoOS: React.FC = () => {
  const [command, setCommand] = useState('');
  const [messages, setMessages] = useState<Array<{type: 'user' | 'system', content: string}>>([
    { type: 'system', content: 'Welcome to Phixeo OS v1.0. How can I assist you today?' }
  ]);
  const [loading, setLoading] = useState(false);
  const [systemMetrics, setSystemMetrics] = useState({
    cpu: 32,
    memory: 48,
    disk: 25,
    network: 15
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentTime, setCurrentTime] = useState(getCurrentTime());
  const [alerts, setAlerts] = useState<Array<{id: number, type: string, message: string, level: 'info' | 'warning' | 'error'}>>([
    { id: 1, type: 'security', message: 'System security scan completed', level: 'info' },
    { id: 2, type: 'performance', message: 'Memory usage optimized using fractal allocation', level: 'info' }
  ]);
  
  // Update the OS time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTime());
      
      // Simulate changing system metrics
      setSystemMetrics(prev => ({
        cpu: Math.min(100, Math.max(5, prev.cpu + (Math.random() * 10 - 5))),
        memory: Math.min(100, Math.max(5, prev.memory + (Math.random() * 8 - 4))),
        disk: Math.min(100, Math.max(5, prev.disk + (Math.random() * 4 - 2))),
        network: Math.min(100, Math.max(1, prev.network + (Math.random() * 15 - 7.5)))
      }));
      
      // Occasionally add a new system alert
      if (Math.random() > 0.8) {
        const newAlertTypes = [
          { type: 'optimization', message: 'System optimized using Phixeo algorithms', level: 'info' as const },
          { type: 'security', message: 'Potential security vulnerability detected and fixed', level: 'warning' as const },
          { type: 'performance', message: 'Disk fragmentation reduced by 15%', level: 'info' as const }
        ];
        const newAlert = newAlertTypes[Math.floor(Math.random() * newAlertTypes.length)];
        setAlerts(prev => [...prev, { id: Date.now(), ...newAlert }]);
      }
    }, 10000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Process OS commands using Phixeo's AI capabilities
  const processCommand = async () => {
    if (!command.trim()) return;
    
    // Add user command to messages
    setMessages(prev => [...prev, { type: 'user', content: command }]);
    setLoading(true);
    
    // Process command with a slight delay to simulate Phixeo processing
    setTimeout(() => {
      let response = '';
      
      // Simple command processor
      if (command.toLowerCase().includes('hello') || command.toLowerCase().includes('hi')) {
        response = 'Hello! How can I assist you with Phixeo OS today?';
      }
      else if (command.toLowerCase().includes('help')) {
        response = 'Available commands: system info, optimize system, security status, run diagnostics, open editor';
      }
      else if (command.toLowerCase().includes('system info') || command.toLowerCase().includes('status')) {
        response = `System Information:\n- CPU: ${systemMetrics.cpu.toFixed(1)}% utilized\n- Memory: ${systemMetrics.memory.toFixed(1)}% utilized\n- Disk: ${systemMetrics.disk.toFixed(1)}% utilized\n- Network: ${systemMetrics.network.toFixed(1)}Mbps\n- System uptime: 7d 14h 32m`;
      }
      else if (command.toLowerCase().includes('optimize')) {
        response = 'Optimizing system using fractal algorithms...\nOptimization complete. System performance improved by 27%.';
        // Simulate optimization by reducing resource usage
        setSystemMetrics(prev => ({
          cpu: prev.cpu * 0.7,
          memory: prev.memory * 0.75,
          disk: prev.disk * 0.9,
          network: prev.network * 0.8
        }));
        setAlerts(prev => [...prev, { 
          id: Date.now(), 
          type: 'optimization', 
          message: 'System successfully optimized - resource usage reduced', 
          level: 'info' 
        }]);
      }
      else if (command.toLowerCase().includes('security')) {
        response = 'Security Status: SECURE\nLast scan: Today at 09:23\nThreats detected and neutralized: 0\nEncryption status: Active (Quantum-resistant)';
      }
      else if (command.toLowerCase().includes('diagnos')) {
        response = 'Running system diagnostics using Phixeo fractal algorithms...\n\nDiagnostic complete.\nAll systems functioning within optimal parameters.\nSuggested action: Schedule disk maintenance within next 15 days.';
      }
      else if (command.toLowerCase().includes('editor') || command.toLowerCase().includes('code')) {
        response = 'Opening Phixeo code editor...';
        setActiveTab('editor');
      }
      else {
        response = `Command "${command}" processed. Phixeo AI has analyzed and executed your request efficiently.`;
      }
      
      // Add system response to messages
      setMessages(prev => [...prev, { type: 'system', content: response }]);
      setCommand('');
      setLoading(false);
    }, 500);
  };
  
  // Handle key press for command submission
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      processCommand();
    }
  };
  
  return (
    <div className="w-full flex flex-col space-y-4">
      {/* Top Bar with Clock and Status */}
      <div className="flex justify-between items-center bg-black p-2 rounded-lg text-white">
        <div className="flex items-center">
          <Shield className="h-5 w-5 text-gold mr-2" />
          <span className="text-gold font-bold">Phixeo OS</span>
        </div>
        
        <div className="flex space-x-4 items-center">
          <div className="flex items-center">
            <Activity className="h-4 w-4 text-green-400 mr-1" />
            <span className="text-xs">System Optimal</span>
          </div>
          
          <div className="text-sm font-mono">{currentTime}</div>
        </div>
      </div>
      
      {/* Main Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="bg-black border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-gold">Navigation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              <Button 
                variant="ghost" 
                className={`w-full justify-start font-normal ${activeTab === 'dashboard' ? 'bg-gray-800' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                <BarChart className="mr-2 h-4 w-4 text-gold" />
                <span>Dashboard</span>
              </Button>
              <Button 
                variant="ghost" 
                className={`w-full justify-start font-normal ${activeTab === 'terminal' ? 'bg-gray-800' : ''}`}
                onClick={() => setActiveTab('terminal')}
              >
                <Terminal className="mr-2 h-4 w-4 text-gold" />
                <span>Terminal</span>
              </Button>
              <Button 
                variant="ghost"
                className={`w-full justify-start font-normal ${activeTab === 'editor' ? 'bg-gray-800' : ''}`}
                onClick={() => setActiveTab('editor')}
              >
                <Code className="mr-2 h-4 w-4 text-gold" />
                <span>Code Editor</span>
              </Button>
              <Button 
                variant="ghost"
                className={`w-full justify-start font-normal ${activeTab === 'files' ? 'bg-gray-800' : ''}`}
                onClick={() => setActiveTab('files')}
              >
                <Folder className="mr-2 h-4 w-4 text-gold" />
                <span>File Manager</span>
              </Button>
              <Button 
                variant="ghost"
                className={`w-full justify-start font-normal ${activeTab === 'system' ? 'bg-gray-800' : ''}`}
                onClick={() => setActiveTab('system')}
              >
                <Cpu className="mr-2 h-4 w-4 text-gold" />
                <span>System Monitor</span>
              </Button>
              <Button 
                variant="ghost"
                className={`w-full justify-start font-normal ${activeTab === 'settings' ? 'bg-gray-800' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                <Settings className="mr-2 h-4 w-4 text-gold" />
                <span>Settings</span>
              </Button>
            </CardContent>
          </Card>
          
          {/* System Metrics */}
          <Card className="bg-black border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-gold">System Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>CPU</span>
                  <span>{systemMetrics.cpu.toFixed(1)}%</span>
                </div>
                <Progress value={systemMetrics.cpu} className="h-1" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Memory</span>
                  <span>{systemMetrics.memory.toFixed(1)}%</span>
                </div>
                <Progress value={systemMetrics.memory} className="h-1" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Disk</span>
                  <span>{systemMetrics.disk.toFixed(1)}%</span>
                </div>
                <Progress value={systemMetrics.disk} className="h-1" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Network</span>
                  <span>{systemMetrics.network.toFixed(1)} Mbps</span>
                </div>
                <Progress value={systemMetrics.network} className="h-1" />
              </div>
            </CardContent>
          </Card>
          
          {/* Recent Alerts */}
          <Card className="bg-black border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-gold">Recent Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-48 overflow-auto">
              {alerts.slice(-5).reverse().map(alert => (
                <div 
                  key={alert.id} 
                  className={`p-2 rounded-md flex items-start space-x-2 
                    ${alert.level === 'info' ? 'bg-gray-900' : ''} 
                    ${alert.level === 'warning' ? 'bg-amber-900 bg-opacity-20' : ''} 
                    ${alert.level === 'error' ? 'bg-red-900 bg-opacity-30' : ''}`}
                >
                  {alert.level === 'info' && <Zap className="h-4 w-4 text-gold shrink-0" />}
                  {alert.level === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />}
                  {alert.level === 'error' && <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />}
                  <span className="text-xs">{alert.message}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content Area */}
        <div className="lg:col-span-3">
          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <Card className="bg-black border-gray-800">
              <CardHeader>
                <CardTitle className="text-gold">Phixeo OS Dashboard</CardTitle>
                <CardDescription>System overview and status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* CPU Status */}
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center">
                        <Cpu className="h-4 w-4 mr-2 text-gold" />
                        Processor
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-white">{systemMetrics.cpu.toFixed(1)}%</div>
                      <div className="text-xs text-gray-400">8-core Quantum Processor</div>
                      <Progress value={systemMetrics.cpu} className="h-1 mt-2" />
                    </CardContent>
                  </Card>
                  
                  {/* Memory Status */}
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center">
                        <Activity className="h-4 w-4 mr-2 text-gold" />
                        Memory
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-white">{systemMetrics.memory.toFixed(1)}%</div>
                      <div className="text-xs text-gray-400">7.8 GB / 16 GB Used</div>
                      <Progress value={systemMetrics.memory} className="h-1 mt-2" />
                    </CardContent>
                  </Card>
                  
                  {/* Storage Status */}
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center">
                        <HardDrive className="h-4 w-4 mr-2 text-gold" />
                        Storage
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-white">{systemMetrics.disk.toFixed(1)}%</div>
                      <div className="text-xs text-gray-400">127 GB / 512 GB Used</div>
                      <Progress value={systemMetrics.disk} className="h-1 mt-2" />
                    </CardContent>
                  </Card>
                </div>
                
                {/* System Status Overview */}
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center">
                      <Shield className="h-4 w-4 mr-2 text-gold" />
                      System Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium">Security Status</h3>
                        <div className="flex items-center text-green-400 text-sm mt-1">
                          <Shield className="h-4 w-4 mr-1" />
                          Protected
                        </div>
                        <div className="text-xs text-gray-400 mt-1">Last scan: Today at 09:23</div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium">Optimization</h3>
                        <div className="flex items-center text-gold text-sm mt-1">
                          <Zap className="h-4 w-4 mr-1" />
                          Golden Ratio Optimized
                        </div>
                        <div className="text-xs text-gray-400 mt-1">27% performance improvement</div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium">Network Status</h3>
                        <div className="flex items-center text-green-400 text-sm mt-1">
                          <Activity className="h-4 w-4 mr-1" />
                          Connected
                        </div>
                        <div className="text-xs text-gray-400 mt-1">{systemMetrics.network.toFixed(1)} Mbps</div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium">Data Protection</h3>
                        <div className="flex items-center text-green-400 text-sm mt-1">
                          <Database className="h-4 w-4 mr-1" />
                          Fractal Encryption Active
                        </div>
                        <div className="text-xs text-gray-400 mt-1">Quantum-resistant security</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Recent Activity */}
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gold" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {alerts.slice(-3).reverse().map(alert => (
                        <div key={alert.id} className="flex items-center space-x-2 text-sm">
                          <div className="w-3 h-3 rounded-full bg-gold"></div>
                          <div className="flex-grow">{alert.message}</div>
                          <div className="text-xs text-gray-400">just now</div>
                        </div>
                      ))}
                      <div className="flex items-center space-x-2 text-sm">
                        <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                        <div className="flex-grow">System updated to Phixeo OS v1.0</div>
                        <div className="text-xs text-gray-400">2h ago</div>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                        <div className="flex-grow">Regular system backup completed</div>
                        <div className="text-xs text-gray-400">5h ago</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          )}
          
          {/* Terminal */}
          {activeTab === 'terminal' && (
            <Card className="bg-black border-gray-800">
              <CardHeader>
                <CardTitle className="text-gold">Phixeo Terminal</CardTitle>
                <CardDescription>Interactive AI command processor</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 rounded-md p-4 h-96 overflow-auto flex flex-col">
                  <div className="flex-grow space-y-4">
                    {messages.map((msg, index) => (
                      <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div 
                          className={`max-w-[80%] p-3 rounded-md ${
                            msg.type === 'user' 
                              ? 'bg-gold text-black' 
                              : 'bg-gray-800 text-white'
                          }`}
                        >
                          {msg.content.split('\n').map((line, i) => (
                            <div key={i}>{line}</div>
                          ))}
                        </div>
                      </div>
                    ))}
                    {loading && (
                      <div className="flex justify-start">
                        <div className="bg-gray-800 text-white max-w-[80%] p-3 rounded-md">
                          <div className="flex space-x-2">
                            <div className="h-2 w-2 bg-gold rounded-full animate-bounce"></div>
                            <div className="h-2 w-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="h-2 w-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex mt-4 space-x-2">
                  <Input
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter a command (try 'help', 'system info', 'optimize system')"
                    className="bg-gray-900 border-gray-700"
                  />
                  <Button
                    onClick={processCommand}
                    className="bg-gradient-to-r from-[#B8860B] to-[#FFD700] text-black font-bold hover:opacity-90"
                  >
                    Send
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Code Editor */}
          {activeTab === 'editor' && (
            <PhixeoEditor />
          )}
          
          {/* File Manager (simplified) */}
          {activeTab === 'files' && (
            <Card className="bg-black border-gray-800">
              <CardHeader>
                <CardTitle className="text-gold">File Manager</CardTitle>
                <CardDescription>Fractal file organization system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 rounded-md p-4 h-96 overflow-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <Card className="bg-gray-800 border-gray-700 hover:bg-gray-700 transition-colors cursor-pointer">
                      <CardContent className="p-4 flex flex-col items-center">
                        <Folder className="h-12 w-12 text-gold mb-2" />
                        <div className="text-sm font-medium">Documents</div>
                        <div className="text-xs text-gray-400">15 files</div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gray-800 border-gray-700 hover:bg-gray-700 transition-colors cursor-pointer">
                      <CardContent className="p-4 flex flex-col items-center">
                        <Folder className="h-12 w-12 text-gold mb-2" />
                        <div className="text-sm font-medium">Projects</div>
                        <div className="text-xs text-gray-400">8 projects</div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gray-800 border-gray-700 hover:bg-gray-700 transition-colors cursor-pointer">
                      <CardContent className="p-4 flex flex-col items-center">
                        <Folder className="h-12 w-12 text-gold mb-2" />
                        <div className="text-sm font-medium">Media</div>
                        <div className="text-xs text-gray-400">32 files</div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gray-800 border-gray-700 hover:bg-gray-700 transition-colors cursor-pointer">
                      <CardContent className="p-4 flex flex-col items-center">
                        <FileText className="h-12 w-12 text-blue-400 mb-2" />
                        <div className="text-sm font-medium">report.phx</div>
                        <div className="text-xs text-gray-400">Modified today</div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gray-800 border-gray-700 hover:bg-gray-700 transition-colors cursor-pointer">
                      <CardContent className="p-4 flex flex-col items-center">
                        <FileText className="h-12 w-12 text-green-400 mb-2" />
                        <div className="text-sm font-medium">data_analysis.phx</div>
                        <div className="text-xs text-gray-400">Modified yesterday</div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gray-800 border-gray-700 hover:bg-gray-700 transition-colors cursor-pointer">
                      <CardContent className="p-4 flex flex-col items-center">
                        <FileText className="h-12 w-12 text-gold mb-2" />
                        <div className="text-sm font-medium">system_config.phx</div>
                        <div className="text-xs text-gray-400">Modified 3 days ago</div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* System Monitor */}
          {activeTab === 'system' && (
            <Card className="bg-black border-gray-800">
              <CardHeader>
                <CardTitle className="text-gold">System Monitor</CardTitle>
                <CardDescription>Advanced performance analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs defaultValue="overview">
                  <TabsList className="grid grid-cols-4 mb-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="processes">Processes</TabsTrigger>
                    <TabsTrigger value="storage">Storage</TabsTrigger>
                    <TabsTrigger value="network">Network</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-4">
                    <Card className="bg-gray-900 border-gray-800">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">CPU Usage Timeline</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-48 flex items-end space-x-1">
                          {/* Generate a fake CPU usage graph */}
                          {Array.from({ length: 48 }).map((_, i) => {
                            const value = 30 + Math.sin(i / 3) * 20 + Math.random() * 15;
                            return (
                              <div 
                                key={i} 
                                className="bg-gradient-to-t from-gold to-amber-600 w-full" 
                                style={{ height: `${value}%` }}
                              ></div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="bg-gray-900 border-gray-800">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Memory Allocation</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-40 flex justify-center items-center">
                            {/* Simplified memory allocation visualization */}
                            <div className="w-32 h-32 rounded-full border-8 border-blue-500 relative">
                              <div 
                                className="absolute inset-0 rounded-full border-8 border-gold" 
                                style={{ 
                                  clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos(systemMetrics.memory / 100 * 2 * Math.PI)}% ${50 - 50 * Math.sin(systemMetrics.memory / 100 * 2 * Math.PI)}%, 50% 50%)` 
                                }}
                              ></div>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                  <div className="text-lg font-bold">{systemMetrics.memory.toFixed(1)}%</div>
                                  <div className="text-xs">Memory</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-gray-900 border-gray-800">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">System Health</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Overall Performance</span>
                              <span className="text-sm text-green-400">Excellent</span>
                            </div>
                            <Progress value={92} className="h-1" />
                            
                            <div className="flex justify-between items-center mt-4">
                              <span className="text-sm">Security Status</span>
                              <span className="text-sm text-green-400">Protected</span>
                            </div>
                            <Progress value={100} className="h-1" />
                            
                            <div className="flex justify-between items-center mt-4">
                              <span className="text-sm">Optimization Level</span>
                              <span className="text-sm text-gold">Golden Ratio</span>
                            </div>
                            <Progress value={85} className="h-1" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="processes">
                    <Card className="bg-gray-900 border-gray-800">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Active Processes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 max-h-64 overflow-auto">
                          <div className="grid grid-cols-12 text-xs font-medium text-gray-400 py-2">
                            <div className="col-span-5">Process Name</div>
                            <div className="col-span-2">PID</div>
                            <div className="col-span-2">CPU</div>
                            <div className="col-span-2">Memory</div>
                            <div className="col-span-1">Status</div>
                          </div>
                          
                          {/* Fake process list */}
                          {[
                            { name: 'phixeo_kernel', pid: 1, cpu: 0.2, memory: 45, status: 'R' },
                            { name: 'phixeo_shell', pid: 428, cpu: 0.5, memory: 18, status: 'R' },
                            { name: 'phixeo_ui', pid: 982, cpu: 1.2, memory: 124, status: 'R' },
                            { name: 'fractal_optimizer', pid: 1245, cpu: 0.8, memory: 75, status: 'R' },
                            { name: 'ai_assistant', pid: 1892, cpu: 2.1, memory: 245, status: 'R' },
                            { name: 'phixeo_monitor', pid: 2012, cpu: 0.3, memory: 28, status: 'R' },
                            { name: 'code_analyzer', pid: 2153, cpu: 1.5, memory: 64, status: 'S' },
                            { name: 'task_scheduler', pid: 2214, cpu: 0.1, memory: 22, status: 'R' },
                            { name: 'network_manager', pid: 2356, cpu: 0.4, memory: 36, status: 'R' },
                            { name: 'security_monitor', pid: 2512, cpu: 0.7, memory: 52, status: 'R' }
                          ].map((process, index) => (
                            <div key={index} className="grid grid-cols-12 text-sm py-2 border-t border-gray-800">
                              <div className="col-span-5">{process.name}</div>
                              <div className="col-span-2">{process.pid}</div>
                              <div className="col-span-2">{process.cpu}%</div>
                              <div className="col-span-2">{process.memory} MB</div>
                              <div className="col-span-1">{process.status}</div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="storage">
                    <Card className="bg-gray-900 border-gray-800">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Storage Analysis</CardTitle>
                      </CardHeader>
                      <CardContent className="h-64 flex justify-center items-center">
                        {/* Simplified storage visualization */}
                        <div className="relative w-48 h-48">
                          <div className="absolute inset-0 rounded-full border-8 border-gray-700"></div>
                          <div 
                            className="absolute inset-0 rounded-full border-8 border-gold"
                            style={{ 
                              clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos(systemMetrics.disk / 100 * 2 * Math.PI)}% ${50 - 50 * Math.sin(systemMetrics.disk / 100 * 2 * Math.PI)}%, 50% 50%)` 
                            }}
                          ></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-2xl font-bold">{systemMetrics.disk.toFixed(1)}%</div>
                              <div className="text-sm">Disk Usage</div>
                              <div className="text-xs text-gray-400 mt-1">127 GB / 512 GB</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="network">
                    <Card className="bg-gray-900 border-gray-800">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Network Activity</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-48 flex items-end space-x-1">
                          {/* Generate a fake network usage graph */}
                          {Array.from({ length: 48 }).map((_, i) => {
                            const value = 10 + Math.sin(i / 5) * 8 + Math.random() * 25;
                            return (
                              <div 
                                key={i} 
                                className="bg-gradient-to-t from-blue-600 to-blue-400 w-full" 
                                style={{ height: `${value}%` }}
                              ></div>
                            );
                          })}
                        </div>
                        
                        <div className="mt-4 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Download</span>
                            <span>{(systemMetrics.network * 0.7).toFixed(1)} Mbps</span>
                          </div>
                          <Progress value={systemMetrics.network * 0.7} className="h-1" />
                          
                          <div className="flex justify-between text-sm">
                            <span>Upload</span>
                            <span>{(systemMetrics.network * 0.3).toFixed(1)} Mbps</span>
                          </div>
                          <Progress value={systemMetrics.network * 0.3} className="h-1" />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
          
          {/* Settings */}
          {activeTab === 'settings' && (
            <Card className="bg-black border-gray-800">
              <CardHeader>
                <CardTitle className="text-gold">System Settings</CardTitle>
                <CardDescription>Configure Phixeo OS</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs defaultValue="appearance">
                  <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="appearance">Appearance</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                    <TabsTrigger value="system">System</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="appearance">
                    <Card className="bg-gray-900 border-gray-800">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Theme Settings</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm font-medium mb-2">Theme</div>
                            <div className="flex space-x-2">
                              <div className="w-8 h-8 rounded-full bg-gold border-2 border-white cursor-pointer"></div>
                              <div className="w-8 h-8 rounded-full bg-blue-500 cursor-pointer"></div>
                              <div className="w-8 h-8 rounded-full bg-green-500 cursor-pointer"></div>
                              <div className="w-8 h-8 rounded-full bg-purple-500 cursor-pointer"></div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-sm font-medium mb-2">Mode</div>
                            <div className="flex space-x-2">
                              <Button variant="default" size="sm" className="bg-gray-800">Dark</Button>
                              <Button variant="outline" size="sm">Light</Button>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-sm font-medium mb-2">UI Scaling</div>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="icon" className="h-6 w-6 rounded-full">-</Button>
                            <Progress value={75} className="h-1 flex-grow" />
                            <Button variant="outline" size="icon" className="h-6 w-6 rounded-full">+</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="security">
                    <Card className="bg-gray-900 border-gray-800">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Security Settings</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium">Fractal Encryption</div>
                            <div className="text-xs text-gray-400">Secure data with quantum-resistant encryption</div>
                          </div>
                          <div className="h-6 w-11 bg-gold rounded-full relative">
                            <div className="absolute right-1 top-1 h-4 w-4 bg-black rounded-full"></div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium">Automatic Security Scans</div>
                            <div className="text-xs text-gray-400">Regularly scan system for vulnerabilities</div>
                          </div>
                          <div className="h-6 w-11 bg-gold rounded-full relative">
                            <div className="absolute right-1 top-1 h-4 w-4 bg-black rounded-full"></div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium">Biometric Authentication</div>
                            <div className="text-xs text-gray-400">Use facial recognition for login</div>
                          </div>
                          <div className="h-6 w-11 bg-gray-700 rounded-full relative">
                            <div className="absolute left-1 top-1 h-4 w-4 bg-gray-500 rounded-full"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="system">
                    <Card className="bg-gray-900 border-gray-800">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">System Settings</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium">Performance Mode</div>
                            <div className="text-xs text-gray-400">Optimize system for maximum performance</div>
                          </div>
                          <div className="h-6 w-11 bg-gold rounded-full relative">
                            <div className="absolute right-1 top-1 h-4 w-4 bg-black rounded-full"></div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium">Automatic Updates</div>
                            <div className="text-xs text-gray-400">Keep Phixeo OS up to date</div>
                          </div>
                          <div className="h-6 w-11 bg-gold rounded-full relative">
                            <div className="absolute right-1 top-1 h-4 w-4 bg-black rounded-full"></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-sm font-medium mb-2">AI Assistant Voice</div>
                          <div className="flex space-x-2">
                            <Button variant="default" size="sm" className="bg-gold text-black">Quantum</Button>
                            <Button variant="outline" size="sm">Crystal</Button>
                            <Button variant="outline" size="sm">Nebula</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhixeoOS;