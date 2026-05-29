import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Initialise from localStorage or default to dark mode
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('theme');
    return stored ? stored === 'dark' : true; // default dark
  });

  useEffect(() => {
    const theme = isDark ? 'dark' : 'light';
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', theme);
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
