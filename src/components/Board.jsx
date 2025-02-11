import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { motion } from 'framer-motion';
import styles from './Board.module.css';
import ResultModal from './ResultModal';

const LOCAL_STORAGE_KEY = 'chessGameState';

const Board = () => {
  const [game, setGame] = useState(new Chess());
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [legalMoves, setLegalMoves] = useState({});
  const [highlightedSquares, setHighlightedSquares] = useState({});
  const [winner, setWinner] = useState(null);
  const [moveHistory, setMoveHistory] = useState([]);

  useEffect(() => {
    const savedFen = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedFen) {
      const savedGame = new Chess();
      savedGame.load(savedFen);
      setGame(savedGame);
    }
  }, []);

  const saveGameState = (gameInstance) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, gameInstance.fen());
  };

  const onSquareClick = (square) => {
    if (selectedSquare && legalMoves[square]) {
      makeMove(square);
      return;
    }

    const moves = game.moves({ square, verbose: true });
    if (moves.length === 0) return;

    const piece = game.get(square);
    if (!piece) return;

    if (game.turn() !== piece.color) {
      if (navigator.vibrate) navigator.vibrate(200);
      return;
    }

    const newLegalMoves = {};
    moves.forEach((move) => {
      newLegalMoves[move.to] = { backgroundColor: 'rgba(0, 255, 0, 0.3)' };
    });

    setSelectedSquare(square);
    setLegalMoves(newLegalMoves);
  };

  const makeMove = (targetSquare) => {
    if (!selectedSquare || !legalMoves[targetSquare]) return;

    const gameCopy = new Chess();
    gameCopy.loadPgn(game.pgn());

    const move = gameCopy.move({
      from: selectedSquare,
      to: targetSquare,
      promotion: 'q',
    });

    if (move === null) return;

    setMoveHistory([...moveHistory, move]);
    checkForCheck(gameCopy);
    setGame(gameCopy);
    saveGameState(gameCopy);
    setSelectedSquare(null);
    setLegalMoves({});

    if (gameCopy.isCheckmate()) {
      setWinner(gameCopy.turn() === 'w' ? 'Black Wins!' : 'White Wins!');
    } else if (gameCopy.isDraw()) {
      setWinner("It's a Draw!");
    }
  };

  const checkForCheck = (gameInstance) => {
    const newHighlight = {};
    if (gameInstance.inCheck()) {
      gameInstance.board().forEach((row) => {
        row.forEach((square) => {
          if (
            square &&
            square.type === 'k' &&
            square.color === gameInstance.turn()
          ) {
            newHighlight[square.square] = {
              backgroundColor: 'rgba(255, 0, 0, 0.5)',
            };
          }
        });
      });
    }
    setHighlightedSquares(newHighlight);
  };

  const resetGame = () => {
    const newGame = new Chess();
    setGame(newGame);
    setSelectedSquare(null);
    setLegalMoves({});
    setHighlightedSquares({});
    setWinner(null);
    setMoveHistory([]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  const undoMove = () => {
    if (moveHistory.length === 0) return;

    const gameCopy = new Chess();
    gameCopy.loadPgn(game.pgn());
    gameCopy.undo();

    setMoveHistory(moveHistory.slice(0, -1));
    setGame(gameCopy);
    saveGameState(gameCopy);
  };

  return (
    <motion.div
      className={styles.boardContainer}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Chessboard
        position={game.fen()}
        onPieceDrop={(source, target) => makeMove(target)}
        onSquareClick={onSquareClick}
        boardWidth={400}
        customSquareStyles={{ ...highlightedSquares, ...legalMoves }}
      />
      <div className={styles.buttonContainer}>
        <button className={styles.undoButton} onClick={undoMove}>
          Undo Move
        </button>
        <button className={styles.resetButton} onClick={resetGame}>
          Reset Game
        </button>
      </div>

      {winner && <ResultModal result={winner} onReset={resetGame} />}
    </motion.div>
  );
};

export default Board;
