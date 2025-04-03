import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { generateSelfImprovement, PHI } from '@/lib/phixeo-ai-service';
import { Loader2, Sparkles, Brain, ArrowUpRight, Code, ChevronRight, Star } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

/**
 * Component for self-improvement using Phixeo AI
 */
const PhixeoSelfImprover: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [systemDescription, setSystemDescription] = useState(
    'Phixeo is an AI-powered operating system interface that combines a custom programming language with advanced artificial intelligence capabilities.'
  );
  const [improvements, setImprovements] = useState<any[] | null>(null);
  const [phiMetrics, setPhiMetrics] = useState<any | null>(null);
  
  // Generate self-improvement suggestions
  const handleGenerateSuggestions = async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    setImprovements(null);
    setPhiMetrics(null);
    
    try {
      const response = await generateSelfImprovement(undefined, systemDescription);
      setImprovements(response.suggestions.improvements);
      setPhiMetrics(response.phiMetrics);
    } catch (error) {
      console.error('Error generating self-improvement suggestions:', error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Format the pseudocode with syntax highlighting
  const formatPseudocode = (code: string) => {
    return (
      <pre className="p-4 bg-gray-50 rounded-md overflow-auto max-h-[200px] text-sm mt-2">
        {code}
      </pre>
    );
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Phixeo Self-Improvement</CardTitle>
              <CardDescription>
                Generate AI-powered suggestions to improve Phixeo system using golden ratio principles
              </CardDescription>
            </div>
            <div className="text-amber-500 flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              <span className="font-mono">Φ = {PHI.toFixed(10)}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              System Description
            </label>
            <Textarea
              value={systemDescription}
              onChange={(e) => setSystemDescription(e.target.value)}
              placeholder="Describe the current Phixeo system..."
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Improvements are weighted by the golden ratio (Φ) for optimal results
          </div>
          <Button
            onClick={handleGenerateSuggestions}
            disabled={isGenerating || !systemDescription}
            className="bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" />
                Generate Improvements
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {isGenerating && (
        <div className="flex justify-center items-center p-12">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-amber-500" />
            <h3 className="text-lg font-semibold mb-2">Generating Self-Improvements</h3>
            <p className="text-gray-500">
              Using fractal pattern recognition and phi-based algorithms to analyze system...
            </p>
          </div>
        </div>
      )}

      {improvements && improvements.length > 0 && (
        <div className="space-y-6">
          {phiMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Golden Ratio</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold">{phiMetrics.goldenRatio.toFixed(6)}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    Used for weighting improvement priorities
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Optimization Factor</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold">{phiMetrics.optimizationFactor.toFixed(4)}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    Φ² = enhanced optimization capabilities
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Complexity Reduction</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold">{phiMetrics.complexityReduction.toFixed(6)}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    1/Φ = ideal complexity reduction ratio
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
          
          <Alert>
            <Brain className="h-4 w-4" />
            <AlertTitle>Phi-Optimized Improvement Suggestions</AlertTitle>
            <AlertDescription>
              These suggestions are prioritized using the golden ratio for maximum impact.
              Higher priority scores indicate more potential value.
            </AlertDescription>
          </Alert>
          
          {improvements.map((improvement, index) => (
            <Card key={index} className={index === 0 ? "border-amber-500 shadow-md" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Star
                      className={`mr-2 h-5 w-5 ${
                        index === 0 ? "text-amber-500" : "text-gray-400"
                      }`}
                      fill={index === 0 ? "currentColor" : "none"}
                    />
                    Improvement {index + 1}
                    {index === 0 && (
                      <Badge className="ml-2 bg-amber-500">Top Priority</Badge>
                    )}
                  </CardTitle>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <span>Φ-weight: {improvement.phiWeight}</span>
                        <span className="font-bold text-amber-600">
                          {improvement.priorityScore}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Priority score based on golden ratio weighting</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <CardDescription className="mt-2 text-base">
                  {improvement.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="text-sm">
                      <span className="font-medium">Efficiency Gain:</span>{" "}
                      <span className="text-green-600">
                        +{improvement.efficiencyGain}%
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Complexity:</span>{" "}
                      <span
                        className={
                          improvement.complexity === "low"
                            ? "text-green-600"
                            : improvement.complexity === "medium"
                            ? "text-amber-600"
                            : "text-red-600"
                        }
                      >
                        {improvement.complexity.charAt(0).toUpperCase() +
                          improvement.complexity.slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  <Progress value={improvement.efficiencyGain} className="h-2" />
                  
                  <div>
                    <h4 className="text-sm font-medium flex items-center mb-2">
                      <Code className="mr-2 h-4 w-4" />
                      Implementation
                    </h4>
                    {formatPseudocode(improvement.pseudocode)}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" disabled>
                  <span>Implement</span>
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PhixeoSelfImprover;