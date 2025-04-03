import React from 'react';

const ParserVisualizationWindow: React.FC = () => {
  return (
    <div className="h-full overflow-auto bg-black p-8">
      {/* Phixeo Parser Visualization */}
      <div className="relative h-[280px] w-full">
        <svg viewBox="0 0 800 280" width="100%" height="100%">
          {/* Connecting Lines */}
          <path d="M400,140 L290,70" className="connect-line" strokeDasharray="3,3" />
          <path d="M400,140 L290,200" className="connect-line" strokeDasharray="3,3" />
          <path d="M400,140 L550,100" className="connect-line" strokeDasharray="3,3" />
          <path d="M400,140 L550,180" className="connect-line" strokeDasharray="3,3" />
          <path d="M290,70 L170,50" className="connect-line" strokeDasharray="3,3" />
          <path d="M290,70 L160,100" className="connect-line" strokeDasharray="3,3" />
          <path d="M290,200 L160,170" className="connect-line" strokeDasharray="3,3" />
          <path d="M290,200 L170,230" className="connect-line" strokeDasharray="3,3" />
          <path d="M550,100 L650,60" className="connect-line" strokeDasharray="3,3" />
          <path d="M550,180 L650,150" className="connect-line" strokeDasharray="3,3" />
          <path d="M550,180 L650,220" className="connect-line" strokeDasharray="3,3" />
          
          {/* Fractal Node (Center) */}
          <g className="node" transform="translate(400,140)">
            <polygon points="0,-30 26,-15 26,15 0,30 -26,15 -26,-15" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="1"/>
            <text x="0" y="5" textAnchor="middle" fill="#0F0F0F" fontSize="10">def main()</text>
          </g>
          
          {/* Tetrahedral Nodes (Level 1) */}
          <g className="node" transform="translate(290,70)">
            <polygon points="0,-24 21,-12 21,12 0,24 -21,12 -21,-12" fill="#D97706" stroke="#FFFFFF" strokeWidth="1"/>
            <text x="0" y="5" textAnchor="middle" fill="#0F0F0F" fontSize="9">print("Hello")</text>
          </g>
          
          <g className="node" transform="translate(290,200)">
            <polygon points="0,-24 21,-12 21,12 0,24 -21,12 -21,-12" fill="#D97706" stroke="#FFFFFF" strokeWidth="1"/>
            <text x="0" y="5" textAnchor="middle" fill="#0F0F0F" fontSize="9">x = phi * 3</text>
          </g>
          
          {/* Hexagonal Node (Level 1) */}
          <g className="node" transform="translate(550,100)">
            <polygon points="0,-18 16,-9 16,9 0,18 -16,9 -16,-9" fill="#B45309" stroke="#FFFFFF" strokeWidth="1"/>
            <text x="0" y="5" textAnchor="middle" fill="#FFFFFF" fontSize="8">for i in range(5)</text>
          </g>
          
          {/* Pentagonal Node (Level 1) */}
          <g className="node" transform="translate(550,180)">
            <polygon points="0,-18 17,0 10,15 -10,15 -17,0" fill="#92400E" stroke="#FFFFFF" strokeWidth="1"/>
            <text x="0" y="5" textAnchor="middle" fill="#FFFFFF" fontSize="8">if x {`>`} 10</text>
          </g>
          
          {/* Level 2 Nodes */}
          <g className="node" transform="translate(170,50)">
            <polygon points="0,-15 13,-7 13,7 0,15 -13,7 -13,-7" fill="#FBBF24" stroke="#FFFFFF" strokeWidth="1"/>
            <text x="0" y="3" textAnchor="middle" fill="#0F0F0F" fontSize="7">print(i)</text>
          </g>
          
          <g className="node" transform="translate(160,100)">
            <polygon points="0,-15 13,-7 13,7 0,15 -13,7 -13,-7" fill="#FBBF24" stroke="#FFFFFF" strokeWidth="1"/>
            <text x="0" y="3" textAnchor="middle" fill="#0F0F0F" fontSize="7">counter += 1</text>
          </g>
          
          <g className="node" transform="translate(160,170)">
            <polygon points="0,-15 13,-7 13,7 0,15 -13,7 -13,-7" fill="#FBBF24" stroke="#FFFFFF" strokeWidth="1"/>
            <text x="0" y="3" textAnchor="middle" fill="#0F0F0F" fontSize="7">y = x * 2</text>
          </g>
          
          <g className="node" transform="translate(170,230)">
            <polygon points="0,-15 13,-7 13,7 0,15 -13,7 -13,-7" fill="#FBBF24" stroke="#FFFFFF" strokeWidth="1"/>
            <text x="0" y="3" textAnchor="middle" fill="#0F0F0F" fontSize="7">z = sqrt(y)</text>
          </g>
          
          <g className="node" transform="translate(650,60)">
            <polygon points="0,-12 11,-6 11,6 0,12 -11,6 -11,-6" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="1"/>
            <text x="0" y="3" textAnchor="middle" fill="#0F0F0F" fontSize="6">total += i</text>
          </g>
          
          <g className="node" transform="translate(650,150)">
            <polygon points="0,-12 11,-6 11,6 0,12 -11,6 -11,-6" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="1"/>
            <text x="0" y="3" textAnchor="middle" fill="#0F0F0F" fontSize="6">print("Large")</text>
          </g>
          
          <g className="node" transform="translate(650,220)">
            <polygon points="0,-12 11,-6 11,6 0,12 -11,6 -11,-6" fill="#D97706" stroke="#FFFFFF" strokeWidth="1"/>
            <text x="0" y="3" textAnchor="middle" fill="#FFFFFF" fontSize="6">if y {`>`} 20</text>
          </g>
        </svg>
      </div>
    </div>
  );
};

export default ParserVisualizationWindow;
