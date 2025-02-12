import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { motion } from 'framer-motion';
import ResultModal from './ResultModal';
import CapturedPieces from './CapturedPieces';
import styles from './AIBoard.module.css';

const PGN_STORAGE_KEY = 'aiChessGamePGN';
const TAKEN_PIECES_KEY = 'aiTakenPieces';

const pieceIcons = {
  p: '♙',
  n: '♘',
  b: '♗',
  r: '♖',
  q: '♕',
  k: '♔',
  P: '♟',
  N: '♞',
  B: '♝',
  R: '♜',
  Q: '♛',
  K: '♚',
};

const AIBoard = () => {
  const [game, setGame] = useState(() => {
    const savedPgn = localStorage.getItem(PGN_STORAGE_KEY);
    const gameInstance = new Chess();
    if (savedPgn) gameInstance.loadPgn(savedPgn);
    return gameInstance;
  });

  const [selectedSquare, setSelectedSquare] = useState(null);
  const [legalMoves, setLegalMoves] = useState({});
  const [highlightedSquares, setHighlightedSquares] = useState({});
  const [winner, setWinner] = useState(null);
  const [moveHistory, setMoveHistory] = useState([]);
  const [takenPieces, setTakenPieces] = useState(() => {
    const savedTakenPieces = localStorage.getItem(TAKEN_PIECES_KEY);
    return savedTakenPieces
      ? JSON.parse(savedTakenPieces)
      : { white: [], black: [] };
  });

  const [theme, setTheme] = useState(
    document.documentElement.getAttribute('data-theme') || 'light'
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(document.documentElement.getAttribute('data-theme'));
    });
    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (game.turn() === 'b' && !game.isGameOver() && !winner) {
      const aiMoveTimeout = setTimeout(() => makeAIMove(), 500);
      return () => clearTimeout(aiMoveTimeout);
    }
  }, [game, winner]);

  const saveGameState = (gameInstance, updatedTakenPieces) => {
    localStorage.setItem(PGN_STORAGE_KEY, gameInstance.pgn());
    localStorage.setItem(TAKEN_PIECES_KEY, JSON.stringify(updatedTakenPieces));
  };

  const getBoardColors = () => {
    return theme === 'dark'
      ? { light: '#9E9E9E', dark: '#424242' }
      : { light: '#EEDFCC', dark: '#8B5A2B' };
  };

  const onSquareClick = (square) => {
    if (selectedSquare && legalMoves[square]) {
      makeMove(square);
      return;
    }

    const moves = game.moves({ square, verbose: true });
    if (moves.length === 0) return;

    const piece = game.get(square);
    if (!piece || game.turn() !== piece.color) return;

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

    if (!move) return;

    const updatedPieces = updateCapturedPieces(move);
    setMoveHistory([...moveHistory, move]);
    checkForCheck(gameCopy);
    setGame(gameCopy);
    saveGameState(gameCopy, updatedPieces);
    setSelectedSquare(null);
    setLegalMoves({});

    if (gameCopy.isCheckmate()) {
      setWinner(gameCopy.turn() === 'w' ? 'Black Wins!' : 'White Wins!');
    } else if (gameCopy.isDraw()) {
      setWinner("It's a Draw!");
    }
  };

  const updateCapturedPieces = (move) => {
    if (!move.captured) return takenPieces;

    const color = move.color === 'w' ? 'black' : 'white';
    const updatedPieces = {
      ...takenPieces,
      [color]: [...takenPieces[color], pieceIcons[move.captured]],
    };

    setTakenPieces(updatedPieces);
    return updatedPieces;
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

  const makeAIMove = () => {
    const possibleMoves = game.moves();
    if (possibleMoves.length === 0) return;

    const randomMove =
      possibleMoves[Math.floor(Math.random() * possibleMoves.length)];

    if (randomMove) {
      setGame((prevGame) => {
        const newGame = new Chess(prevGame.fen());
        newGame.move(randomMove);

        if (newGame.isCheckmate()) {
          setWinner('Black Wins!');
        } else if (newGame.isDraw()) {
          setWinner("It's a Draw!");
        }

        return newGame;
      });
    }
  };

  const resetGame = () => {
    const newGame = new Chess();
    setGame(newGame);
    setSelectedSquare(null);
    setLegalMoves({});
    setHighlightedSquares({});
    setWinner(null);
    setMoveHistory([]);
    setTakenPieces({ white: [], black: [] });
    localStorage.removeItem(PGN_STORAGE_KEY);
    localStorage.removeItem(TAKEN_PIECES_KEY);
  };

  return (
    <motion.div
      className={styles.aiBoardContainer}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Chessboard
        position={game.fen()}
        onSquareClick={onSquareClick}
        boardWidth={400}
        customDarkSquareStyle={{ backgroundColor: getBoardColors().dark }}
        customLightSquareStyle={{ backgroundColor: getBoardColors().light }}
        customSquareStyles={{ ...highlightedSquares, ...legalMoves }}
      />

      <div className={styles.buttonContainer}>
        <button className={styles.resetButton} onClick={resetGame}>
          Reset Game
        </button>
      </div>

      <CapturedPieces takenPieces={takenPieces} />
      {winner && <ResultModal result={winner} onReset={resetGame} />}
    </motion.div>
  );
};

export default AIBoard;
