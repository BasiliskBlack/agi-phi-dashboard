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
          <span className="phi-icon" style={{ fontSize: FONT_SIZE.lg }}>φ</span>
          Phixeo Editor
        </h3>
        <div style={{ display: 'flex', gap: SPACING.sm }}>
          <Button 
            className="phixeo-button phixeo-button-primary"
            onClick={handleRun}
            disabled={isRunning}
          >
            {isRunning ? 'Running...' : 'Run Code'}
          </Button>
          <Button 
            className="phixeo-button phixeo-button-secondary"
            onClick={handleClear}
          >
            Clear Output
          </Button>
        </div>
      </div>
      
      <div 
        style={{
          display: 'flex',
          flexDirection: 'row',
          flex: 1,
          overflow: 'hidden',
        }}
      >
        <Tabs defaultValue="editor" className="w-full h-full flex flex-col">
          <div className="flex justify-between items-center px-2 border-b border-amber-900/20">
            <TabsList className="h-10">
              <TabsTrigger value="editor">Code</TabsTrigger>
              <TabsTrigger value="examples">Examples</TabsTrigger>
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
                border: 'none',
                outline: 'none',
                resize: 'none',
                fontFamily: '"Fira Code", monospace',
                fontSize: FONT_SIZE.md,
                lineHeight: 1.5,
                backgroundColor: COLORS.black,
                color: COLORS.white,
                caretColor: COLORS.gold,
              }}
              value={code}
              onChange={handleCodeChange}
              spellCheck={false}
            />
          </TabsContent>
          
          <TabsContent value="examples" className="flex-1 p-0 m-0 h-full">
            <div className="p-4 h-full bg-gray-900 overflow-auto">
              <h3 className="text-lg font-bold text-amber-500 mb-4">Phixeo Example Programs</h3>
              <div className="grid gap-4">
                {EXAMPLE_PROGRAMS.map((example) => (
                  <div 
                    key={example.path}
                    className="phixeo-card bg-gray-800 p-4 rounded-md border border-amber-700/30 hover:border-amber-500/50 transition-all"
                  >
                    <h4 className="text-amber-400 font-medium mb-2">{example.name}</h4>
                    <p className="text-gray-300 text-sm mb-3">
                      {example.name === "System Core" && "Core system module with fractal optimization algorithms"}
                      {example.name === "UI Components" && "UI component system with golden ratio-based layouts"}
                      {example.name === "Neural Optimization" && "Advanced neural network optimization engine"}
                    </p>
                    <Button 
                      className="phixeo-button phixeo-button-primary w-full"
                      onClick={() => loadExample(example.path)}
                      disabled={isRunning}
                    >
                      Load Example
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div 
          className="output-container"
          style={{
            width: '40%',
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
              color: COLORS.gold,
              fontWeight: 'bold',
              borderBottom: `1px solid ${COLORS.accent1}`,
            }}
          >
            Output
          </div>
          <div 
            ref={outputRef}
            className="terminal"
            style={{
              flex: 1,
              padding: SPACING.md,
              overflowY: 'auto',
              backgroundColor: '#000',
              color: COLORS.gold,
              fontFamily: '"Fira Code", monospace',
              fontSize: FONT_SIZE.sm,
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
            }}
          >
            {output || "Run your Phixeo code to see output here..."}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhixeoEditor;