import React, { useState, useEffect, useRef } from 'react';
import { runPhixeoCode, loadPhixeoProgram } from '@/lib/phixeo';
import { COLORS, FONT_SIZE, RADIUS, SPACING, TRANSITIONS } from '@/lib/phixeo-styles';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Sample Phixeo code examples
const EXAMPLE_PROGRAMS = [
  { name: "System Core", path: "/examples/phixeo_system.phx" },
  { name: "UI Components", path: "/examples/phixeo_ui.phx" },
  { name: "Neural Optimization", path: "/examples/phixeo_neural.phx" }
];

type PhixeoEditorProps = {
  initialCode?: string;
  height?: string;
  onCodeChange?: (code: string) => void;
  onRunComplete?: (result: any) => void;
};

const PhixeoEditor: React.FC<PhixeoEditorProps> = ({
  initialCode = '# Phixeo OS\n# Write your Phixeo code here\n\n# Initialize system\nsystem.init(phi=1.618)\n\n# Print greeting\nprint("Hello from Phixeo OS!")\n\n# Calculate optimization score\nvar score = system.calculate_efficiency_score()\nprint("Efficiency score: " + score)',
  height = "400px",
  onCodeChange,
  onRunComplete
}) => {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [currentProgram, setCurrentProgram] = useState("");
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (onCodeChange) {
      onCodeChange(code);
    }
  }, [code, onCodeChange]);

  // Redirect console output to our output area
  useEffect(() => {
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;

    console.log = (...args) => {
      setOutput(prev => prev + args.join(' ') + '\n');
      originalConsoleLog(...args);
    };

    console.error = (...args) => {
      setOutput(prev => prev + 'ERROR: ' + args.join(' ') + '\n');
      originalConsoleError(...args);
    };

    return () => {
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
    };
  }, []);

  // Auto-scroll output to bottom
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
  };

  const handleRun = async () => {
    setIsRunning(true);
    setOutput("Running Phixeo code...\n\n");
    
    try {
      const result = runPhixeoCode(code);
      setOutput(prev => prev + "Execution complete.\n");
      
      if (onRunComplete) {
        onRunComplete(result);
      }
    } catch (error) {
      console.error("Error executing Phixeo code:", error);
      setOutput(prev => prev + `Error executing Phixeo code: ${error}\n`);
    } finally {
      setIsRunning(false);
    }
  };

  const loadExample = async (examplePath: string) => {
    setIsRunning(true);
    setOutput(`Loading example from ${examplePath}...\n`);
    setCurrentProgram(examplePath);
    
    try {
      const response = await fetch(examplePath);
      if (!response.ok) {
        throw new Error(`Failed to load example: ${response.statusText}`);
      }
      
      const exampleCode = await response.text();
      setCode(exampleCode);
      setOutput(prev => prev + "Example loaded successfully.\n");
    } catch (error) {
      console.error("Error loading example:", error);
      setOutput(prev => prev + `Error loading example: ${error}\n`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleClear = () => {
    setOutput("");
  };

  return (
    <div 
      className="phixeo-editor"
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height,
        borderRadius: RADIUS.md,
        overflow: 'hidden',
        border: `1px solid ${COLORS.accent1}`,
        backgroundColor: COLORS.black,
      }}
    >
      <div 
        className="editor-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: SPACING.md,
          borderBottom: `1px solid ${COLORS.accent1}`,
          backgroundColor: COLORS.accent1,
        }}
      >
        <h3 
          style={{ 
            margin: 0, 
            color: COLORS.gold,
            fontWeight: 'bold',
            fontSize: FONT_SIZE.lg,
            display: 'flex',
            alignItems: 'center',
            gap: SPACING.sm
          }}
        >
          <span className="phi-icon" style={{ fontSize: FONT_SIZE.lg, color: COLORS.gold, animation: 'phi-pulse 3s infinite' }}>φ</span>
          <span style={{ 
            background: 'linear-gradient(to right, #FFD700, #B8860B, #FFD700)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundSize: '200% auto',
            animation: 'shine 3s linear infinite'
          }}>
            Midax - IDE for Cyber-Gold
          </span>
        </h3>
        <div style={{ display: 'flex', gap: SPACING.sm }}>
          <Button 
            className="phixeo-button phixeo-button-primary"
            onClick={handleRun}
            disabled={isRunning}
            style={{ 
              animation: isRunning ? '' : 'phi-glow 3s infinite',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {isRunning ? 'Running...' : 'Run Phixeo Code'}
          </Button>
          <Button 
            className="phixeo-button phixeo-button-secondary"
            onClick={handleClear}
            style={{ animation: output ? 'phi-pulse 3s infinite' : '' }}
          >
            Clear Output
          </Button>
        </div>
      </div>
      
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: '60% 40%',
          flex: 1,
          overflow: 'hidden',
          gap: '0',
        }}
      >
        <div style={{ overflow: 'hidden', height: '100%' }}>
          <Tabs defaultValue="editor" className="w-full h-full flex flex-col">
            <div className="flex justify-between items-center px-2 border-b border-amber-900/20">
              <TabsList className="h-10" style={{ background: 'linear-gradient(180deg, #1a1a1a, #0D0D0D)', border: `1px solid ${COLORS.accent1}`, borderRadius: '6px' }}>
                <TabsTrigger 
                  value="editor" 
                  className="data-[state=active]:text-transparent data-[state=active]:bg-clip-text"
                  style={{ 
                    fontWeight: 'bold', 
                    background: 'linear-gradient(45deg, #000, #222)',
                    border: `1px solid ${COLORS.accent1}`,
                    padding: '4px 12px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <span className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-400 data-[state=active]:to-amber-600 data-[state=active]:bg-clip-text">Code</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="examples" 
                  className="data-[state=active]:text-transparent data-[state=active]:bg-clip-text"
                  style={{ 
                    fontWeight: 'bold', 
                    background: 'linear-gradient(45deg, #000, #222)',
                    border: `1px solid ${COLORS.accent1}`,
                    padding: '4px 12px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <span className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-400 data-[state=active]:to-amber-600 data-[state=active]:bg-clip-text">Examples</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="editor" className="flex-1 p-0 m-0 h-full">
              <textarea
                ref={editorRef}
                className="phixeo-code-editor"
                style={{
                  width: '100%',
                  height: '100%',
                  padding: SPACING.md,
                  border: `1px solid ${COLORS.accent1}`,
                  outline: 'none',
                  resize: 'none',
                  fontFamily: '"Fira Code", monospace',
                  fontSize: FONT_SIZE.md,
                  lineHeight: 1.5,
                  backgroundColor: '#0D0D0D',
                  color: '#E6C975',
                  caretColor: COLORS.gold,
                  boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.5)',
                  borderRadius: '4px',
                  margin: '4px',
                }}
                value={code}
                onChange={handleCodeChange}
                spellCheck={false}
                placeholder="Write Phixeo code here..."
              />
            </TabsContent>
            
            <TabsContent value="examples" className="flex-1 p-0 m-0 h-full">
              <div className="p-4 h-full overflow-auto" style={{ background: 'linear-gradient(0deg, #050505, #0D0D0D)', boxShadow: 'inset 0 0 40px rgba(0, 0, 0, 0.7)' }}>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="phi-icon" style={{ fontSize: FONT_SIZE.lg, color: COLORS.gold, animation: 'phi-pulse 3s infinite' }}>φ</span>
                <span style={{ 
                  background: 'linear-gradient(to right, #FFD700, #B8860B, #FFD700)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundSize: '200% auto',
                  animation: 'shine 3s linear infinite'
                }}>
                  Midax Example Programs
                </span>
              </h3>
                <div className="grid gap-4">
                  {EXAMPLE_PROGRAMS.map((example) => (
                    <div 
                      key={example.path}
                      className="phixeo-card p-4 rounded-md transition-all"
                      style={{
                        background: '#0D0D0D',
                        border: `1px solid ${COLORS.accent1}`,
                        boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.3)',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                    >
                      <h4 className="flex items-center gap-2 font-medium mb-2">
                        <span className="phi-icon" style={{ color: COLORS.gold, fontSize: '0.9em' }}>φ</span>
                        <span style={{ 
                          background: 'linear-gradient(to right, #FFD700, #D4AF37)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent'
                        }}>
                          {example.name}
                        </span>
                      </h4>
                      <p className="text-gray-300 text-sm mb-3">
                        {example.name === "System Core" && "Core system module with fractal optimization algorithms"}
                        {example.name === "UI Components" && "UI component system with golden ratio-based layouts"}
                        {example.name === "Neural Optimization" && "Advanced neural network optimization engine"}
                      </p>
                      <Button 
                        className="phixeo-button phixeo-button-primary w-full"
                        onClick={() => loadExample(example.path)}
                        disabled={isRunning}
                        style={{ 
                          animation: 'phi-pulse 3s infinite',
                          background: 'linear-gradient(45deg, #000, #222)',
                          border: `1px solid ${COLORS.darkGold}`,
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                      >
                        <span style={{ 
                          background: 'linear-gradient(to right, #FFD700, #B8860B, #FFD700)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundSize: '200% auto',
                          animation: 'shine 3s linear infinite'
                        }}>
                          Load Example
                        </span>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <div 
          className="output-container"
          style={{
            height: '100%',
            borderLeft: `1px solid ${COLORS.accent1}`,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div 
            style={{
              padding: `${SPACING.xs} ${SPACING.md}`,
              backgroundColor: COLORS.accent1,
              fontWeight: 'bold',
              borderBottom: `1px solid ${COLORS.accent1}`,
              display: 'flex',
              alignItems: 'center',
              gap: SPACING.sm
            }}
          >
            <span style={{ 
              background: 'linear-gradient(to right, #FFD700, #B8860B, #FFD700)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundSize: '200% auto',
              animation: 'shine 3s linear infinite'
            }}>
              Output
            </span>
            <span 
              className="ml-2 px-2 py-0.5 text-xs rounded-full"
              style={{
                backgroundColor: '#1E1E1E',
                border: `1px solid ${COLORS.darkGold}`,
                color: COLORS.gold,
                animation: 'phi-pulse 3s infinite'
              }}
            >
              {isRunning ? 'Running...' : 'Ready'}
            </span>
          </div>
          <div 
            ref={outputRef}
            className="terminal"
            style={{
              flex: 1,
              padding: SPACING.md,
              overflowY: 'auto',
              backgroundColor: '#0D0D0D',
              color: COLORS.gold,
              fontFamily: '"Fira Code", monospace',
              fontSize: FONT_SIZE.sm,
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
              boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.5)',
              border: `1px solid ${COLORS.accent1}`,
              borderRadius: '4px',
              margin: '4px',
            }}
          >
            {output || 
              <div className="flex flex-col items-center justify-center h-full text-center opacity-60">
                <span className="phi-icon" style={{ fontSize: FONT_SIZE.xl, color: COLORS.gold, marginBottom: SPACING.md }}>φ</span>
                <div>Run your Phixeo code to see output here...</div>
                <div className="text-xs mt-2">Powered by the Golden Ratio</div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhixeoEditor;