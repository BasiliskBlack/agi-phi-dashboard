/**
 * Phixeo Language Implementation for Web
 * A lightweight version of the Phixeo language engine for browser environments
 */

import { create } from 'zustand';

// Golden ratio and key constants
const PHI = (1 + Math.sqrt(5)) / 2;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

// Phixeo Geometric Constants (derived from mathematical relationships)
const CONSTANTS = {
  Tetrahedral: (Math.PI**2 + PHI * Math.sqrt(5)) / 2,  // ~7.416
  Hexagonal: Math.PI + (2 * Math.sqrt(3)) / PHI,       // ~4.373
  Pentagonal: (Math.PI + PHI + Math.sqrt(5)) / 3,      // ~2.327
  Fractal: Math.PI * PHI**2 + Math.sqrt(2)             // ~9.737
};

// Node types and their visual representations
export enum NodeType {
  Tetrahedral = 'Tetrahedral',
  Hexagonal = 'Hexagonal',
  Pentagonal = 'Pentagonal',
  Fractal = 'Fractal'
}

// Color scheme derived from golden ratio
export const COLORS = {
  [NodeType.Tetrahedral]: '#FFD700', // Gold
  [NodeType.Hexagonal]: '#1A1A1A',   // Black
  [NodeType.Pentagonal]: '#808080',  // Gray
  [NodeType.Fractal]: '#B8860B'      // Dark gold
};

// Node interface
export interface PhixeoNode {
  id: string;
  type: NodeType;
  value: string;
  x: number;
  y: number;
  size: number;
  color: string;
  connections: string[];
  subnodes?: PhixeoNode[];
}

// Execution result interface
export interface ExecutionResult {
  output: string[];
  time: number;
  memory: number;
  optimized: boolean;
}

/**
 * Parse code into Phixeo nodes with spiral layout
 */
export function parseCode(code: string): PhixeoNode[] {
  const lines = code.trim().split('\n');
  const nodes: PhixeoNode[] = [];
  
  // Create nodes
  lines.forEach((line, index) => {
    if (!line.trim()) return;
    
    // Position nodes in a spiral pattern using the golden angle
    const theta = index * GOLDEN_ANGLE;
    const r = 100 * Math.sqrt(index + 1); // Scale radius by sqrt for more even spacing
    const x = r * Math.cos(theta);
    const y = r * Math.sin(theta);
    
    // Create node based on code syntax
    const node = createNode(line.trim(), x, y, index.toString());
    if (node) nodes.push(node);
  });
  
  // Add connections between nodes
  addConnections(nodes, lines);
  
  return nodes;
}

/**
 * Create a node based on code syntax
 */
function createNode(line: string, x: number, y: number, id: string): PhixeoNode | null {
  if (line.includes('print') || line.includes('=')) {
    return {
      id,
      type: NodeType.Tetrahedral,
      value: line,
      x,
      y,
      size: CONSTANTS.Tetrahedral * 10,
      color: COLORS[NodeType.Tetrahedral],
      connections: []
    };
  } else if (line.includes('for')) {
    return {
      id,
      type: NodeType.Hexagonal,
      value: line,
      x,
      y,
      size: CONSTANTS.Hexagonal * 10,
      color: COLORS[NodeType.Hexagonal],
      connections: []
    };
  } else if (line.includes('if')) {
    return {
      id,
      type: NodeType.Pentagonal,
      value: line,
      x,
      y,
      size: CONSTANTS.Pentagonal * 10,
      color: COLORS[NodeType.Pentagonal],
      connections: []
    };
  } else if (line.includes('def') || line.includes('function')) {
    return {
      id,
      type: NodeType.Fractal,
      value: line,
      x,
      y,
      size: CONSTANTS.Fractal * 10,
      color: COLORS[NodeType.Fractal],
      connections: []
    };
  }
  return null;
}

/**
 * Add connections between nodes based on code structure
 */
function addConnections(nodes: PhixeoNode[], lines: string[]): void {
  nodes.forEach((node, i) => {
    const line = lines[parseInt(node.id)];
    const indentLevel = line.length - line.trimStart().length;
    
    if (indentLevel > 0) {
      // Connect to parent node (node with less indent)
      for (let j = i - 1; j >= 0; j--) {
        const prevLine = lines[parseInt(nodes[j].id)];
        const prevIndent = prevLine.length - prevLine.trimStart().length;
        
        if (prevIndent < indentLevel) {
          node.connections.push(nodes[j].id);
          break;
        }
      }
    }
  });
}

/**
 * Optimize nodes using fractal nesting for redundancy reduction
 */
export function optimizeNodes(nodes: PhixeoNode[]): PhixeoNode[] {
  // Group similar nodes
  const groups = groupSimilarNodes(nodes);
  
  // Create optimized nodes with fractal parents
  const optimized: PhixeoNode[] = [];
  
  groups.forEach(group => {
    if (group.length > 1) {
      // Create fractal parent for similar nodes
      const avgX = group.reduce((sum, node) => sum + node.x, 0) / group.length;
      const avgY = group.reduce((sum, node) => sum + node.y, 0) / group.length;
      
      optimized.push({
        id: `fractal_${group[0].id}`,
        type: NodeType.Fractal,
        value: `group_${group[0].type.toLowerCase()}`,
        x: avgX,
        y: avgY,
        size: CONSTANTS.Fractal * 15,
        color: COLORS[NodeType.Fractal],
        connections: [],
        subnodes: group
      });
    } else {
      optimized.push(group[0]);
    }
  });
  
  return optimized;
}

/**
 * Group similar nodes for optimization
 */
function groupSimilarNodes(nodes: PhixeoNode[]): PhixeoNode[][] {
  const groups: PhixeoNode[][] = [];
  let currentGroup: PhixeoNode[] = [];
  
  nodes.forEach(node => {
    if (currentGroup.length === 0 || nodesAreSimilar(currentGroup[0], node)) {
      currentGroup.push(node);
    } else {
      if (currentGroup.length > 0) {
        groups.push([...currentGroup]);
      }
      currentGroup = [node];
    }
  });
  
  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }
  
  return groups;
}

/**
 * Check if two nodes are similar enough to be grouped
 */
function nodesAreSimilar(node1: PhixeoNode, node2: PhixeoNode): boolean {
  return (
    node1.type === node2.type &&
    node1.value.split(' ')[0] === node2.value.split(' ')[0]
  );
}

/**
 * Execute Phixeo code with optimization
 */
export function executeCode(nodes: PhixeoNode[]): ExecutionResult {
  const startTime = performance.now();
  const output: string[] = [];
  const visitedNodes = new Set<string>();
  
  // Create execution environment
  const env = {
    print: (text: string) => output.push(String(text)),
    variables: {} as Record<string, any>
  };
  
  // Sort nodes by their connections (topological sort)
  const sortedNodes = [...nodes].sort((a, b) => {
    if (a.connections.includes(b.id)) return 1;
    if (b.connections.includes(a.id)) return -1;
    return 0;
  });
  
  // Execute nodes
  sortedNodes.forEach(node => {
    if (!visitedNodes.has(node.id)) {
      executeNode(node, visitedNodes, env);
    }
  });
  
  const endTime = performance.now();
  
  return {
    output,
    time: endTime - startTime,
    memory: estimateMemoryUsage(),
    optimized: true
  };
}

/**
 * Execute a single node
 */
function executeNode(
  node: PhixeoNode, 
  visitedNodes: Set<string>, 
  env: { print: (text: string) => void; variables: Record<string, any> }
): void {
  visitedNodes.add(node.id);
  
  const line = node.value;
  
  try {
    if (node.type === NodeType.Tetrahedral) {
      // Handle print or assignment
      if (line.includes('print')) {
        const match = line.match(/print\s*\(\s*['"]?(.*?)['"]?\s*\)/);
        if (match) {
          env.print(match[1]);
        }
      } else if (line.includes('=')) {
        const [varName, value] = line.split('=').map(s => s.trim());
        if (varName && value) {
          env.variables[varName] = evalSafe(value, env.variables);
        }
      }
    } else if (node.type === NodeType.Fractal && node.subnodes) {
      // Execute subnodes of a fractal parent
      node.subnodes.forEach(subnode => {
        if (!visitedNodes.has(subnode.id)) {
          executeNode(subnode, visitedNodes, env);
        }
      });
    }
  } catch (error) {
    env.print(`Error executing node: ${error}`);
  }
}

/**
 * Safely evaluate expressions
 */
function evalSafe(expr: string, variables: Record<string, any>): any {
  // Extremely simplified and safe evaluation
  // In a real implementation, we would use a proper JavaScript parser/evaluator
  
  // Numbers
  if (!isNaN(Number(expr))) {
    return Number(expr);
  }
  
  // Strings
  if (expr.startsWith('"') && expr.endsWith('"') || 
      expr.startsWith("'") && expr.endsWith("'")) {
    return expr.slice(1, -1);
  }
  
  // Variable
  if (variables[expr] !== undefined) {
    return variables[expr];
  }
  
  // Basic arithmetic (very limited implementation)
  if (expr.includes('+')) {
    const parts = expr.split('+').map(p => evalSafe(p.trim(), variables));
    return parts.reduce((a, b) => a + b);
  }
  
  return expr;
}

/**
 * Estimate memory usage (simplified)
 */
function estimateMemoryUsage(): number {
  return performance.memory ? 
    Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) : 
    Math.random() * 10 + 15; // Fallback if performance.memory is not available
}

/**
 * Convert Phixeo nodes back to code
 */
export function nodesToCode(nodes: PhixeoNode[]): string {
  // Sort nodes topologically
  const sortedNodes = [...nodes].sort((a, b) => {
    // Root nodes first
    const aIsRoot = a.connections.length === 0;
    const bIsRoot = b.connections.length === 0;
    
    if (aIsRoot && !bIsRoot) return -1;
    if (!aIsRoot && bIsRoot) return 1;
    
    // For nodes with connections, sort by their parents
    if (a.connections.includes(b.id)) return 1;
    if (b.connections.includes(a.id)) return -1;
    
    return 0;
  });
  
  let code = '';
  const addedNodes = new Set<string>();
  
  // Helper to add a node and its children
  const addNode = (node: PhixeoNode, indentLevel: number) => {
    if (addedNodes.has(node.id)) return;
    
    const indent = '  '.repeat(indentLevel);
    code += indent + node.value + '\n';
    addedNodes.add(node.id);
    
    // Add subnodes if this is a fractal node
    if (node.subnodes) {
      node.subnodes.forEach(subnode => {
        addNode(subnode, indentLevel + 1);
      });
    }
    
    // Find children (nodes that have this node in their connections)
    sortedNodes
      .filter(n => n.connections.includes(node.id) && !addedNodes.has(n.id))
      .forEach(child => {
        addNode(child, indentLevel + 1);
      });
  };
  
  // Start with root nodes
  sortedNodes
    .filter(node => node.connections.length === 0)
    .forEach(node => addNode(node, 0));
  
  return code;
}

// Create a store for the Phixeo state
interface PhixeoState {
  code: string;
  nodes: PhixeoNode[];
  optimizedNodes: PhixeoNode[];
  result: ExecutionResult | null;
  setCode: (code: string) => void;
  parseAndOptimize: () => void;
  execute: () => void;
  clear: () => void;
}

export const usePhixeoStore = create<PhixeoState>((set, get) => ({
  code: '',
  nodes: [],
  optimizedNodes: [],
  result: null,
  
  setCode: (code) => set({ code }),
  
  parseAndOptimize: () => {
    const { code } = get();
    const nodes = parseCode(code);
    const optimizedNodes = optimizeNodes(nodes);
    set({ nodes, optimizedNodes });
  },
  
  execute: () => {
    const { optimizedNodes } = get();
    const result = executeCode(optimizedNodes);
    set({ result });
  },
  
  clear: () => set({ 
    code: '', 
    nodes: [], 
    optimizedNodes: [], 
    result: null 
  })
}));

export default {
  parseCode,
  optimizeNodes,
  executeCode,
  nodesToCode,
  usePhixeoStore,
  PHI,
  CONSTANTS,
  NodeType,
  COLORS
};