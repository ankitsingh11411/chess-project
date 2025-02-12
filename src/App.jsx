import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeSwitch from './components/ThemeSwitcher';
import Board from './components/Board';
import AIBoard from './components/AIBoard'; // Import AI Board
import './App.css';

const App = () => {
  const [gameMode, setGameMode] = useState(null);

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
        {!gameMode && (
          <motion.div
            className="button-container"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.4 }}
          >
            <button className="play-button" onClick={() => setGameMode('OTB')}>
              Play Over The Board
            </button>
            <button className="play-button" onClick={() => setGameMode('AI')}>
              Play Against AI
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {gameMode === 'OTB' && <Board />}
      {gameMode === 'AI' && <AIBoard />}

      {gameMode && (
        <motion.button
          className="back-button"
          onClick={() => setGameMode(null)}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          Back to Menu
        </motion.button>
      )}
    </div>
  );
};

export default App;
