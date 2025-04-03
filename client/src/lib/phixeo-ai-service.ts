import { apiRequest } from './queryClient';

/**
 * Type definitions for the Phixeo AI service
 */
export type PhixeoAIAnalysisResponse = {
  analysis: {
    structureOverview: string;
    optimizationOpportunities: string[];
    fractalPatterns: string[];
    efficiencyScore: number;
    visualStructure: string;
    recommendedActions: string[];
  };
  phiMetrics: {
    phiRatio: number;
    tetrahedralConstant: number;
    hexagonalConstant: number;
    pentagonalConstant: number;
    fractalConstant: number;
    theoreticalEfficiency: number;
    optimizationConfidence: number;
  };
  tokenUsage: number;
};

export type PhixeoAIOptimizationResponse = {
  optimizedCode: string;
  metrics: {
    originalLength: number;
    optimizedLength: number;
    compressionRatio: number;
    phiCompressionScore: number;
    efficiencyGain: number;
    optimizationLevel: string;
    phi: number;
  };
  tokenUsage: number;
};

export type PhixeoAIVisualizationResponse = {
  visualization: {
    nodes: Array<{
      type: 'Tetrahedral' | 'Hexagonal' | 'Pentagonal' | 'Fractal';
      value: string;
      x: number;
      y: number;
      color: string;
      connections?: number[];
      size: number;
    }>;
  };
  phiConstants: Record<string, number>;
  goldenRatio: number;
  tokenUsage: number;
};

export type PhixeoAISelfImprovementResponse = {
  suggestions: {
    improvements: Array<{
      description: string;
      efficiencyGain: number;
      complexity: 'low' | 'medium' | 'high';
      pseudocode: string;
      phiWeight: number;
      priorityScore: number;
    }>;
  };
  phiMetrics: {
    goldenRatio: number;
    optimizationFactor: number;
    complexityReduction: number;
  };
  tokenUsage: number;
};

export type PhixeoAICommandResponse = {
  command: string;
  analysis: {
    commandType: string;
    code: string;
    explanation: string;
  };
  phiMetrics: {
    processingFactor: number;
    executionConstants: Record<string, number>;
  };
  tokenUsage: number;
};

/**
 * Analyzes code using Phixeo AI
 */
export const analyzeCode = async (code: string): Promise<PhixeoAIAnalysisResponse> => {
  try {
    const response = await apiRequest('/api/phixeo/analyze', {
      method: 'POST',
      body: JSON.stringify({ code }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return response;
  } catch (error) {
    console.error('Error analyzing code with Phixeo AI:', error);
    throw error;
  }
};

/**
 * Optimizes code using Phixeo AI
 */
export const optimizeCode = async (
  code: string, 
  optimizationLevel: 'standard' | 'aggressive' | 'conservative' | 'phi' = 'standard'
): Promise<PhixeoAIOptimizationResponse> => {
  try {
    const response = await apiRequest('/api/phixeo/optimize', {
      method: 'POST',
      body: JSON.stringify({ code, optimizationLevel }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return response;
  } catch (error) {
    console.error('Error optimizing code with Phixeo AI:', error);
    throw error;
  }
};

/**
 * Generates a visual representation of code using Phixeo AI
 */
export const visualizeCode = async (code: string): Promise<PhixeoAIVisualizationResponse> => {
  try {
    const response = await apiRequest('/api/phixeo/visualize', {
      method: 'POST',
      body: JSON.stringify({ code }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return response;
  } catch (error) {
    console.error('Error visualizing code with Phixeo AI:', error);
    throw error;
  }
};

/**
 * Generates self-improvement suggestions using Phixeo AI
 */
export const generateSelfImprovement = async (
  currentCode?: string,
  systemDescription?: string
): Promise<PhixeoAISelfImprovementResponse> => {
  try {
    const response = await apiRequest('/api/phixeo/self-improve', {
      method: 'POST',
      body: JSON.stringify({ 
        currentCode, 
        systemDescription: systemDescription || 'Phixeo is an AI-powered operating system interface that combines a custom programming language with advanced artificial intelligence capabilities.'
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return response;
  } catch (error) {
    console.error('Error generating self-improvement with Phixeo AI:', error);
    throw error;
  }
};

/**
 * Executes a natural language command using Phixeo AI
 */
export const executeCommand = async (command: string): Promise<PhixeoAICommandResponse> => {
  try {
    const response = await apiRequest('/api/phixeo/execute-command', {
      method: 'POST',
      body: JSON.stringify({ command }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return response;
  } catch (error) {
    console.error('Error executing command with Phixeo AI:', error);
    throw error;
  }
};

// Golden ratio constant - useful for client-side Phi-based calculations
export const PHI = (1 + Math.sqrt(5)) / 2; // 1.618033988749895

// Phixeo constants from the parser
export const PHIXEO_CONSTANTS = {
  Tetrahedral: (Math.PI**2 + PHI * Math.sqrt(5)) / 2,  // ~7.416
  Hexagonal: Math.PI + (2 * Math.sqrt(3)) / PHI,       // ~4.373
  Pentagonal: (Math.PI + PHI + Math.sqrt(5)) / 3,      // ~2.327
  Fractal: Math.PI * PHI**2 + Math.sqrt(2)             // ~9.737
};