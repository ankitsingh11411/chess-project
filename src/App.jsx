import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeSwitch from './components/ThemeSwitcher';
import Board from './components/Board';
import './App.css';

const App = () => {
  const [gameStarted, setGameStarted] = useState(false);

  return (
    <div className="app-container">
      <div className="chessboard-background"></div>
      <ThemeSwitch />

      <motion.div
        className="title-container"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="app-title">Chess Game by ASR</h1>
      </motion.div>

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
