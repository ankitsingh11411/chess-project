import React, { useState, useEffect } from 'react';
import { Switch } from 'antd';
import { motion } from 'framer-motion';
import styles from './ThemeSwitcher.module.css';

const ThemeSwitch = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <motion.div
      className={styles.themeToggleContainer}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <span>{theme === 'light' ? '☀️ Light Mode' : '🌙 Dark Mode'}</span>
      <Switch checked={theme === 'dark'} onChange={toggleTheme} />
    </motion.div>
  );
};

export default ThemeSwitch;
