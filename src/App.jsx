import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeSwitch from './components/ThemeSwitcher';
import Board from './components/Board';
import './App.css';

const App = () => {
  const [gameStarted, setGameStarted] = useState(false);

  return (
    <div className="app-container">
      <ThemeSwitch />

      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Chess Game
      </motion.h1>

      <AnimatePresence>
        {!gameStarted && (
          <motion.button
            className="play-button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.4 }}
            onClick={() => setGameStarted(true)}
          >
            Play
          </motion.button>
        )}
      </AnimatePresence>

      {gameStarted && <Board />}
    </div>
  );
};

export default App;
