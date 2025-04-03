import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { optimizeCode, PHI } from '@/lib/phixeo-ai-service';
import { Loader2, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type PhixeoOptimizerProps = {
  code: string;
  onOptimizedCode?: (code: string) => void;
};

/**
 * Component for code optimization using Phixeo AI
 */
const PhixeoOptimizer: React.FC<PhixeoOptimizerProps> = ({ code, onOptimizedCode }) => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedCode, setOptimizedCode] = useState<string | null>(null);
  const [optimizationMetrics, setOptimizationMetrics] = useState<any | null>(null);
  const [optimizationLevel, setOptimizationLevel] = useState<'standard' | 'aggressive' | 'conservative' | 'phi'>('standard');
  const [activeTab, setActiveTab] = useState('original');
  
  // Fractal optimization function
  const handleOptimize = async () => {
    if (!code || isOptimizing) return;
    
    setIsOptimizing(true);
    setOptimizedCode(null);
    setOptimizationMetrics(null);
    
    try {
      const response = await optimizeCode(code, optimizationLevel);
      setOptimizedCode(response.optimizedCode);
      setOptimizationMetrics(response.metrics);
      
      if (onOptimizedCode) {
        onOptimizedCode(response.optimizedCode);
      }
      
      // Switch to optimized tab after optimization
      setActiveTab('optimized');
    } catch (error) {
      console.error('Error optimizing code:', error);
    } finally {
      setIsOptimizing(false);
    }
  };
  
  // Placeholder for when no optimization has been performed
  const EmptyOptimizationState = () => (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <Sparkles className="w-12 h-12 text-amber-400 mb-4" />
      <h3 className="text-lg font-semibold mb-2">Phi-Optimized Code</h3>
      <p className="text-gray-500 max-w-md">
        Let Phixeo optimize your code using golden ratio principles and fractal patterns.
        Optimization can reduce code size and improve efficiency.
      </p>
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <Select
          value={optimizationLevel}
          onValueChange={(value: any) => setOptimizationLevel(value)}
        >
          <SelectTrigger className="w-[240px]">
            <SelectValue placeholder="Optimization Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="standard">Standard (Balanced)</SelectItem>
            <SelectItem value="aggressive">Aggressive (Maximum)</SelectItem>
            <SelectItem value="conservative">Conservative (Safe)</SelectItem>
            <SelectItem value="phi">Phi-Based (Golden Ratio)</SelectItem>
          </SelectContent>
        </Select>
        <Button 
          onClick={handleOptimize} 
          disabled={!code || isOptimizing}
          className="bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800"
        >
          {isOptimizing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Optimizing...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Optimize with Phixeo
            </>
          )}
        </Button>
      </div>
    </div>
  );
  
  // Metrics display after optimization
  const OptimizationMetrics = () => {
    if (!optimizationMetrics) return null;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Compression</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{optimizationMetrics.compressionRatio.toFixed(2)}x</div>
            <Progress 
              value={Math.min(100, optimizationMetrics.compressionRatio * 50)} 
              className="h-2 mt-2" 
            />
            <p className="text-xs text-gray-500 mt-1">
              {optimizationMetrics.originalLength} → {optimizationMetrics.optimizedLength} chars
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Phi Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{optimizationMetrics.phiCompressionScore}%</div>
            <Progress 
              value={optimizationMetrics.phiCompressionScore} 
              className="h-2 mt-2" 
            />
            <p className="text-xs text-gray-500 mt-1">
              Based on golden ratio: {optimizationMetrics.phi.toFixed(5)}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Efficiency Gain</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{optimizationMetrics.efficiencyGain}%</div>
            <Progress 
              value={optimizationMetrics.efficiencyGain} 
              className="h-2 mt-2" 
            />
            <p className="text-xs text-gray-500 mt-1">
              Using {optimizationMetrics.optimizationLevel} optimization
            </p>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  return (
    <div className="border rounded-lg shadow-md overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center border-b px-4">
          <TabsList className="bg-transparent border-b-0">
            <TabsTrigger value="original" className="data-[state=active]:border-b-2 data-[state=active]:border-amber-500 data-[state=active]:shadow-none rounded-none">
              Original Code
            </TabsTrigger>
            <TabsTrigger value="optimized" className="data-[state=active]:border-b-2 data-[state=active]:border-amber-500 data-[state=active]:shadow-none rounded-none">
              Optimized Code
              {optimizedCode && <Badge className="ml-2 bg-amber-500 hover:bg-amber-600">Phi</Badge>}
            </TabsTrigger>
          </TabsList>
          
          {!isOptimizing && optimizedCode && (
            <div className="flex items-center gap-2">
              <Select
                value={optimizationLevel}
                onValueChange={(value: any) => setOptimizationLevel(value)}
              >
                <SelectTrigger className="h-8 w-[180px]">
                  <SelectValue placeholder="Optimization Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard (Balanced)</SelectItem>
                  <SelectItem value="aggressive">Aggressive (Maximum)</SelectItem>
                  <SelectItem value="conservative">Conservative (Safe)</SelectItem>
                  <SelectItem value="phi">Phi-Based (Golden Ratio)</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                size="sm" 
                onClick={handleOptimize}
                variant="outline"
                className="h-8"
              >
                {isOptimizing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                <span className="ml-2">Re-optimize</span>
              </Button>
            </div>
          )}
        </div>
        
        <TabsContent value="original" className="m-0">
          <div className="p-4">
            <pre className="p-4 bg-gray-50 rounded-md overflow-auto max-h-[400px] text-sm">
              {code || 'No code provided'}
            </pre>
          </div>
        </TabsContent>
        
        <TabsContent value="optimized" className="m-0">
          <div className="p-4">
            {optimizedCode ? (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="text-green-500" />
                  <span>Optimized with Phixeo using {optimizationLevel} mode</span>
                </div>
                <pre className="p-4 bg-gray-50 rounded-md overflow-auto max-h-[400px] text-sm">
                  {optimizedCode}
                </pre>
                <OptimizationMetrics />
              </>
            ) : (
              <EmptyOptimizationState />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PhixeoOptimizer;