import React, { useState, useEffect } from 'react';
import { Switch } from 'antd';
import { motion } from 'framer-motion';
import './App.css';

const App = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="app-container">
      <motion.div
        className="theme-toggle-container"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <span>{theme === 'light' ? '☀️ Light Mode' : '🌙 Dark Mode'}</span>
        <Switch checked={theme === 'dark'} onChange={toggleTheme} />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Chess Game
      </motion.h1>
    </div>
  );
};

export default App;
