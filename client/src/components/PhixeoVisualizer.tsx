import React, { useEffect, useRef, useState } from 'react';
import { PhixeoAIVisualizationResponse } from '@/lib/phixeo-ai-service';
import { PHI } from '@/lib/phixeo-ai-service';

type PhixeoVisualizerProps = {
  visualization?: PhixeoAIVisualizationResponse;
  width?: number;
  height?: number;
};

/**
 * Component for visualizing Phixeo nodes with a golden ratio-based spiral layout
 */
const PhixeoVisualizer: React.FC<PhixeoVisualizerProps> = ({ 
  visualization, 
  width = 800, 
  height = 600 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  
  // Draw the visualization when it changes
  useEffect(() => {
    if (!visualization || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear the canvas
    ctx.clearRect(0, 0, width, height);
    
    // Set the center point
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Draw connections first so they're behind the nodes
    drawConnections(ctx, visualization.visualization.nodes, centerX, centerY);
    
    // Draw each node
    visualization.visualization.nodes.forEach((node, index) => {
      drawNode(ctx, node, index, centerX, centerY, index === hoveredNode);
    });
    
  }, [visualization, width, height, hoveredNode]);
  
  // Handle mouse movement for node hovering
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!visualization || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Check if the mouse is over a node
    const hoveredIndex = visualization.visualization.nodes.findIndex((node, index) => {
      const nodeX = centerX + node.x;
      const nodeY = centerY + node.y;
      const distance = Math.sqrt((x - nodeX) ** 2 + (y - nodeY) ** 2);
      return distance <= node.size * 1.2; // Slightly larger hit area
    });
    
    setHoveredNode(hoveredIndex >= 0 ? hoveredIndex : null);
  };
  
  // Draw connections between nodes
  const drawConnections = (
    ctx: CanvasRenderingContext2D, 
    nodes: PhixeoAIVisualizationResponse['visualization']['nodes'],
    centerX: number,
    centerY: number
  ) => {
    ctx.save();
    
    nodes.forEach((node, nodeIndex) => {
      if (node.connections && node.connections.length > 0) {
        node.connections.forEach(connectionIndex => {
          if (connectionIndex < nodes.length) {
            const connectedNode = nodes[connectionIndex];
            
            const startX = centerX + node.x;
            const startY = centerY + node.y;
            const endX = centerX + connectedNode.x;
            const endY = centerY + connectedNode.y;
            
            // Draw connection line
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = 'rgba(150, 150, 150, 0.5)';
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            
            // Draw arrow at end
            const angle = Math.atan2(endY - startY, endX - startX);
            ctx.beginPath();
            ctx.moveTo(endX, endY);
            ctx.lineTo(
              endX - 10 * Math.cos(angle - Math.PI / 6),
              endY - 10 * Math.sin(angle - Math.PI / 6)
            );
            ctx.lineTo(
              endX - 10 * Math.cos(angle + Math.PI / 6),
              endY - 10 * Math.sin(angle + Math.PI / 6)
            );
            ctx.closePath();
            ctx.fillStyle = 'rgba(150, 150, 150, 0.5)';
            ctx.fill();
          }
        });
      }
    });
    
    ctx.restore();
  };
  
  // Draw a single node
  const drawNode = (
    ctx: CanvasRenderingContext2D, 
    node: PhixeoAIVisualizationResponse['visualization']['nodes'][0],
    index: number,
    centerX: number,
    centerY: number,
    isHovered: boolean
  ) => {
    const x = centerX + node.x;
    const y = centerY + node.y;
    const size = node.size * (isHovered ? 1.2 : 1);
    
    ctx.save();
    
    // Draw the shape based on node type
    ctx.beginPath();
    
    switch (node.type) {
      case 'Tetrahedral':
        drawTriangle(ctx, x, y, size);
        break;
      case 'Hexagonal':
        drawHexagon(ctx, x, y, size);
        break;
      case 'Pentagonal':
        drawPentagon(ctx, x, y, size);
        break;
      case 'Fractal':
        drawSpiral(ctx, x, y, size);
        break;
      default:
        // Default to circle
        ctx.arc(x, y, size, 0, Math.PI * 2);
    }
    
    // Add a glow effect for hovered nodes
    if (isHovered) {
      ctx.shadowColor = getColorForType(node.type);
      ctx.shadowBlur = 15;
    }
    
    // Fill with the node's color
    ctx.fillStyle = getColorForType(node.type);
    ctx.fill();
    
    // Add border
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Add node label
    const label = node.value.length > 15 ? node.value.substring(0, 15) + '...' : node.value;
    ctx.font = isHovered ? 'bold 14px Arial' : '12px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x, y);
    
    // If hovered, show additional info
    if (isHovered) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(x + size + 10, y - 40, 180, 80);
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'left';
      ctx.font = '12px Arial';
      ctx.fillText(`Type: ${node.type}`, x + size + 20, y - 20);
      ctx.fillText(`Size: ${node.size.toFixed(2)}`, x + size + 20, y);
      ctx.fillText(`Position: (${node.x.toFixed(0)}, ${node.y.toFixed(0)})`, x + size + 20, y + 20);
    }
    
    ctx.restore();
  };
  
  // Helper functions for drawing different node shapes
  const drawTriangle = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    const height = size * Math.sqrt(3) / 2;
    ctx.moveTo(x, y - height / 2);
    ctx.lineTo(x - size / 2, y + height / 2);
    ctx.lineTo(x + size / 2, y + height / 2);
    ctx.closePath();
  };
  
  const drawHexagon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * i) / 3;
      const pointX = x + size * Math.cos(angle);
      const pointY = y + size * Math.sin(angle);
      if (i === 0) {
        ctx.moveTo(pointX, pointY);
      } else {
        ctx.lineTo(pointX, pointY);
      }
    }
    ctx.closePath();
  };
  
  const drawPentagon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    for (let i = 0; i < 5; i++) {
      const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
      const pointX = x + size * Math.cos(angle);
      const pointY = y + size * Math.sin(angle);
      if (i === 0) {
        ctx.moveTo(pointX, pointY);
      } else {
        ctx.lineTo(pointX, pointY);
      }
    }
    ctx.closePath();
  };
  
  const drawSpiral = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    // Draw an octagon to represent a spiral/fractal node
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * i) / 4;
      const pointX = x + size * Math.cos(angle);
      const pointY = y + size * Math.sin(angle);
      if (i === 0) {
        ctx.moveTo(pointX, pointY);
      } else {
        ctx.lineTo(pointX, pointY);
      }
    }
    ctx.closePath();
  };
  
  // Get color for each node type
  const getColorForType = (type: string): string => {
    switch (type) {
      case 'Tetrahedral':
        return '#e74c3c'; // Red
      case 'Hexagonal':
        return '#3498db'; // Blue
      case 'Pentagonal':
        return '#2ecc71'; // Green
      case 'Fractal':
        return '#9b59b6'; // Purple
      default:
        return '#95a5a6'; // Gray
    }
  };
  
  // Render placeholder if no visualization is provided
  if (!visualization) {
    return (
      <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 h-[600px] w-full">
        <div className="text-center text-gray-500">
          <h3 className="text-lg font-semibold mb-2">Phixeo Visualizer</h3>
          <p>No visualization data available</p>
          <p className="text-sm mt-2">Generate a visualization with Phixeo AI to see your code as nodes</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative border rounded-lg shadow-md bg-black">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseMove={handleMouseMove}
        className="rounded-lg"
      />
      <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs p-2 rounded">
        <div>Nodes: {visualization.visualization.nodes.length}</div>
        <div>Golden Ratio (Φ): {visualization.goldenRatio.toFixed(5)}</div>
      </div>
      <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs p-2 rounded flex gap-2">
        <div className="flex items-center">
          <span className="w-3 h-3 inline-block mr-1 bg-red-500 rounded-full"></span>
          <span>Tetrahedral</span>
        </div>
        <div className="flex items-center">
          <span className="w-3 h-3 inline-block mr-1 bg-blue-500 rounded-full"></span>
          <span>Hexagonal</span>
        </div>
        <div className="flex items-center">
          <span className="w-3 h-3 inline-block mr-1 bg-green-500 rounded-full"></span>
          <span>Pentagonal</span>
        </div>
        <div className="flex items-center">
          <span className="w-3 h-3 inline-block mr-1 bg-purple-500 rounded-full"></span>
          <span>Fractal</span>
        </div>
      </div>
    </div>
  );
};

export default PhixeoVisualizer;