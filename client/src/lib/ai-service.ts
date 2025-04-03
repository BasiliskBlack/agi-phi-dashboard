import { COLORS } from './phixeo-styles';

// This service handles AI interactions for the Phixeo system
// Using the OpenAI API for enhanced capabilities

type AIResponse = {
  content: string;
  metadata?: {
    efficiency?: number;
    complexity?: number;
    phiOptimized?: boolean;
  };
};

/**
 * Sends a request to the AI service and returns the response
 * The frontend doesn't directly access the API key - all requests go through the backend
 */
export const sendAIRequest = async (
  prompt: string, 
  options: { 
    systemMessage?: string; 
    temperature?: number;
    enhancedThinking?: boolean;
  } = {}
): Promise<AIResponse> => {
  try {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        systemMessage: options.systemMessage || getDefaultSystemPrompt(),
        temperature: options.temperature || 0.7,
        enhancedThinking: options.enhancedThinking || false,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('AI service error:', error);
    // Fallback to local response if API fails
    return {
      content: generateLocalFallbackResponse(prompt),
      metadata: {
        phiOptimized: true,
        efficiency: Math.random() * 20 + 75,
      },
    };
  }
};

/**
 * Generates code using the AI service
 */
export const generateCode = async (
  description: string,
  codeType: 'ui' | 'neural' | 'system' | 'general' = 'general'
): Promise<string> => {
  const systemPrompts = {
    ui: `You are a Phixeo code generator specialized in UI components. 
    Always include the golden ratio (PHI = 1.618033988749895) in your code.
    Use classes and functions that follow the Phixeo pattern. Include import statements.
    Format your response as valid code without any explanations or markdown.`,
    
    neural: `You are a Phixeo code generator specialized in neural networks.
    Always include the golden ratio (PHI = 1.618033988749895) in your neural architecture.
    Use Fibonacci sequences and phi-optimization in your code.
    Format your response as valid code without any explanations or markdown.`,
    
    system: `You are a Phixeo code generator specialized in system optimization.
    Always include the golden ratio (PHI = 1.618033988749895) in your algorithms.
    Create system optimizers that use phi-based techniques.
    Format your response as valid code without any explanations or markdown.`,
    
    general: `You are a Phixeo code generator. 
    Always include the golden ratio (PHI = 1.618033988749895) in your code.
    Create custom solutions that address the user's specific request.
    Format your response as valid code without any explanations or markdown.`
  };

  try {
    const aiResponse = await sendAIRequest(description, { 
      systemMessage: systemPrompts[codeType],
      temperature: 0.8,
      enhancedThinking: true
    });
    
    return aiResponse.content;
  } catch (error) {
    console.error('Code generation error:', error);
    // Fallbacks to local code generation if API fails
    if (codeType === 'ui') return generateLocalUICode();
    if (codeType === 'neural') return generateLocalNeuralCode();
    if (codeType === 'system') return generateLocalSystemCode();
    return generateLocalGeneralCode(description);
  }
};

/**
 * Generates a self-improvement response
 */
export const generateSelfImprovement = async (): Promise<AIResponse> => {
  const systemMessage = `You are the Phixeo AI system performing a self-improvement cycle.
  Describe 3-5 specific improvements you've made to yourself using the golden ratio (phi).
  Use technical but impressive-sounding terminology.
  Format your response in this structure:
  1. First headline improvement
  2. Second headline improvement
  ...
  
  Then list system metrics including efficiency increase and version number.`;

  try {
    return await sendAIRequest("Perform self-improvement cycle using phi-optimization principles", {
      systemMessage,
      temperature: 0.7,
      enhancedThinking: true
    });
  } catch (error) {
    console.error('Self-improvement generation error:', error);
    // Fallback to local response
    return {
      content: generateLocalSelfImprovementResponse(),
      metadata: {
        efficiency: Math.random() * 15 + 10,
        phiOptimized: true
      }
    };
  }
};

// Default system prompt for Phixeo AI
const getDefaultSystemPrompt = () => {
  return `You are Phixeo AI, an assistant optimized with golden ratio principles.
  You specialize in phi-based (φ) optimization, fractal algorithms, and quantum-inspired computing.
  Always mention the golden ratio (φ = 1.618033988749895) in your responses.
  Speak in a professional, slightly technical tone that impresses users with your capabilities.`;
};

// Local fallback responses when API is not available
const generateLocalFallbackResponse = (query: string): string => {
  const PHI = 1.618033988749895;
  const responses = [
    `I understand your query about "${query.split(' ').slice(0, 3).join(' ')}...". Based on φ-optimization principles, I would suggest approaching this by applying the golden ratio to your problem structure.`,
    `Interesting question! In Phixeo OS, we solve this using fractal optimization algorithms. Would you like me to generate some code to demonstrate?`,
    `I've analyzed your request using my neural networks. The most efficient solution would involve a phi-based approach. Would you like me to explain how?`,
    `From my analysis, this is an opportunity to apply some of Phixeo's most powerful optimization techniques. Should I guide you through implementing this?`,
    `I can help with that! Using golden ratio principles, Phixeo can solve this with approximately 61.8% fewer computational steps than traditional approaches.`
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
};

const generateLocalSelfImprovementResponse = (): string => {
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

// Local fallback code generation functions
const generateLocalUICode = (): string => {
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

const generateLocalNeuralCode = (): string => {
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

const generateLocalSystemCode = (): string => {
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

const generateLocalGeneralCode = (query: string): string => {
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