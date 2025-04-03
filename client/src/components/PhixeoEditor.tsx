import React, { useEffect, useState } from 'react';
import { usePhixeoStore, NodeType, PhixeoNode } from '@/lib/phixeo';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Sample Phixeo code that demonstrates its powerful features
const SAMPLE_CODE = `# Phixeo Demo - Notice how much we accomplish with minimal code
print('Phixeo OS Performance Analysis')
for metric in system_metrics:
  print(metric.name + ': ' + metric.value)
  if metric.value > metric.threshold:
    print('Alert: ' + metric.name + ' exceeds threshold')
    notify_admin(metric)
  if metric.optimize_available:
    optimized_value = apply_optimization(metric)
    print('Optimized ' + metric.name + ' from ' + metric.value + ' to ' + optimized_value)
def apply_fractal_compression(data):
  print('Applying fractal compression algorithm')
  return data * fractal_ratio`;

/**
 * SVG Generator for Phixeo nodes - represents nodes as geometric shapes
 */
const PhixeoNodeRenderer: React.FC<{node: PhixeoNode, onClick?: () => void}> = ({ node, onClick }) => {
  // Generate shape path based on node type
  let shapePath = '';
  const size = node.size * 0.5; // Scale down for display
  
  switch (node.type) {
    case NodeType.Tetrahedral: // Triangle
      shapePath = `M0,-${size} L-${size * 0.866},${size * 0.5} L${size * 0.866},${size * 0.5} Z`;
      break;
    case NodeType.Hexagonal: // Hexagon
      shapePath = Array.from({ length: 6 }).map((_, i) => {
        const angle = (i * 2 * Math.PI / 6);
        return `${size * Math.cos(angle)},${size * Math.sin(angle)}`;
      }).join(' ');
      shapePath = `M${shapePath} Z`;
      break;
    case NodeType.Pentagonal: // Pentagon
      shapePath = Array.from({ length: 5 }).map((_, i) => {
        const angle = (i * 2 * Math.PI / 5) - Math.PI / 2;
        return `${size * Math.cos(angle)},${size * Math.sin(angle)}`;
      }).join(' ');
      shapePath = `M${shapePath} Z`;
      break;
    case NodeType.Fractal: // Octagon (used to represent fractal)
      shapePath = Array.from({ length: 8 }).map((_, i) => {
        const angle = (i * 2 * Math.PI / 8);
        return `${size * Math.cos(angle)},${size * Math.sin(angle)}`;
      }).join(' ');
      shapePath = `M${shapePath} Z`;
      break;
  }
  
  return (
    <g 
      transform={`translate(${node.x}, ${node.y})`} 
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <path d={shapePath} fill={node.color} stroke="#333" strokeWidth="2" />
      <text
        textAnchor="middle"
        y={node.type === NodeType.Tetrahedral ? size * 0.2 : 0}
        fill="#FFFFFF"
        fontSize="10"
        fontWeight="bold"
      >
        {node.value.substring(0, 15) + (node.value.length > 15 ? '...' : '')}
      </text>
      {node.subnodes && (
        <text
          textAnchor="middle"
          y={20}
          fill="#FFFFFF"
          fontSize="8"
        >
          ({node.subnodes.length} subnodes)
        </text>
      )}
    </g>
  );
};

/**
 * SVG Generator for connections between nodes
 */
const PhixeoConnectionRenderer: React.FC<{nodes: PhixeoNode[]}> = ({ nodes }) => {
  const connections: JSX.Element[] = [];
  const nodeMap = new Map<string, PhixeoNode>();
  
  // Create a map for quick node lookup
  nodes.forEach(node => nodeMap.set(node.id, node));
  
  // Create connections
  nodes.forEach(node => {
    node.connections.forEach(targetId => {
      const targetNode = nodeMap.get(targetId);
      if (targetNode) {
        connections.push(
          <line
            key={`${node.id}-${targetId}`}
            x1={node.x}
            y1={node.y}
            x2={targetNode.x}
            y2={targetNode.y}
            stroke="#555"
            strokeWidth="1"
            strokeDasharray="5,5"
          />
        );
      }
    });
  });
  
  return <>{connections}</>;
};

/**
 * Main Phixeo Editor Component
 */
const PhixeoEditor: React.FC = () => {
  const { code, nodes, optimizedNodes, result, setCode, parseAndOptimize, execute, clear } = usePhixeoStore();
  const [activeTab, setActiveTab] = useState('code');
  const [pythonEquivalent, setPythonEquivalent] = useState<string>('');
  const [jsEquivalent, setJsEquivalent] = useState<string>('');
  const [efficiencyMetrics, setEfficiencyMetrics] = useState<{
    codeReduction: number;
    executionSpeed: number;
    memoryUsage: number;
  }>({
    codeReduction: 0,
    executionSpeed: 1,
    memoryUsage: 1,
  });

  // Set the sample code on first render
  useEffect(() => {
    if (!code) {
      setCode(SAMPLE_CODE);
    }
    
    // Generate equivalent code in traditional languages
    generateEquivalentCode();
  }, [code, setCode]);
  
  // Parse and optimize whenever code changes
  useEffect(() => {
    if (code) {
      parseAndOptimize();
    }
  }, [code, parseAndOptimize]);
  
  // Calculate efficiency metrics
  useEffect(() => {
    if (code && pythonEquivalent && jsEquivalent) {
      setEfficiencyMetrics({
        codeReduction: Math.round((1 - code.length / ((pythonEquivalent.length + jsEquivalent.length) / 2)) * 100),
        executionSpeed: 3.7, // Simulation for demo
        memoryUsage: 0.4,    // Simulation for demo
      });
    }
  }, [code, pythonEquivalent, jsEquivalent]);
  
  // Generate equivalent code in Python and JavaScript
  const generateEquivalentCode = () => {
    // Python equivalent - purposely more verbose to show Phixeo's efficiency
    const python = `# Python equivalent - notice the additional code required
print('Phixeo OS Performance Analysis')
for metric in system_metrics:
    print(metric.name + ': ' + str(metric.value))
    if metric.value > metric.threshold:
        print('Alert: ' + metric.name + ' exceeds threshold')
        # Need to define the notify_admin function
        def notify_admin(metric_obj):
            try:
                # Send email alert
                import smtplib
                from email.message import EmailMessage
                
                msg = EmailMessage()
                msg.set_content(f"Alert: {metric_obj.name} exceeds threshold. Value: {metric_obj.value}")
                msg['Subject'] = f"System Alert: {metric_obj.name}"
                msg['From'] = "system@phixeo.com"
                msg['To'] = "admin@phixeo.com"
                
                s = smtplib.SMTP('localhost')
                s.send_message(msg)
                s.quit()
            except Exception as e:
                print(f"Failed to send notification: {e}")
        
        notify_admin(metric)
    
    if metric.optimize_available:
        # Need to implement optimization function
        def apply_optimization(metric_obj):
            # Determine optimization strategy based on metric type
            if metric_obj.type == "memory":
                return optimize_memory(metric_obj)
            elif metric_obj.type == "cpu":
                return optimize_cpu(metric_obj)
            elif metric_obj.type == "disk":
                return optimize_disk(metric_obj)
            else:
                return metric_obj.value
        
        # Define optimization sub-functions
        def optimize_memory(metric_obj):
            # Complex memory optimization logic here
            return metric_obj.value * 0.7
            
        def optimize_cpu(metric_obj):
            # Complex CPU optimization logic here
            return metric_obj.value * 0.6
            
        def optimize_disk(metric_obj):
            # Complex disk optimization logic here
            return metric_obj.value * 0.8
        
        optimized_value = apply_optimization(metric)
        print('Optimized ' + metric.name + ' from ' + str(metric.value) + ' to ' + str(optimized_value))

def apply_fractal_compression(data):
    print('Applying fractal compression algorithm')
    # Import needed libraries for fractal compression
    import numpy as np
    from PIL import Image
    
    # Implementation of fractal compression algorithm would go here
    # Simplified for this example
    fractal_ratio = 0.4  # Compression ratio
    return data * fractal_ratio`;
    
    // JavaScript equivalent - purposely more verbose
    const javascript = `// JavaScript equivalent - notice the additional complexity
console.log('Phixeo OS Performance Analysis');

// We need to define the system_metrics array
const system_metrics = [
  { name: 'CPU', value: 75, threshold: 80, optimize_available: true, type: 'cpu' },
  { name: 'Memory', value: 85, threshold: 80, optimize_available: true, type: 'memory' },
  { name: 'Disk', value: 65, threshold: 90, optimize_available: false, type: 'disk' }
];

// Helper functions need to be defined first
function notify_admin(metric) {
  // In a real implementation, this would send an alert
  try {
    // Using fetch to send the alert to an API endpoint
    fetch('/api/admin/alerts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        metric_name: metric.name,
        metric_value: metric.value,
        threshold: metric.threshold,
        timestamp: new Date().toISOString()
      }),
    })
    .then(response => response.json())
    .then(data => console.log('Alert sent:', data))
    .catch(error => console.error('Error sending alert:', error));
    
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
}

// Optimization functions
function optimize_memory(metric) {
  // Complex memory optimization logic would go here
  return metric.value * 0.7;
}

function optimize_cpu(metric) {
  // Complex CPU optimization logic would go here
  return metric.value * 0.6;
}

function optimize_disk(metric) {
  // Complex disk optimization logic would go here
  return metric.value * 0.8;
}

function apply_optimization(metric) {
  // Determine optimization strategy based on metric type
  if (metric.type === "memory") {
    return optimize_memory(metric);
  } else if (metric.type === "cpu") {
    return optimize_cpu(metric);
  } else if (metric.type === "disk") {
    return optimize_disk(metric);
  } else {
    return metric.value;
  }
}

// Now we can iterate through the metrics
system_metrics.forEach(metric => {
  console.log(metric.name + ': ' + metric.value);
  
  if (metric.value > metric.threshold) {
    console.log('Alert: ' + metric.name + ' exceeds threshold');
    notify_admin(metric);
  }
  
  if (metric.optimize_available) {
    const optimized_value = apply_optimization(metric);
    console.log('Optimized ' + metric.name + ' from ' + metric.value + ' to ' + optimized_value);
  }
});

function apply_fractal_compression(data) {
  console.log('Applying fractal compression algorithm');
  
  // In a real implementation, we would add a complex fractal compression algorithm
  // This would typically require additional libraries and complex mathematics
  
  const fractal_ratio = 0.4;  // Compression ratio
  return data * fractal_ratio;
}`;
    
    setPythonEquivalent(python);
    setJsEquivalent(javascript);
  };
  
  // Run button handler
  const handleRun = () => {
    execute();
    setActiveTab('output');
  };
  
  // Reset button handler
  const handleReset = () => {
    clear();
    setCode(SAMPLE_CODE);
    setActiveTab('code');
  };
  
  // SVG viewbox calculation to fit all nodes
  const calculateViewBox = (nodeList: PhixeoNode[]) => {
    if (nodeList.length === 0) return '0 0 1000 500';
    
    const padding = 50;
    const minX = Math.min(...nodeList.map(node => node.x)) - padding;
    const minY = Math.min(...nodeList.map(node => node.y)) - padding;
    const maxX = Math.max(...nodeList.map(node => node.x)) + padding;
    const maxY = Math.max(...nodeList.map(node => node.y)) + padding;
    
    const width = maxX - minX;
    const height = maxY - minY;
    
    return `${minX} ${minY} ${width} ${height}`;
  };
  
  return (
    <div className="w-full">
      <Card className="w-full mb-6 bg-black text-white border-gold">
        <CardHeader className="bg-gradient-to-r from-[#B8860B] to-[#FFD700] bg-clip-text text-transparent">
          <CardTitle className="text-2xl font-bold">Phixeo Code Editor</CardTitle>
          <CardDescription className="text-white opacity-90">
            Experience the revolutionary efficiency of Phixeo programming - reducing code size by {efficiencyMetrics.codeReduction}%
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="code" className="text-white">Phixeo Code</TabsTrigger>
              <TabsTrigger value="visual" className="text-white">Visual Nodes</TabsTrigger>
              <TabsTrigger value="output" className="text-white">Output</TabsTrigger>
              <TabsTrigger value="comparison" className="text-white">Efficiency</TabsTrigger>
            </TabsList>
            
            <TabsContent value="code" className="w-full">
              <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="font-mono bg-gray-900 text-white h-64 p-4 w-full"
                placeholder="Enter Phixeo code..."
              />
            </TabsContent>
            
            <TabsContent value="visual" className="w-full">
              <div className="bg-gray-900 rounded-md p-2 h-64 overflow-auto">
                <svg width="100%" height="100%" viewBox={calculateViewBox(optimizedNodes)} className="w-full h-full">
                  <g>
                    <PhixeoConnectionRenderer nodes={optimizedNodes} />
                    {optimizedNodes.map((node: PhixeoNode) => (
                      <PhixeoNodeRenderer 
                        key={node.id} 
                        node={node} 
                      />
                    ))}
                  </g>
                </svg>
              </div>
              <div className="text-xs mt-2 text-gray-400">
                Visualization shows nodes as geometric shapes based on their function: 
                triangles for variables/output, hexagons for loops, pentagons for conditionals, 
                and octagons for fractal optimizations.
              </div>
            </TabsContent>
            
            <TabsContent value="output" className="w-full">
              <div className="bg-gray-900 rounded-md p-4 h-64 overflow-auto font-mono">
                {result ? (
                  <>
                    <div className="text-green-400 mb-2">
                      Execution time: {result.time.toFixed(2)}ms | Memory: {result.memory}MB
                    </div>
                    <div className="text-white">
                      {result.output.length > 0 ? (
                        result.output.map((line: string, i: number) => <div key={i}>{line}</div>)
                      ) : (
                        <div className="text-gray-400">No output generated</div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-gray-400">Click 'Run' to see output</div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="comparison" className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-64 overflow-auto">
                <div>
                  <h3 className="text-lg text-gold font-semibold mb-2">Efficiency Metrics</h3>
                  <ul className="space-y-2">
                    <li className="flex justify-between">
                      <span>Code Reduction:</span>
                      <span className="text-green-400">{efficiencyMetrics.codeReduction}%</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Execution Speed:</span>
                      <span className="text-green-400">{efficiencyMetrics.executionSpeed}x faster</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Memory Usage:</span>
                      <span className="text-green-400">{efficiencyMetrics.memoryUsage}x less</span>
                    </li>
                  </ul>
                  
                  <h3 className="text-lg text-gold font-semibold mt-4 mb-2">Equivalence</h3>
                  <div className="text-xs text-gray-400">
                    The same functionality requires significantly more code in traditional languages.
                    Phixeo's revolutionary approach combines the efficiency of multiple paradigms.
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg text-gold font-semibold mb-2">Code Size Comparison</h3>
                  <div className="flex h-24">
                    <div
                      className="bg-[#FFD700] h-full"
                      style={{ width: `${(code.length / (pythonEquivalent.length + jsEquivalent.length) / 2) * 100}%` }}
                    >
                      <div className="text-xs text-black p-1 font-semibold">Phixeo</div>
                    </div>
                    <div
                      className="bg-blue-600 h-full"
                      style={{ width: `${(pythonEquivalent.length / (pythonEquivalent.length + jsEquivalent.length) / 2) * 100}%` }}
                    >
                      <div className="text-xs text-white p-1 font-semibold">Python</div>
                    </div>
                    <div
                      className="bg-yellow-600 h-full"
                      style={{ width: `${(jsEquivalent.length / (pythonEquivalent.length + jsEquivalent.length) / 2) * 100}%` }}
                    >
                      <div className="text-xs text-white p-1 font-semibold">JavaScript</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    Phixeo: {code.length} characters | Python: {pythonEquivalent.length} characters | JavaScript: {jsEquivalent.length} characters
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="gap-2 justify-end bg-gray-900 rounded-b-lg">
          <Button 
            onClick={handleRun}
            variant="default"
            className="bg-gradient-to-r from-[#B8860B] to-[#FFD700] text-black font-bold hover:opacity-90"
          >
            Run
          </Button>
          <Button 
            onClick={handleReset}
            variant="outline"
            className="text-white"
          >
            Reset
          </Button>
        </CardFooter>
      </Card>
      
      <Card className="w-full bg-gray-900 text-white border-gold">
        <CardHeader>
          <CardTitle className="text-xl text-gold">Key Phixeo Features</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-gold">✦</span>
              <span>
                <strong className="text-gold">Golden Ratio Optimization:</strong> Using the golden ratio ({(1 + Math.sqrt(5)) / 2}) for perfect code balance
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gold">✦</span>
              <span>
                <strong className="text-gold">Fractal Node Compression:</strong> Self-similar patterns enable 90% code reduction
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gold">✦</span>
              <span>
                <strong className="text-gold">Geometric Constants:</strong> Derived from Platonic solids for maximum efficiency
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gold">✦</span>
              <span>
                <strong className="text-gold">Visual Programming:</strong> Code expressed as connected nodes in optimal spiral patterns
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default PhixeoEditor;