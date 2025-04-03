import React from 'react';
import { useWindow } from '@/contexts/WindowContext';
import Window from './Window';
import AIAssistantWindow from './AIAssistantWindow';
import SystemMonitorWindow from './SystemMonitorWindow';
import CodeEditorWindow from './CodeEditorWindow';
import ParserVisualizationWindow from './ParserVisualizationWindow';
import FileExplorerWindow from './FileExplorerWindow';
import TerminalWindow from './TerminalWindow';

const WindowManager: React.FC = () => {
  const { windows } = useWindow();

  return (
    <>
      {windows.filter(window => window.isOpen).map(window => {
        const windowProps = {
          id: window.id,
          title: window.title,
          color: window.color,
          icon: window.icon,
          position: window.position,
          size: window.size,
          zIndex: window.zIndex,
          isMinimized: window.isMinimized,
          isMaximized: window.isMaximized
        };

        switch (window.type) {
          case 'ai-assistant':
            return <Window key={window.id} {...windowProps}><AIAssistantWindow /></Window>;
          case 'system-monitor':
            return <Window key={window.id} {...windowProps}><SystemMonitorWindow /></Window>;
          case 'code-editor':
            return <Window key={window.id} {...windowProps}><CodeEditorWindow /></Window>;
          case 'parser-visualization':
            return <Window key={window.id} {...windowProps}><ParserVisualizationWindow /></Window>;
          case 'file-explorer':
            return <Window key={window.id} {...windowProps}><FileExplorerWindow /></Window>;
          case 'terminal':
            return <Window key={window.id} {...windowProps}><TerminalWindow /></Window>;
          default:
            return null;
        }
      })}
    </>
  );
};

export default WindowManager;
