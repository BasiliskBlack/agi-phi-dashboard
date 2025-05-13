import React, { useContext } from "react";
import { ThemeContext } from "../lib/themeEngine.tsx";
import { Sidebar } from "./ui/sidebar";
import SystemMonitor from "./windows/SystemMonitorWindow";
import QuantumVisualizer from "./windows/ParserVisualizationWindow";
import AIChat from "./windows/AIAssistantWindow";
import Terminal from "./windows/TerminalWindow";
import "./SacredGeometryDashboard.css";

const SacredGeometryDashboard = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  return (
    <div className={`sg-dashboard sg-theme-${theme}`}>
      {/* Animated, fractal/geometry background */}
      <div className="sg-geometry-overlay">
        <svg viewBox="0 0 100 100" className="sg-spiral"><path d="M50,50 Q60,40 70,50 Q80,60 70,70 Q60,80 50,70 Q40,60 50,50" stroke="#bfa14a" strokeWidth="2" fill="none"/></svg>
        <div className="sg-animated-bg"></div>
      </div>
      {/* Top Dock/Bar */}
      <div className="sg-topbar glassmorph">
        <button className="sg-theme-toggle neon-glow" onClick={toggleTheme}>Theme: {theme}</button>
        <span className="sg-title accent-glow">Φ AGI OS Dashboard</span>
      </div>
      <div className="sg-main">
        <Sidebar />
        <div className="sg-panels">
          <div className="sg-panel glassmorph panel-glow"><SystemMonitor /></div>
          <div className="sg-panel glassmorph panel-glow"><QuantumVisualizer /></div>
          <div className="sg-panel glassmorph panel-glow"><AIChat /></div>
          <div className="sg-panel glassmorph panel-glow"><Terminal /></div>
        </div>
      </div>
    </div>
  );
};
export default SacredGeometryDashboard;
