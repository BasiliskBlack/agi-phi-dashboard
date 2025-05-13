import React, { createContext, useState, ReactNode } from "react";

export type Theme = "sacred" | "quantum" | "light" | "dark";

export const ThemeContext = createContext({
  theme: "sacred" as Theme,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>("sacred");
  const toggleTheme = () => {
    setTheme((prev) =>
      prev === "sacred"
        ? "quantum"
        : prev === "quantum"
        ? "light"
        : prev === "light"
        ? "dark"
        : "sacred"
    );
  };
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
