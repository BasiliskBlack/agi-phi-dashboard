import React, { useState, useRef, useEffect } from 'react';

const TerminalWindow: React.FC = () => {
  const [commandHistory, setCommandHistory] = useState<string[]>([
    'PhixeoOS v1.2.4 (c) 2023 Phixeo Technologies',
    'Type "help" for more information.'
  ]);
  const [currentCommand, setCurrentCommand] = useState('');
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom whenever history changes
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [commandHistory]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      processCommand();
    }
  };

  const processCommand = () => {
    if (!currentCommand.trim()) return;

    // Add command to history
    setCommandHistory(prev => [...prev, `phixeo@os:~$ ${currentCommand}`]);

    // Process command
    const cmd = currentCommand.trim().toLowerCase();
    let response = '';

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
    } else if (cmd === 'clear') {
      setCommandHistory(['PhixeoOS v1.2.4 (c) 2023 Phixeo Technologies', 'Type "help" for more information.']);
      setCurrentCommand('');
      return;
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
  CPU: 67% usage (8 cores @ 3.5GHz)
  Memory: 6.8GB/16GB (42% used)
  Disk: 182GB/512GB (24% used)
  Network: 12Mbps, 45 connections
  Security Status: No threats detected
  Runtime Efficiency: 98.7%
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
[OPTIMIZATION] Complete! System efficiency improved by 12.7%
`;
    } else if (cmd === 'exit') {
      response = 'Closing terminal session...';
    } else {
      response = `Command not found: ${cmd}. Type "help" for available commands.`;
    }

    // Add response to history
    setCommandHistory(prev => [...prev, response.trim()]);
    setCurrentCommand('');
  };

  return (
    <div className="terminal h-full flex flex-col bg-gray-900 text-green-400 p-4 font-mono text-sm">
      <div className="flex-1 overflow-auto" ref={terminalRef}>
        {commandHistory.map((line, index) => (
          <div key={index} className="whitespace-pre-line mb-1">
            {line}
          </div>
        ))}
      </div>
      <div className="flex items-center mt-2">
        <span className="mr-2">phixeo@os:~$</span>
        <input
          type="text"
          className="flex-1 bg-transparent outline-none"
          value={currentCommand}
          onChange={(e) => setCurrentCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      </div>
    </div>
  );
};

export default TerminalWindow;
