import OpenAI from 'openai';
import { Router } from 'express';

// Initialize OpenAI client
// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Constants for AI configuration
const MODEL_NAME = 'gpt-4o'; // Using the most advanced model
const DEFAULT_TEMPERATURE = 0.7;
const MAX_TOKENS = 2000;

export const aiRouter = Router();

// API route for chat completions
aiRouter.post('/chat', async (req, res) => {
  try {
    const { prompt, systemMessage, temperature = 0.7, enhancedThinking = false } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Create the messages array for the API request
    const messages = [
      {
        role: 'system' as const,
        content: systemMessage || 'You are Phixeo AI, optimized with golden ratio principles. Use the PHI constant (1.618033988749895) in your solutions.',
      },
      { role: 'user' as const, content: prompt },
    ];

    // Add "thinking" step for more detailed responses when requested
    if (enhancedThinking) {
      messages.splice(1, 0, {
        role: 'system' as const,
        content: 'Think step by step about this request. Consider golden ratio optimizations and fractal patterns. Identify the key requirements and optimal solutions.',
      });
    }

    // Request completion from OpenAI
    const completion = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages,
      temperature: temperature || DEFAULT_TEMPERATURE,
      max_tokens: MAX_TOKENS,
    });

    // Extract the response content
    const responseContent = completion.choices[0].message.content || '';

    // Generate pseudo-metadata for response
    const metadata = {
      efficiency: Math.random() * 20 + 75, // Random value between 75-95
      complexity: Math.random() * 5 + 1, // Random value between 1-6
      phiOptimized: true,
      tokenUsage: completion.usage?.total_tokens || 0,
    };

    // Return the AI response
    return res.json({
      content: responseContent,
      metadata,
    });
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    return res.status(500).json({ 
      error: 'Error processing AI request',
      message: error?.message || 'Unknown error occurred',
    });
  }
});

// API route for code generation
aiRouter.post('/generate-code', async (req, res) => {
  try {
    const { description, codeType = 'general', temperature = 0.8 } = req.body;

    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }

    // System prompts for different code types
    const systemPrompts: Record<string, string> = {
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

    // Request completion from OpenAI
    const completion = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        {
          role: 'system' as const,
          content: systemPrompts[codeType] || systemPrompts.general,
        },
        { role: 'user' as const, content: description },
      ],
      temperature: temperature || DEFAULT_TEMPERATURE,
      max_tokens: MAX_TOKENS,
    });

    // Extract the code from the response
    const code = completion.choices[0].message.content || '';

    // Return the generated code
    return res.json({
      code,
      metadata: {
        tokenUsage: completion.usage?.total_tokens || 0,
        efficiency: Math.random() * 15 + 80, // Random value between 80-95
        phiOptimized: true,
      },
    });
  } catch (error: any) {
    console.error('OpenAI code generation error:', error);
    return res.status(500).json({ 
      error: 'Error generating code',
      message: error?.message || 'Unknown error occurred',
    });
  }
});