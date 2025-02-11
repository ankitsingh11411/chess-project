import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { motion } from 'framer-motion';
import { Card, Divider } from 'antd';
import styles from './Board.module.css';
import ResultModal from './ResultModal';

const LOCAL_STORAGE_KEY = 'chessGameState';
const TAKEN_PIECES_KEY = 'takenPieces';

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

const Board = () => {
  const [game, setGame] = useState(new Chess());
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [legalMoves, setLegalMoves] = useState({});
  const [highlightedSquares, setHighlightedSquares] = useState({});
  const [winner, setWinner] = useState(null);
  const [moveHistory, setMoveHistory] = useState([]);
  const [takenPieces, setTakenPieces] = useState({ white: [], black: [] });

  useEffect(() => {
    const savedFen = localStorage.getItem(LOCAL_STORAGE_KEY);
    const savedTakenPieces = localStorage.getItem(TAKEN_PIECES_KEY);

    if (savedFen) {
      const savedGame = new Chess();
      savedGame.load(savedFen);
      setGame(savedGame);
    }

    if (savedTakenPieces) {
      setTakenPieces(JSON.parse(savedTakenPieces));
    }
  }, []);

  const saveGameState = (gameInstance) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, gameInstance.fen());
    localStorage.setItem(TAKEN_PIECES_KEY, JSON.stringify(takenPieces));
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
    updateCapturedPieces(move);
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

  const updateCapturedPieces = (move) => {
    if (move.captured) {
      const color = move.color === 'w' ? 'black' : 'white';
      const updatedPieces = {
        ...takenPieces,
        [color]: [...takenPieces[color], pieceIcons[move.captured]],
      };

      setTakenPieces(updatedPieces);
      localStorage.setItem(TAKEN_PIECES_KEY, JSON.stringify(updatedPieces));
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
    setTakenPieces({ white: [], black: [] });
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    localStorage.removeItem(TAKEN_PIECES_KEY);
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

      <motion.div className={styles.takenPiecesContainer}>
        <Card className={styles.takenPiecesCard} title="Captured Pieces">
          <motion.div className={styles.takenPiecesWrapper}>
            <motion.div className={styles.takenPiecesWhite}>
              {takenPieces.white.map((piece, index) => (
                <motion.span key={index} className={styles.pieceIcon}>
                  {piece}
                </motion.span>
              ))}
            </motion.div>
            <Divider className={styles.divider} />
            <motion.div className={styles.takenPiecesBlack}>
              {takenPieces.black.map((piece, index) => (
                <motion.span key={index} className={styles.pieceIcon}>
                  {piece}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>
        </Card>
      </motion.div>

      {winner && <ResultModal result={winner} onReset={resetGame} />}
    </motion.div>
  );
};

export default Board;
