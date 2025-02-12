import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { motion } from 'framer-motion';
import ResultModal from './ResultModal';
import styles from './AIBoard.module.css';

const AIBoard = () => {
  const [game, setGame] = useState(new Chess());
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    if (game.turn() === 'b' && !game.isGameOver() && !winner) {
      const aiMoveTimeout = setTimeout(() => makeAIMove(), 500);
      return () => clearTimeout(aiMoveTimeout);
    }
  }, [game, winner]);

  // Simple AI: Picks the best move by evaluating material gain
  const makeAIMove = () => {
    const possibleMoves = game.moves();
    if (possibleMoves.length === 0) return;

    let bestMove = null;
    let bestValue = -Infinity;

    possibleMoves.forEach((move) => {
      const tempGame = new Chess(game.fen());
      tempGame.move(move);
      const boardValue = evaluateBoard(tempGame);

      if (boardValue > bestValue) {
        bestValue = boardValue;
        bestMove = move;
      }
    });

    if (bestMove) {
      setGame((prevGame) => {
        const newGame = new Chess(prevGame.fen());
        newGame.move(bestMove);

        if (newGame.isCheckmate()) {
          setWinner('Black Wins!');
        } else if (newGame.isDraw()) {
          setWinner("It's a Draw!");
        }

        return newGame;
      });
    }
  };

  // Evaluate board based on material count
  const evaluateBoard = (chess) => {
    const pieceValues = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 100 };
    let evaluation = 0;
    chess.board().forEach((row) =>
      row.forEach((square) => {
        if (square) {
          const value = pieceValues[square.type] || 0;
          evaluation += square.color === 'w' ? value : -value;
        }
      })
    );
    return evaluation;
  };

  const makeMove = (move) => {
    setGame((prevGame) => {
      const newGame = new Chess(prevGame.fen());
      const moveResult = newGame.move(move);

      if (!moveResult) return prevGame;

      if (newGame.isCheckmate()) {
        setWinner('White Wins!');
      } else if (newGame.isDraw()) {
        setWinner("It's a Draw!");
      }

      return newGame;
    });
  };

  return (
    <motion.div
      className={styles['ai-board-container']}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className={styles['chessboard-wrapper']}>
        <Chessboard
          position={game.fen()}
          onPieceDrop={(source, target) => {
            makeMove({ from: source, to: target, promotion: 'q' });
          }}
        />
      </div>
      {winner && (
        <div className={styles['result-modal']}>
          <ResultModal result={winner} onReset={() => setGame(new Chess())} />
        </div>
      )}
    </motion.div>
  );
};

export default AIBoard;
