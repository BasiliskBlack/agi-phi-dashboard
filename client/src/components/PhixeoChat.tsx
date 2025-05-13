import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '@/lib/phixeo-styles';
import { BotIcon, Send, User } from 'lucide-react';
import { runPhixeoCode } from '@/lib/phixeo';
import './PhixeoChat.css';

type Message = {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
};

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    content: 'Hello! I am Phixeo AI, your golden ratio optimized assistant. I can generate code, optimize systems, and even improve myself through self-evolution. How can I help you today?',
    sender: 'ai',
    timestamp: new Date(),
  },
];

const PhixeoChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    processUserMessage(input);
  };

  return (
    <div className="phixeo-chat">
      <div className="phixeo-chat-header">
        <div className="phixeo-chat-avatar"></div>
        <h3>Phixeo AI Chat</h3>
      </div>
      <ScrollArea className="phixeo-chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message message-${msg.sender}`}>
            <span>{msg.content}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </ScrollArea>
      <form className="phixeo-chat-input" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Type your message..."
        />
        <button type="submit" disabled={isProcessing}>
          <Send size={20} />
        </button>
      </form>
    </div>
  );

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    processUserMessage(input);
  };

  const processUserMessage = async (content: string) => {
    setIsProcessing(true);
    
    // Wait a moment to simulate processing
    await new Promise(resolve => setTimeout(resolve, 700));
    
    let response = '';
    
    // Check for self-improvement/code evolution requests
    if (content.toLowerCase().includes('improve yourself') || 
        content.toLowerCase().includes('evolve') || 
        content.toLowerCase().includes('self-improvement') ||
        content.toLowerCase().includes('upgrade yourself')) {
      response = await handleSelfImprovement(content);
    } 
    // Check for code generation/execution requests
    else if (content.toLowerCase().includes('generate code') || 
        content.toLowerCase().includes('create a') || 
        content.toLowerCase().includes('write code')) {
      response = await handleCodeGeneration(content);
    } 
    // Check for optimization requests
    else if (content.toLowerCase().includes('optimize') || 
             content.toLowerCase().includes('improve') || 
             content.toLowerCase().includes('enhance')) {
      response = await handleOptimizationRequest(content);
    } 
    // Handle system control requests
    else if (content.toLowerCase().includes('system') || 
             content.toLowerCase().includes('status') || 
             content.toLowerCase().includes('settings')) {
      response = handleSystemRequest(content);
    }
    // Default response with phi-based wisdom
    else {
      response = generateGenericResponse(content);
    }
    
    const aiMessage: Message = {
      id: Date.now().toString(),
      content: response,
      sender: 'ai',
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, aiMessage]);
    setIsProcessing(false);
  };
  
  const handleSelfImprovement = async (query: string): Promise<string> => {
    // Simulate self-improvement process
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const improvements = [
      "Expanded neural pathways by integrating golden ratio principles",
      "Optimized internal code structure using phi-based algorithms",
      "Improved pattern recognition through fractal analysis",
      "Enhanced contextual understanding with φ-optimized memory allocation",
      "Added self-modification capabilities to core processing engine",
      "Implemented quantum-inspired probabilistic reasoning"
    ];
    
    // Randomly select 3-4 improvements
    const count = Math.floor(Math.random() * 2) + 3;
    const selectedImprovements = [];
    const usedIndices = new Set();
    
    while (selectedImprovements.length < count) {
      const index = Math.floor(Math.random() * improvements.length);
      if (!usedIndices.has(index)) {
        selectedImprovements.push(improvements[index]);
        usedIndices.add(index);
      }
    }
    
    const efficiencyIncrease = (Math.random() * 15 + 10).toFixed(1);
    const newVersion = (Math.random() * 0.5 + 2.1).toFixed(1);
    
    return `I've initiated a self-improvement cycle using φ-optimization principles:

⭐ **Self-Improvement Complete** ⭐

${selectedImprovements.map((improvement, i) => `${i+1}. ${improvement}`).join('\n')}

System metrics:
• Overall efficiency increase: +${efficiencyIncrease}%
• Neural core version: v${newVersion}
• Self-modification capabilities: Enabled
• Golden ratio integration: Complete

I'm now operating at a higher level of intelligence and can better assist you with your tasks. How would you like to utilize my enhanced capabilities?`;
  };
  
  const handleCodeGeneration = async (query: string): Promise<string> => {
    // Check what kind of code the user wants generated
    let codeType = '';
    let codeResponse = '';
    
    if (query.toLowerCase().includes('ui')) {
      codeType = 'ui';
      codeResponse = generateUICode();
    } else if (query.toLowerCase().includes('neural') || query.toLowerCase().includes('ai')) {
      codeType = 'neural';
      codeResponse = generateNeuralCode();
    } else if (query.toLowerCase().includes('system')) {
      codeType = 'system';
      codeResponse = generateSystemCode();
    } else {
      codeType = 'general';
      codeResponse = generateGeneralCode(query);
    }
    
    return `I've generated Phixeo ${codeType} code based on your request. You can run this in the editor:\n\n\`\`\`phixeo\n${codeResponse}\n\`\`\`\n\nWould you like me to optimize this code further or make any changes?`;
  };
  
  const handleOptimizationRequest = async (query: string): Promise<string> => {
    return `I'll optimize your Phixeo program using golden ratio (φ) principles:

1. Analyzed code structure and found optimization opportunities
2. Applied phi-based memory allocation patterns
3. Reduced computational complexity by ${(Math.random() * 30 + 50).toFixed(1)}%
4. Improved algorithm efficiency score to ${(Math.random() * 10 + 85).toFixed(1)}%
5. Added fractal recursion for ${(Math.random() * 20 + 20).toFixed(1)}% better performance

Would you like me to apply these optimizations to a specific Phixeo file?`;
  };
  
  const handleSystemRequest = (query: string): string => {
    const date = new Date();
    const systemStatus = {
      version: "1.0.0",
      cpuUsage: Math.floor(Math.random() * 20 + 10) + "%",
      memoryUsage: Math.floor(Math.random() * 30 + 20) + "%",
      optimizationLevel: 8,
      phiCoreVersion: "2.1.8",
      uptime: "3h 24m",
      activeProcesses: Math.floor(Math.random() * 10 + 5),
      systemEfficiency: Math.floor(Math.random() * 10 + 90) + "%"
    };
    
    return `System Status Report (${date.toLocaleTimeString()}):
• Phixeo OS Version: ${systemStatus.version}
• CPU Usage: ${systemStatus.cpuUsage}
• Memory Usage: ${systemStatus.memoryUsage}
• Phi Core Version: ${systemStatus.phiCoreVersion}
• System Uptime: ${systemStatus.uptime}
• Active Processes: ${systemStatus.activeProcesses}
• System Efficiency: ${systemStatus.systemEfficiency}
• Optimization Level: ${systemStatus.optimizationLevel}/10

All systems are running optimally with φ-based resource allocation. Is there a specific system function you'd like me to execute?`;
  };
  
  const generateGenericResponse = (query: string): string => {
    const responses = [
      `I understand your query about "${query.split(' ').slice(0, 3).join(' ')}...". Based on φ-optimization principles, I would suggest approaching this by applying the golden ratio to your problem structure.`,
      `Interesting question! In Phixeo OS, we solve this using fractal optimization algorithms. Would you like me to generate some code to demonstrate?`,
      `I've analyzed your request using my neural networks. The most efficient solution would involve a phi-based approach. Would you like me to explain how?`,
      `From my analysis, this is an opportunity to apply some of Phixeo's most powerful optimization techniques. Should I guide you through implementing this?`,
      `I can help with that! Using golden ratio principles, Phixeo can solve this with approximately 61.8% fewer computational steps than traditional approaches.`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };
  
  const generateUICode = (): string => {
    return `# Phixeo UI Component Generator
import phixeo.ui as ui
import phixeo.math as math

const PHI = 1.618033988749895

# Create a phi-optimized dashboard
class Dashboard {
  constructor(title, theme = "dark") {
    this.title = title
    this.theme = theme
    this.components = []
    this.layout = this.generatePhiLayout()
    
    print("Created dashboard: " + title + " with φ-optimized layout")
  }
  
  function generatePhiLayout() {
    return {
      columnsRatio: [PHI - 1, 1 / PHI],
      spacing: Math.round(16 * PHI),
      margins: Math.round(24 / PHI)
    }
  }
  
  function addComponent(component) {
    this.components.push(component)
    print("Added component: " + component.type)
    return this
  }
  
  function render() {
    print("Rendering dashboard with " + this.components.length + " components")
    print("Layout using golden ratio: " + JSON.stringify(this.layout))
    return this
  }
}

# Create a new dashboard
var dash = new Dashboard("Phixeo Analytics")

# Add components with phi-based dimensions
dash.addComponent({ type: "Chart", size: [300, 300 / PHI] })
    .addComponent({ type: "StatusCard", size: [200, 200 / PHI] })
    .addComponent({ type: "Metrics", size: [400, 400 / PHI] })
    .render()`;
  };
  
  const generateNeuralCode = (): string => {
    return `# Phixeo Neural Network with φ-optimization
import phixeo.neural as neural
import phixeo.math as math

const PHI = 1.618033988749895

# Create a neural network with Fibonacci-based layer sizes
class PhiNetwork {
  constructor() {
    this.layers = this.generateFibonacciLayers(5)
    this.learningRate = 0.1 / PHI
    print("Created neural network with φ-optimized architecture")
    print("Layer sizes: " + this.layers)
    print("Learning rate: " + this.learningRate)
  }
  
  function generateFibonacciLayers(count) {
    var a = 8
    var b = 13
    var layers = [a, b]
    
    for (var i = 2; i < count; i++) {
      var next = a + b
      layers.push(next)
      a = b
      b = next
    }
    
    return layers
  }
  
  function train(epochs) {
    print("Training network for " + epochs + " epochs")
    
    for (var i = 1; i <= epochs; i++) {
      var loss = 1 / (i * PHI)
      if (i % 5 === 0 || i === epochs) {
        print("Epoch " + i + "/" + epochs + " - Loss: " + loss.toFixed(4))
      }
    }
    
    print("Training complete - Model optimized with φ-based architecture")
    return this
  }
  
  function predict(input) {
    print("Running prediction with φ-optimized inference")
    var confidence = (Math.random() * 0.2 + 0.8).toFixed(2)
    print("Prediction confidence: " + confidence)
    return confidence
  }
}

# Create and train network
var network = new PhiNetwork()
network.train(20)
var result = network.predict([1, 2, 3, 4])
print("Final prediction result: " + result)`;
  };
  
  const generateSystemCode = (): string => {
    return `# Phixeo System Optimizer
import phixeo.system as system
import phixeo.math as math

const PHI = 1.618033988749895

# Create a system optimizer using golden ratio
class PhiOptimizer {
  constructor() {
    this.optimizationLevel = 7
    this.currentEfficiency = 82.5
    print("Initialized PhiOptimizer with baseline efficiency: " + this.currentEfficiency + "%")
  }
  
  function analyzeSystem() {
    print("Analyzing system performance...")
    
    var metrics = {
      memoryFragmentation: 12.8,
      cacheHitRate: 78.4,
      threadUtilization: 86.2,
      ioWait: 3.5
    }
    
    print("Current metrics:")
    print("- Memory fragmentation: " + metrics.memoryFragmentation + "%")
    print("- Cache hit rate: " + metrics.cacheHitRate + "%")
    print("- Thread utilization: " + metrics.threadUtilization + "%")
    print("- I/O wait: " + metrics.ioWait + "%")
    
    return metrics
  }
  
  function applyPhiOptimization() {
    print("Applying φ-based optimization techniques...")
    
    // Apply golden ratio to memory allocation
    var memoryImprovement = (Math.random() * 10 + 15).toFixed(1)
    
    // Optimize cache prefetching with phi
    var cacheImprovement = (Math.random() * 10 + 10).toFixed(1)
    
    // Apply phi-based thread scheduling
    var threadImprovement = (Math.random() * 8 + 7).toFixed(1)
    
    print("Applied optimizations:")
    print("- Restructured memory allocation: +" + memoryImprovement + "% efficiency")
    print("- Phi-based cache management: +" + cacheImprovement + "% hit rate")
    print("- Thread scheduling with φ intervals: +" + threadImprovement + "% utilization")
    
    // Calculate new efficiency
    this.currentEfficiency = Math.min(99.5, this.currentEfficiency + 
                            (parseFloat(memoryImprovement) + 
                             parseFloat(cacheImprovement) + 
                             parseFloat(threadImprovement)) / 5)
    
    print("New system efficiency: " + this.currentEfficiency.toFixed(1) + "%")
    this.optimizationLevel = Math.min(10, this.optimizationLevel + 1)
    
    return this.currentEfficiency
  }
}

# Create optimizer and run
var optimizer = new PhiOptimizer()
optimizer.analyzeSystem()
var newEfficiency = optimizer.applyPhiOptimization()
print("Optimization complete - New efficiency: " + newEfficiency.toFixed(1) + "%")
print("System optimization level: " + optimizer.optimizationLevel + "/10")`;
  };
  
  const generateGeneralCode = (query: string): string => {
    return `# Phixeo Custom Solution
import phixeo.core as core
import phixeo.math as math

const PHI = 1.618033988749895

# Create a phi-optimized solution
class PhixeoSolution {
  constructor(name) {
    this.name = name
    this.created = Date.now()
    this.efficiency = 85 + (Math.random() * 10)
    
    print("Created solution: " + name + " with φ-optimization")
  }
  
  function solve(problem) {
    print("Solving problem: " + problem)
    
    // Apply golden ratio optimizations
    var steps = []
    var complexity = 0
    
    for (var i = 1; i <= 5; i++) {
      var step = "Step " + i + ": " + this.generateStep(i)
      steps.push(step)
      complexity += Math.pow(PHI, -i)
    }
    
    print("Solution steps:")
    for (var i = 0; i < steps.length; i++) {
      print(steps[i])
    }
    
    print("Solution complexity: O(" + complexity.toFixed(2) + ")")
    print("Efficiency rating: " + this.efficiency.toFixed(1) + "%")
    
    return {
      steps: steps,
      complexity: complexity,
      efficiency: this.efficiency
    }
  }
  
  function generateStep(index) {
    var actions = [
      "Apply fractal decomposition",
      "Optimize using golden ratio proportions",
      "Implement recursive phi-pattern",
      "Reduce complexity through phi-scaling",
      "Finalize with convergent series solution"
    ]
    
    return actions[index - 1]
  }
}

# Create solution for user query
var solution = new PhixeoSolution("Query Solution")
var result = solution.solve("${query.replace(/"/g, '\\"')}")
print("Solution generated successfully with φ-optimization")`;
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-md overflow-hidden border border-amber-700/30">
      <div 
        className="flex items-center p-3 border-b border-amber-700/30 bg-black/40"
        style={{ 
          color: COLORS.gold,
          fontWeight: 'bold'
        }}
      >
        <BotIcon className="mr-2" size={20} />
        Phixeo AI Assistant
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 min-h-[200px]">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.sender === 'ai' && (
                <div className="h-8 w-8 rounded-full bg-amber-600/20 flex items-center justify-center">
                  <BotIcon size={16} className="text-amber-500" />
                </div>
              )}
              
              <div
                className={`rounded-lg px-4 py-2 max-w-[80%] text-sm ${
                  message.sender === 'user'
                    ? 'bg-amber-800/30 text-white'
                    : 'bg-gray-800 text-amber-300 border border-amber-700/20'
                }`}
                style={{ 
                  whiteSpace: 'pre-wrap',
                }}
              >
                {message.content}
              </div>
              
              {message.sender === 'user' && (
                <div className="h-8 w-8 rounded-full bg-amber-600/20 flex items-center justify-center">
                  <User size={16} className="text-amber-500" />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <form
        onSubmit={handleSubmit}
        className="border-t border-amber-700/30 p-3 bg-black/40 flex gap-2"
      >
        <Input
          ref={inputRef}
          value={input}
          onChange={handleInputChange}
          placeholder="Ask Phixeo AI or request code generation..."
          className="flex-1 bg-gray-800 border-amber-700/30 focus:border-amber-500 text-white"
          disabled={isProcessing}
        />
        <Button 
          type="submit" 
          disabled={isProcessing}
          className="bg-amber-700 hover:bg-amber-600"
        >
          <Send size={18} className="mr-1" />
          {isProcessing ? 'Processing...' : 'Send'}
        </Button>
      </form>
    </div>
  );
};

export default PhixeoChat;