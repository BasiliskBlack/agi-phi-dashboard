import React, { useEffect } from 'react';
import { useSystem } from '@/contexts/SystemContext';
import { formatBytes } from '@/lib/utils';

const SystemMonitorWindow: React.FC = () => {
  const { metrics, refreshMetrics } = useSystem();

  useEffect(() => {
    // Initial refresh
    refreshMetrics();
  }, [refreshMetrics]);

  return (
    <div className="h-full overflow-auto">
      {/* System Metrics Overview */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-phixeo-highlight rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs opacity-70">CPU Usage</span>
            <span className="text-sm font-medium text-phixeo-blue">{metrics.cpu.usage}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2 mb-1">
            <div 
              className="bg-phixeo-blue h-2 rounded-full" 
              style={{width: `${metrics.cpu.usage}%`}}
            ></div>
          </div>
          <div className="text-xs opacity-50">{metrics.cpu.cores} cores @ {metrics.cpu.frequency.toFixed(1)}GHz</div>
        </div>
        
        <div className="bg-phixeo-highlight rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs opacity-70">Memory</span>
            <span className="text-sm font-medium text-phixeo-purple">{metrics.memory.percent}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2 mb-1">
            <div 
              className="bg-phixeo-purple h-2 rounded-full" 
              style={{width: `${metrics.memory.percent}%`}}
            ></div>
          </div>
          <div className="text-xs opacity-50">{formatBytes(metrics.memory.used * 1024 * 1024)} / {formatBytes(metrics.memory.total * 1024 * 1024)}</div>
        </div>
        
        <div className="bg-phixeo-highlight rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs opacity-70">Disk</span>
            <span className="text-sm font-medium text-phixeo-teal">{metrics.disk.percent}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2 mb-1">
            <div 
              className="bg-phixeo-teal h-2 rounded-full" 
              style={{width: `${metrics.disk.percent}%`}}
            ></div>
          </div>
          <div className="text-xs opacity-50">{formatBytes(metrics.disk.used * 1024 * 1024)} / {formatBytes(metrics.disk.total * 1024 * 1024)}</div>
        </div>
        
        <div className="bg-phixeo-highlight rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs opacity-70">Network</span>
            <span className="text-sm font-medium text-phixeo-orange">{metrics.network.speed} Mbps</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2 mb-1">
            <div 
              className="bg-phixeo-orange h-2 rounded-full" 
              style={{width: `${(metrics.network.speed / 50) * 100}%`}}
            ></div>
          </div>
          <div className="text-xs opacity-50">{metrics.network.connections} connections</div>
        </div>
      </div>
      
      {/* Performance Graph */}
      <div className="bg-phixeo-highlight rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium">Performance Metrics</h4>
          <div className="flex space-x-2">
            <span className="px-2 py-1 rounded-md bg-phixeo-blue bg-opacity-20 text-xs text-phixeo-blue">CPU</span>
            <span className="px-2 py-1 rounded-md bg-gray-700 text-xs">Memory</span>
            <span className="px-2 py-1 rounded-md bg-gray-700 text-xs">GPU</span>
          </div>
        </div>
        <div className="h-40 w-full relative">
          {/* Performance Graph SVG */}
          <svg width="100%" height="100%" viewBox="0 0 600 160" preserveAspectRatio="none">
            {/* Grid Lines */}
            <line x1="0" y1="0" x2="600" y2="0" stroke="#333" strokeWidth="1" />
            <line x1="0" y1="40" x2="600" y2="40" stroke="#333" strokeWidth="1" />
            <line x1="0" y1="80" x2="600" y2="80" stroke="#333" strokeWidth="1" />
            <line x1="0" y1="120" x2="600" y2="120" stroke="#333" strokeWidth="1" />
            <line x1="0" y1="160" x2="600" y2="160" stroke="#333" strokeWidth="1" />
            
            {/* CPU Usage Line - Convert history array to SVG path */}
            {metrics.performanceHistory.cpu.length > 0 && (
              <>
                <path 
                  d={metrics.performanceHistory.cpu.map((value, index) => {
                    const x = (index / (metrics.performanceHistory.cpu.length - 1)) * 600;
                    const y = 160 - (value / 100) * 160;
                    return index === 0 ? `M${x},${y}` : `L${x},${y}`;
                  }).join(' ')}
                  fill="none" 
                  stroke="#4B6EAF" 
                  strokeWidth="2" 
                />
                
                {/* CPU Usage Area */}
                <path 
                  d={`${metrics.performanceHistory.cpu.map((value, index) => {
                    const x = (index / (metrics.performanceHistory.cpu.length - 1)) * 600;
                    const y = 160 - (value / 100) * 160;
                    return index === 0 ? `M${x},${y}` : `L${x},${y}`;
                  }).join(' ')} L600,160 L0,160 Z`}
                  fill="url(#cpu-gradient)" 
                  opacity="0.2" 
                />
              </>
            )}
            
            {/* Gradient Definition */}
            <defs>
              <linearGradient id="cpu-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4B6EAF" stopOpacity="1" />
                <stop offset="100%" stopColor="#4B6EAF" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Time labels */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs opacity-50 px-2">
            <span>1m ago</span>
            <span>30s ago</span>
            <span>now</span>
          </div>
        </div>
      </div>
      
      {/* Processes Table */}
      <div className="bg-phixeo-highlight rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium">Active Processes</h4>
          <button className="text-xs px-2 py-1 bg-gray-700 rounded-md hover:bg-gray-600">Optimize</button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs opacity-70 border-b border-gray-700">
              <th className="text-left py-2 font-medium">Process</th>
              <th className="text-left py-2 font-medium">CPU</th>
              <th className="text-left py-2 font-medium">Memory</th>
              <th className="text-left py-2 font-medium">PID</th>
              <th className="text-left py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {metrics.processes.map((process, index) => (
              <tr key={process.id} className={index < metrics.processes.length - 1 ? "border-b border-gray-800" : ""}>
                <td className="py-2 flex items-center">
                  <div className="w-4 h-4 rounded-sm bg-phixeo-blue mr-2"></div>
                  {process.name}
                </td>
                <td className="py-2">{process.cpu.toFixed(1)}%</td>
                <td className="py-2">{process.memory} MB</td>
                <td className="py-2 opacity-70">{process.id}</td>
                <td className="py-2">
                  <span className={`px-1.5 py-0.5 text-xs rounded ${
                    process.status === 'running' 
                      ? 'bg-green-900 text-green-300' 
                      : process.status === 'waiting' 
                        ? 'bg-yellow-900 text-yellow-300' 
                        : 'bg-red-900 text-red-300'
                  }`}>
                    {process.status.charAt(0).toUpperCase() + process.status.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SystemMonitorWindow;
