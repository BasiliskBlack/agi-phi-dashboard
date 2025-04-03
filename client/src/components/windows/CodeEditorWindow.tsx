import React, { useState } from 'react';

const CodeEditorWindow: React.FC = () => {
  const [activeTab, setActiveTab] = useState('visual_editor.py');
  
  const tabs = [
    { id: 'visual_editor.py', title: 'visual_editor.py' },
    { id: 'system_monitor.py', title: 'system_monitor.py' },
    { id: 'license_manager.py', title: 'license_manager.py' }
  ];

  const codeContent = `import phixeo_parser as parser
from math import pi, sqrt, cos, sin

class VisualEditor:
    def __init__(self):
        self.phi = (1 + sqrt(5)) / 2  # Golden ratio
        self.nodes = []
        self.constants = {
            "Tetrahedral": (pi**2 + self.phi * sqrt(5)) / 2,  # ~7.416
            "Hexagonal": pi + (2 * sqrt(3)) / self.phi,     # ~4.373
            "Pentagonal": (pi + self.phi + sqrt(5)) / 3,     # ~2.327
            "Fractal": pi * self.phi**2 + sqrt(2)         # ~9.737
        }
        self.golden_angle = 2.399  # ~137.5 degrees in radians`;

  // Create line numbers for the code
  const codeLines = codeContent.split('\n');
  const lineNumbers = Array.from({ length: codeLines.length }, (_, i) => i + 1);

  return (
    <div className="h-full flex flex-col">
      <div className="flex bg-gray-900 text-xs">
        {tabs.map(tab => (
          <div 
            key={tab.id}
            className={`px-4 py-2 ${
              activeTab === tab.id 
                ? 'text-phixeo-pink font-medium border-b-2 border-phixeo-pink' 
                : 'text-gray-400'
            } cursor-pointer`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.title}
          </div>
        ))}
      </div>
      <div className="flex-1 overflow-auto p-4 font-mono text-sm bg-gray-900 flex">
        <div className="mr-4 text-right text-gray-500 select-none">
          {lineNumbers.map(num => (
            <div key={num}>{num}</div>
          ))}
        </div>
        <div className="flex-1">
          {codeLines.map((line, index) => {
            // Syntax highlighting (simple version)
            let highlightedLine = line;
            
            // Highlight keywords
            highlightedLine = highlightedLine
              .replace(/\b(import|from|as|class|def|self)\b/g, '<span class="text-purple-400">$1</span>')
              .replace(/\b(math|parser|phixeo_parser)\b/g, '<span class="text-green-400">$1</span>')
              .replace(/\b(__init__)\b/g, '<span class="text-blue-300">$1</span>')
              .replace(/\b(pi|sqrt|cos|sin)\b/g, '<span class="text-yellow-300">$1</span>')
              .replace(/"([^"]*)":/g, '<span class="text-orange-300">"$1"</span>:')
              .replace(/=|\+|-|\*|\/|\(|\)|\{|\}|\[|\]|:|,|\./g, '<span class="text-gray-400">$&</span>')
              .replace(/(?<![a-zA-Z0-9_"])#.*/g, '<span class="text-gray-500">$&</span>')
              .replace(/self\.\w+/g, '<span class="text-yellow-300">$&</span>');
              
            return (
              <div key={index} dangerouslySetInnerHTML={{ __html: highlightedLine || '<br>' }} />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CodeEditorWindow;
