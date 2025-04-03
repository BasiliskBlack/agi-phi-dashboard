/**
 * Phixeo-optimized styling system
 * Uses golden ratio and fractal patterns for perfect proportions and optimal readability
 */

// Golden ratio - key to Phixeo's efficiency
export const PHI = (1 + Math.sqrt(5)) / 2; // ≈ 1.618

// Primary colors in golden ratio relationships
export const COLORS = {
  // Primary colors
  black: "#1A1A1A",
  gold: "#FFD700",
  darkGold: "#B8860B",
  gray: "#808080",
  white: "#FFFFFF",
  
  // Accent colors derived from golden ratio relationships
  accent1: "#3A3A3A", // Black + (gold/φ)
  accent2: "#E5C100", // Gold - (gold/φ)
  accent3: "#9A7209", // DarkGold - (darkGold/φ)
  
  // Status colors
  success: "#4CAF50",
  warning: "#FF9800",
  error: "#F44336",
  info: "#2196F3",
  
  // Transparency variants
  blackAlpha: (alpha: number) => `rgba(26, 26, 26, ${alpha})`,
  goldAlpha: (alpha: number) => `rgba(255, 215, 0, ${alpha})`,
};

// Spacing scale based on golden ratio
export const SPACING = (() => {
  const base = 8;
  const scale: Record<string, string> = {};
  
  // Generate phi-based spacing scale
  for (let i = -2; i <= 8; i++) {
    const value = Math.round(base * Math.pow(PHI, i));
    scale[i] = `${value}px`;
  }
  
  // Named aliases for common spacings
  return {
    ...scale,
    // Common spacing aliases
    xs: scale["-1"],
    sm: scale["0"],
    md: scale["1"],
    lg: scale["2"],
    xl: scale["3"],
    xxl: scale["4"],
  };
})();

// Radius scale based on fibonacci sequence (closely related to golden ratio)
export const RADIUS = {
  none: "0",
  sm: "4px",
  md: "8px",
  lg: "16px",
  xl: "24px",
  pill: "9999px",
  circle: "50%",
  // Special value: golden circle radius that complements golden rectangle
  golden: `${Math.round(PHI * 10)}px`, // ≈ 16px
};

// Font scale based on golden ratio
export const FONT_SIZE = (() => {
  const base = 16;
  const scale: Record<string, string> = {};
  
  // Generate phi-based font scale
  for (let i = -2; i <= 5; i++) {
    const value = Math.round(base * Math.pow(PHI, i * 0.5));
    scale[i] = `${value}px`;
  }
  
  return {
    ...scale,
    // Common size aliases
    xs: scale["-2"],
    sm: scale["-1"],
    md: scale["0"],
    lg: scale["1"],
    xl: scale["2"],
    xxl: scale["3"],
    hero: scale["4"],
    mega: scale["5"],
  };
})();

// Line heights based on golden ratio
export const LINE_HEIGHT = {
  none: "1",
  tight: "1.25",
  normal: "1.5",
  loose: "1.618", // Golden ratio
  relaxed: "2", 
};

// Font weights optimized for readability
export const FONT_WEIGHT = {
  light: "300",
  normal: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  black: "900",
};

// Shadows using golden ratio proportions
export const SHADOWS = {
  sm: `0 ${SPACING["-2"]} ${SPACING["-1"]} ${COLORS.blackAlpha(0.1)}`,
  md: `0 ${SPACING["-1"]} ${SPACING["0"]} ${COLORS.blackAlpha(0.1)}`,
  lg: `0 ${SPACING["0"]} ${SPACING["1"]} ${COLORS.blackAlpha(0.1)}`,
  xl: `0 ${SPACING["1"]} ${SPACING["2"]} ${COLORS.blackAlpha(0.1)}`,
  inner: `inset 0 2px 4px ${COLORS.blackAlpha(0.1)}`,
  gold: `0 0 ${SPACING["1"]} ${COLORS.goldAlpha(0.6)}`,
  glow: `0 0 ${SPACING["2"]} ${COLORS.goldAlpha(0.8)}`,
};

// Transitions optimized with golden ratio timing
export const TRANSITIONS = {
  fast: `${150}ms ease-in-out`,
  normal: `${250}ms ease-in-out`,
  slow: `${400}ms ease-in-out`,
  // Golden ratio based transition
  golden: `${Math.round(250 * PHI / 2)}ms cubic-bezier(0.618, 0, 0.382, 1)`,
};

// Z-index scale
export const Z_INDEX = {
  hide: -1,
  base: 0,
  raised: 1,
  dropdown: 1000,
  sticky: 1100,
  overlay: 1200,
  modal: 1300,
  popover: 1400,
  toast: 1500,
  tooltip: 1600,
  highest: 9999,
};

// Button styles
export const BUTTON_STYLES = {
  primary: {
    bg: COLORS.gold,
    color: COLORS.black,
    hoverBg: COLORS.accent2,
    activeBg: COLORS.darkGold,
    focusBorder: COLORS.darkGold,
  },
  secondary: {
    bg: COLORS.accent1,
    color: COLORS.white,
    hoverBg: COLORS.black,
    activeBg: COLORS.black,
    focusBorder: COLORS.gold,
  },
  ghost: {
    bg: "transparent",
    color: COLORS.white,
    hoverBg: COLORS.blackAlpha(0.2),
    activeBg: COLORS.blackAlpha(0.3),
    focusBorder: COLORS.goldAlpha(0.5),
  },
  danger: {
    bg: COLORS.error,
    color: COLORS.white,
    hoverBg: "#d32f2f",
    activeBg: "#b71c1c",
    focusBorder: COLORS.gold,
  },
};

// Generate golden-ratio grid system
export const GRID = {
  container: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    xxl: "1536px",
  },
  
  // Columns based on golden ratio subdivisions
  columns: {
    oneThird: `${100 / PHI / PHI}%`,   // ~38.2%
    oneSixth: `${100 / PHI / PHI / 2}%`, // ~19.1%
    half: "50%",
    twoThirds: `${100 - (100 / PHI / PHI)}%`,  // ~61.8%
    golden: `${100 / PHI}%`,  // ~61.8%
    goldenComplement: `${100 - (100 / PHI)}%`, // ~38.2%
  },
  
  // Gap sizes
  gap: SPACING,
};

// Animations with golden-ratio timing
export const ANIMATIONS = {
  fadeIn: `@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }`,
  fadeOut: `@keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }`,
  slideIn: `@keyframes slideIn {
    from { transform: translateY(${SPACING["2"]}); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }`,
  pulse: `@keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }`,
  spin: `@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }`,
  goldenSpin: `@keyframes goldenSpin {
    from { transform: rotate(0deg); }
    to { transform: rotate(${360 / PHI}deg); }
  }`,
};

// Media queries
export const MEDIA_QUERIES = {
  sm: `@media (min-width: ${GRID.container.sm})`,
  md: `@media (min-width: ${GRID.container.md})`,
  lg: `@media (min-width: ${GRID.container.lg})`,
  xl: `@media (min-width: ${GRID.container.xl})`,
  xxl: `@media (min-width: ${GRID.container.xxl})`,
  dark: `@media (prefers-color-scheme: dark)`,
  light: `@media (prefers-color-scheme: light)`,
  motion: `@media (prefers-reduced-motion: no-preference)`,
  motionReduce: `@media (prefers-reduced-motion: reduce)`,
};

// Phixeo optimized glassmorphism
export const GLASS = {
  light: `backdrop-filter: blur(8px); background-color: ${COLORS.whiteAlpha(0.1)}; border: 1px solid ${COLORS.whiteAlpha(0.2)};`,
  dark: `backdrop-filter: blur(8px); background-color: ${COLORS.blackAlpha(0.6)}; border: 1px solid ${COLORS.whiteAlpha(0.1)};`,
  gold: `backdrop-filter: blur(8px); background-color: ${COLORS.goldAlpha(0.1)}; border: 1px solid ${COLORS.goldAlpha(0.3)};`,
};

// Helper function to apply golden ratio to any number
export const goldenScale = (base: number, steps: number = 1): number => {
  return base * Math.pow(PHI, steps);
};

export default {
  PHI,
  COLORS,
  SPACING,
  RADIUS,
  FONT_SIZE,
  LINE_HEIGHT,
  FONT_WEIGHT,
  SHADOWS,
  TRANSITIONS,
  Z_INDEX,
  BUTTON_STYLES,
  GRID,
  ANIMATIONS,
  MEDIA_QUERIES,
  GLASS,
  goldenScale,
};