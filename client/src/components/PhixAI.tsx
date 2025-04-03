import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, Code, Command, CornerDownRight, Terminal, Zap } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { COLORS } from '../lib/phixeo-styles';

// Type for the prediction status
type PredictionStatus = 'idle' | 'thinking' | 'success' | 'error';

const PhixAI: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [status, setStatus] = useState<PredictionStatus>('idle');
  const [predictions, setPredictions] = useState<string[]>([]);
  const [activePrediction, setActivePrediction] = useState<number>(-1);
  const [accuracy, setAccuracy] = useState<number>(85);
  const [history, setHistory] = useState<Array<{prompt: string, code: string}>>([]);
  const [completedLines, setCompletedLines] = useState<number>(0);
  const [totalLines, setTotalLines] = useState<number>(0);
  const codeEditorRef = useRef<HTMLTextAreaElement>(null);

  // Golden ratio for UI elements
  const PHI = 1.618;

  // Example prompts for the user
  const examplePrompts = [
    "Optimize system memory using fractal compression",
    "Create a neural network with 3 hidden layers",
    "Monitor CPU and GPU usage with real-time metrics",
    "Implement a predictive model for resource allocation"
  ];

  // Simulated code templates based on common patterns
  const codeTemplates = {
    optimization: `# System Optimization with Fractal Algorithms
system.init(phi=1.618)
system.set_optimization_level(5)

def apply_fractal_compression(data):
    ratio = system.constants.phi / 2
    compressed = data * ratio
    return compressed

for metric in system.metrics:
    if metric.type == "memory":
        optimized = apply_fractal_compression(metric.data)
        print("Memory optimized: " + metric.size + " -> " + optimized.size)`,

    monitoring: `# Real-time System Monitoring
system.init(monitoring=True)

def log_metrics(metric_name, value):
    system.log(metric_name, value)
    if value > system.thresholds[metric_name]:
        system.alert(metric_name + " exceeds threshold")

# Monitor system metrics every 5 seconds
system.schedule(5, lambda: {
    log_metrics("cpu", system.metrics.cpu)
    log_metrics("memory", system.metrics.memory)
    log_metrics("network", system.metrics.network)
})`,

    neuralNetwork: `# Neural Network with Phixeo Optimizations
system.init(neural=True)

model = neural.create_model()
model.add_layer(nodes=64, activation="relu")
model.add_layer(nodes=32, activation="relu")
model.add_layer(nodes=16, activation="relu")
model.add_layer(nodes=system.output_classes, activation="softmax")

optimizer = neural.create_optimizer(
    learning_rate=0.01 * system.constants.phi,
    momentum=1/system.constants.phi
)

model.compile(optimizer=optimizer, loss="categorical_crossentropy")
model.train(system.data.train, epochs=100)`,

    predictive: `# Predictive Resource Allocation Model
system.init(predictive=True)

def predict_resource_needs(current_usage, history):
    trend = system.analyze_trend(history)
    prediction = current_usage * (1 + trend)
    return prediction

# Create golden-ratio based allocation thresholds
thresholds = {
    "low": 0.382,  # 1/φ
    "medium": 0.618,  # 1/φ² 
    "high": 1.0
}

# Monitor and predict every minute
system.schedule(60, lambda: {
    for resource in ["cpu", "memory", "disk"]:
        current = system.metrics[resource]
        history = system.history[resource]
        prediction = predict_resource_needs(current, history)
        system.allocate(resource, prediction)
})`,
  };

  // Simulate the Phixeo AI code generation based on the prompt
  const generatePhixeoCode = () => {
    if (!prompt.trim()) return;
    
    setStatus('thinking');
    setGeneratedCode('');
    setCompletedLines(0);
    
    // Record this in history
    const newHistory = [...history, {prompt, code: ''}];
    setHistory(newHistory);
    
    // Determine which template to use based on prompt keywords
    let templateKey: keyof typeof codeTemplates = 'optimization';
    
    if (prompt.toLowerCase().includes('monitor') || prompt.toLowerCase().includes('metrics')) {
      templateKey = 'monitoring';
    } else if (prompt.toLowerCase().includes('neural') || prompt.toLowerCase().includes('network')) {
      templateKey = 'neuralNetwork';
    } else if (prompt.toLowerCase().includes('predict') || prompt.toLowerCase().includes('allocation')) {
      templateKey = 'predictive';
    }
    
    const template = codeTemplates[templateKey];
    const lines = template.split('\n');
    setTotalLines(lines.length);
    
    // Simulate the 85% prediction accuracy - demonstrate how Phixeo predicts the next line
    generatePredictions(lines[0] || '');
    
    // Simulate generating code line by line with a typing effect
    let currentLine = 0;
    
    const interval = setInterval(() => {
      if (currentLine >= lines.length) {
        clearInterval(interval);
        setStatus('success');
        
        // Update the history with the complete code
        const updatedHistory = [...newHistory];
        updatedHistory[updatedHistory.length - 1].code = template;
        setHistory(updatedHistory);
        
        return;
      }
      
      setGeneratedCode(prev => prev + (prev ? '\n' : '') + lines[currentLine]);
      setCompletedLines(currentLine + 1);
      
      // Update the predictions for the next line when we're not at the last line
      if (currentLine < lines.length - 1) {
        generatePredictions(lines[currentLine + 1]);
      }
      
      currentLine++;
    }, 300);
  };
  
  // Generate code predictions based on the current code context
  const generatePredictions = (nextLine: string) => {
    // Clear any active prediction
    setActivePrediction(-1);
    
    // Generate slightly varied predictions with 85% accuracy
    const variations = [
      nextLine,
      nextLine.replace('system', 'phixeo'),
      nextLine.includes('=') 
        ? nextLine.replace('=', '==') 
        : nextLine.replace('==', '='),
      nextLine.trim().endsWith(':') 
        ? nextLine + ' # Comment' 
        : nextLine + ' # This is a comment'
    ];
    
    // Randomly choose which prediction will be correct (85% of the time it's the first one)
    const correctIndex = Math.random() < 0.85 ? 0 : Math.floor(Math.random() * 3) + 1;
    
    // Shuffle the predictions but make sure the correct one is 85% likely to be first
    let shuffled = [...variations];
    if (correctIndex !== 0) {
      const temp = shuffled[0];
      shuffled[0] = shuffled[correctIndex];
      shuffled[correctIndex] = temp;
    }
    
    setPredictions(shuffled.slice(0, 3));
  };
  
  // Accept a prediction
  const acceptPrediction = (index: number) => {
    if (index >= 0 && index < predictions.length) {
      const prediction = predictions[index];
      setGeneratedCode(prev => prev + '\n' + prediction);
      setCompletedLines(prev => prev + 1);
      setActivePrediction(index);
      
      // Update predictions for the next line
      setTimeout(() => {
        setPredictions([]);
        setActivePrediction(-1);
      }, 500);
    }
  };

  // Use an example prompt
  const useExamplePrompt = (example: string) => {
    setPrompt(example);
  };

  return (
    <div className="phixeo-card w-full max-w-4xl mx-auto shadow-lg">
      <Card className="border-0 bg-transparent">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2">
            <Zap className="h-6 w-6 text-yellow-400" />
            <CardTitle className="text-gradient-gold text-2xl">Phix AI Assistant</CardTitle>
          </div>
          <CardDescription>
            Natural language to Phixeo code translator with {accuracy}% prediction accuracy
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6">
          <Tabs defaultValue="code" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="code" className="flex items-center gap-2">
                <Code size={16} />
                Code Generation
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <Terminal size={16} />
                History
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="code" className="space-y-4">
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Tell Phix what to do in plain English
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., Optimize system memory using fractal compression"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      onClick={generatePhixeoCode}
                      disabled={status === 'thinking' || !prompt.trim()}
                      className="phixeo-button phixeo-button-primary"
                    >
                      {status === 'thinking' ? 'Generating...' : 'Generate Phixeo Code'}
                    </Button>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm mb-2">Example prompts:</div>
                  <div className="flex flex-wrap gap-2">
                    {examplePrompts.map((example, i) => (
                      <Badge 
                        key={i} 
                        variant="outline" 
                        className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                        onClick={() => useExamplePrompt(example)}
                      >
                        {example}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="relative mt-4">
                  <label className="block text-sm font-medium mb-1 flex justify-between">
                    <span>Generated Phixeo Code</span>
                    {status === 'thinking' && (
                      <span className="text-xs opacity-70">
                        Generating: {completedLines}/{totalLines} lines
                      </span>
                    )}
                  </label>
                  <Textarea
                    ref={codeEditorRef}
                    readOnly
                    value={generatedCode}
                    className="font-mono h-64 overflow-auto"
                    style={{
                      backgroundImage: status === 'thinking' 
                        ? 'linear-gradient(to bottom, rgba(255,215,0,0.05), transparent)'
                        : 'none'
                    }}
                  />
                  
                  {/* Code predictions that appear below the editor */}
                  {status === 'thinking' && predictions.length > 0 && (
                    <div className="absolute bottom-2 left-2 right-2 bg-slate-900 bg-opacity-95 border border-amber-500/20 rounded p-2 shadow-lg animate-in fade-in">
                      <div className="text-xs text-amber-300 mb-1 flex items-center">
                        <Zap className="h-3 w-3 mr-1" />
                        Phixeo predictions ({accuracy}% accuracy)
                      </div>
                      <div className="space-y-1">
                        {predictions.map((prediction, i) => (
                          <div 
                            key={i}
                            className={`
                              flex items-start p-1 pl-2 pr-2 rounded text-sm font-mono cursor-pointer
                              ${activePrediction === i ? 'bg-amber-600/30 text-white' : 'hover:bg-slate-800'}
                            `}
                            onClick={() => acceptPrediction(i)}
                          >
                            <CornerDownRight className="h-3 w-3 mr-2 mt-1 flex-shrink-0 text-amber-500" />
                            <span className="truncate">{prediction}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {status === 'success' && (
                  <Alert variant="default" className="bg-green-500/10 border-green-500/30 text-green-500">
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Success!</AlertTitle>
                    <AlertDescription>
                      Phixeo code generated successfully. The code is now ready to be executed or optimized.
                    </AlertDescription>
                  </Alert>
                )}
                
                {status === 'error' && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                      There was an error generating the Phixeo code. Please try again with a different prompt.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="history">
              {history.length > 0 ? (
                <div className="space-y-4">
                  {history.map((item, i) => (
                    <Card key={i} className="bg-slate-950 border-amber-800/20">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-normal text-amber-400">
                          <Command className="inline-block w-4 h-4 mr-1" />
                          {item.prompt}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <pre className="text-xs font-mono bg-black/50 p-3 rounded-md overflow-x-auto">
                          {item.code || 'Generating...'}
                        </pre>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <Terminal className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Your code generation history will appear here</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="px-6 py-4 bg-black/30 flex justify-between items-center">
          <div className="text-sm text-slate-400">
            Phixeo reduces code by up to 90% compared to traditional languages
          </div>
          <Button variant="outline" className="border-amber-500/30 hover:border-amber-500/50">
            <Code className="h-4 w-4 mr-2" />
            Export Code
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PhixAI;