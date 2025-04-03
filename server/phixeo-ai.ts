import OpenAI from 'openai';
import { Router } from 'express';
import { promisify } from 'util';
import { exec } from 'child_process';

// Initialize OpenAI client
// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const execAsync = promisify(exec);

// Constants for AI configuration
const MODEL_NAME = 'gpt-4o'; // Using the most advanced model
const DEFAULT_TEMPERATURE = 0.7;
const MAX_TOKENS = 2000;

// Phixeo constants - from the Python files
const PHI = (1 + Math.sqrt(5)) / 2; // Golden ratio
const PHIXEO_CONSTANTS = {
  Tetrahedral: (Math.PI**2 + PHI * Math.sqrt(5)) / 2,  // ~7.416
  Hexagonal: Math.PI + (2 * Math.sqrt(3)) / PHI,       // ~4.373
  Pentagonal: (Math.PI + PHI + Math.sqrt(5)) / 3,      // ~2.327
  Fractal: Math.PI * PHI**2 + Math.sqrt(2)             // ~9.737
};

export const phixeoAiRouter = Router();

// API route for Phixeo code analysis
phixeoAiRouter.post('/analyze', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    // Create the prompt for code analysis
    const prompt = `
You are a Phixeo AI agent optimized with golden ratio principles. Analyze the following code:

\`\`\`
${code}
\`\`\`

Provide a detailed analysis with the following sections:
1. Structure Overview: Identify major components and their functions
2. Optimization Opportunities: Suggest ways to optimize using phi-based patterns
3. Fractal Patterns: Identify any repeating patterns that could be optimized with fractal nodes
4. Efficiency Score: Rate code efficiency on a scale from 0-100 based on golden ratio principles
5. Visual Structure: Describe how this code would look when visualized with Phixeo nodes

Format the response as JSON with the following keys:
- structureOverview
- optimizationOpportunities
- fractalPatterns
- efficiencyScore
- visualStructure
- recommendedActions
`;

    // Request the OpenAI analysis
    const completion = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: 'system' as const, content: 'You are a Phixeo AI agent specialized in code analysis using golden ratio principles.' },
        { role: 'user' as const, content: prompt }
      ],
      temperature: 0.7,
      max_tokens: MAX_TOKENS,
      response_format: { type: "json_object" }
    });

    // Extract the analysis from the response
    const analysisResponse = completion.choices[0].message.content;
    const analysis = analysisResponse ? JSON.parse(analysisResponse) : {};

    // Add phi-based metrics
    const phiMetrics = {
      phiRatio: PHI,
      tetrahedralConstant: PHIXEO_CONSTANTS.Tetrahedral,
      hexagonalConstant: PHIXEO_CONSTANTS.Hexagonal,
      pentagonalConstant: PHIXEO_CONSTANTS.Pentagonal,
      fractalConstant: PHIXEO_CONSTANTS.Fractal,
      theoreticalEfficiency: Math.min(100, Math.floor(analysis.efficiencyScore * PHI)),
      optimizationConfidence: Math.min(100, Math.floor((analysis.efficiencyScore / 100) * PHI * 100))
    };

    // Return the analysis
    return res.json({
      analysis,
      phiMetrics,
      tokenUsage: completion.usage?.total_tokens || 0
    });
  } catch (error: any) {
    console.error('Phixeo AI analysis error:', error);
    return res.status(500).json({ 
      error: 'Error analyzing code',
      message: error?.message || 'Unknown error occurred'
    });
  }
});

// API route for generating optimized Phixeo code
phixeoAiRouter.post('/optimize', async (req, res) => {
  try {
    const { code, optimizationLevel = 'standard' } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    // Define optimization levels
    const optimizationLevels = {
      standard: 0.7, // Balanced optimization
      aggressive: 0.9, // More creative, aggressive optimization
      conservative: 0.3, // Safer, more conservative optimization
      phi: PHI / 3 // Golden ratio based optimization temperature
    };

    // Set temperature based on optimization level
    const temperature = optimizationLevels[optimizationLevel as keyof typeof optimizationLevels] || 0.7;

    // Create system prompt based on optimization level
    let systemPrompt = 'You are a Phixeo AI optimizer that enhances code using golden ratio principles.';
    
    if (optimizationLevel === 'aggressive') {
      systemPrompt += ' Focus on maximum optimization, even if it requires significant code restructuring.';
    } else if (optimizationLevel === 'conservative') {
      systemPrompt += ' Focus on safe optimizations that preserve the original code structure and functionality.';
    } else if (optimizationLevel === 'phi') {
      systemPrompt += ` Apply the golden ratio (PHI = ${PHI}) in your optimization approach for fractal self-improvement.`;
    }

    // Create the prompt for code optimization
    const prompt = `
Optimize the following code using Phixeo's golden ratio principles:

\`\`\`
${code}
\`\`\`

Apply the following optimization techniques:
1. Identify repeated code patterns and extract them into fractal structures
2. Apply geometric scaling using PHI (${PHI}) for efficient resource allocation
3. Use tetrahedral (${PHIXEO_CONSTANTS.Tetrahedral}), hexagonal (${PHIXEO_CONSTANTS.Hexagonal}), pentagonal (${PHIXEO_CONSTANTS.Pentagonal}), and fractal (${PHIXEO_CONSTANTS.Fractal}) constants for operations
4. Implement parallel processing patterns where appropriate
5. Optimize memory usage through phi-based caching strategies

Return only the optimized code, no explanations or comments.
`;

    // Request the OpenAI optimization
    const completion = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: 'system' as const, content: systemPrompt },
        { role: 'user' as const, content: prompt }
      ],
      temperature,
      max_tokens: MAX_TOKENS
    });

    // Extract the optimized code from the response
    const optimizedCode = completion.choices[0].message.content || '';

    // Calculate phi-based optimization metrics
    const originalLength = code.length;
    const optimizedLength = optimizedCode.length;
    const compressionRatio = originalLength / optimizedLength;
    const phiCompressionScore = Math.min(100, Math.round((compressionRatio / PHI) * 100));
    const efficiencyGain = Math.min(100, Math.round((1 - (optimizedLength / originalLength)) * PHI * 100));

    // Return the optimized code and metrics
    return res.json({
      optimizedCode,
      metrics: {
        originalLength,
        optimizedLength,
        compressionRatio,
        phiCompressionScore,
        efficiencyGain,
        optimizationLevel,
        phi: PHI
      },
      tokenUsage: completion.usage?.total_tokens || 0
    });
  } catch (error: any) {
    console.error('Phixeo AI optimization error:', error);
    return res.status(500).json({ 
      error: 'Error optimizing code',
      message: error?.message || 'Unknown error occurred'
    });
  }
});

// API route for generating visual node representation
phixeoAiRouter.post('/visualize', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    // Create the prompt for code visualization
    const prompt = `
Analyze the following code and generate a JSON representation of Phixeo visual nodes:

\`\`\`
${code}
\`\`\`

Each node should have:
- type: one of ["Tetrahedral", "Hexagonal", "Pentagonal", "Fractal"]
- value: the code expression or statement
- x, y: coordinates in a spiral pattern based on golden ratio
- color: appropriate color based on node type
- connections: array of indices to connected nodes (if applicable)
- size: node size based on Phixeo constants

Apply these rules:
- Tetrahedral nodes (red): for print statements and assignments
- Hexagonal nodes (blue): for loops
- Pentagonal nodes (green): for conditionals
- Fractal nodes (purple): for functions/methods

Format response as a valid JSON array of node objects.
`;

    // Request the OpenAI visualization
    const completion = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { 
          role: 'system' as const, 
          content: 'You are a Phixeo visual programming expert. Generate JSON representations of code as visual nodes using the golden ratio for layout.'
        },
        { role: 'user' as const, content: prompt }
      ],
      temperature: 0.5,
      max_tokens: MAX_TOKENS,
      response_format: { type: "json_object" }
    });

    // Extract the visual nodes from the response
    const visualizationResponse = completion.choices[0].message.content;
    let visualization;
    
    try {
      visualization = visualizationResponse ? JSON.parse(visualizationResponse) : { nodes: [] };
    } catch (parseError) {
      // If parsing fails, return raw response for debugging
      return res.status(500).json({
        error: 'Error parsing visualization JSON',
        rawResponse: visualizationResponse
      });
    }

    // Return the visualization data
    return res.json({
      visualization,
      phiConstants: PHIXEO_CONSTANTS,
      goldenRatio: PHI,
      tokenUsage: completion.usage?.total_tokens || 0
    });
  } catch (error: any) {
    console.error('Phixeo AI visualization error:', error);
    return res.status(500).json({ 
      error: 'Error generating visualization',
      message: error?.message || 'Unknown error occurred'
    });
  }
});

// API route for self-improvement suggestions
phixeoAiRouter.post('/self-improve', async (req, res) => {
  try {
    const { currentCode, systemDescription } = req.body;

    // Create the prompt for self-improvement
    const prompt = `
Analyze the current Phixeo system described below and generate advanced self-improvement suggestions:

${systemDescription || 'Phixeo is an AI-powered operating system interface that combines a custom programming language with advanced artificial intelligence capabilities.'}

${currentCode ? `Current implementation snippet:\n\`\`\`\n${currentCode}\n\`\`\`` : ''}

Generate 3-5 specific self-improvement actions that Phixeo could implement to enhance itself using:
1. Golden ratio optimizations (PHI = ${PHI})
2. Fractal pattern recognition
3. Advanced parallel processing
4. Geometric scaling for resource allocation
5. AI-driven self-modification

For each improvement, provide:
- A detailed description
- Estimated efficiency gain (as a percentage)
- Implementation complexity (low/medium/high)
- Sample pseudocode implementation

Format the response as JSON with an array of improvement objects.
`;

    // Request the OpenAI self-improvement suggestions
    const completion = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { 
          role: 'system' as const, 
          content: 'You are an advanced AI agent focused on self-improvement algorithms and phi-optimized systems.'
        },
        { role: 'user' as const, content: prompt }
      ],
      temperature: 0.8,
      max_tokens: MAX_TOKENS,
      response_format: { type: "json_object" }
    });

    // Extract the self-improvement suggestions from the response
    const suggestionsResponse = completion.choices[0].message.content;
    const suggestions = suggestionsResponse ? JSON.parse(suggestionsResponse) : { improvements: [] };

    // Apply phi-based weighting to the suggestions
    const weightedSuggestions = Array.isArray(suggestions.improvements) 
      ? suggestions.improvements.map((improvement: any, index: number) => ({
          ...improvement,
          phiWeight: Math.round((PHI / (index + 1)) * 100) / 100,
          priorityScore: Math.round((improvement.efficiencyGain || 0) * (PHI / (index + 1)))
        }))
      : [];

    // Return the self-improvement suggestions
    return res.json({
      suggestions: {
        improvements: weightedSuggestions
      },
      phiMetrics: {
        goldenRatio: PHI,
        optimizationFactor: PHI**2,
        complexityReduction: 1/PHI
      },
      tokenUsage: completion.usage?.total_tokens || 0
    });
  } catch (error: any) {
    console.error('Phixeo AI self-improvement error:', error);
    return res.status(500).json({ 
      error: 'Error generating self-improvement suggestions',
      message: error?.message || 'Unknown error occurred'
    });
  }
});

// API route for advanced command execution
phixeoAiRouter.post('/execute-command', async (req, res) => {
  try {
    const { command } = req.body;

    if (!command) {
      return res.status(400).json({ error: 'Command is required' });
    }

    // Create the prompt to analyze the command
    const prompt = `
You are Phixeo AI, optimized with golden ratio principles. 
Parse this natural language command and convert it to executable code:

"${command}"

First determine if this command is:
1. A system operation (file management, process control)
2. A data analysis request
3. A code generation request
4. A visual programming action
5. A security-related operation

Then, generate the appropriate code implementation.
Respond with JSON containing:
- commandType: the type of command
- code: the executable code
- explanation: brief explanation of what the code does
`;

    // Request the OpenAI command analysis
    const completion = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: 'system' as const, content: 'You are Phixeo AI, specialized in converting natural language to executable code.' },
        { role: 'user' as const, content: prompt }
      ],
      temperature: 0.5,
      max_tokens: MAX_TOKENS,
      response_format: { type: "json_object" }
    });

    // Extract the command analysis from the response
    const analysisResponse = completion.choices[0].message.content;
    const analysis = analysisResponse ? JSON.parse(analysisResponse) : {};

    // For now, we'll just return the analysis, but in a real implementation
    // we might actually execute the generated code (with proper security measures)
    return res.json({
      command,
      analysis,
      phiMetrics: {
        processingFactor: PHI,
        executionConstants: PHIXEO_CONSTANTS
      },
      tokenUsage: completion.usage?.total_tokens || 0
    });
  } catch (error: any) {
    console.error('Phixeo AI command execution error:', error);
    return res.status(500).json({ 
      error: 'Error processing command',
      message: error?.message || 'Unknown error occurred'
    });
  }
});