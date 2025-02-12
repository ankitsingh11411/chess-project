import React from 'react';
import styles from './CapturedPieces.module.css';

const CapturedPieces = ({ takenPieces }) => {
  return (
    <div className={styles.capturedContainer}>
      <div className={styles.capturedSection}>
        <h5>Captured Whites</h5>
        <div className={styles.pieces}>
          {takenPieces.white.map((piece, index) => (
            <span key={index} className={styles.whitePiece}>
              {piece}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.capturedSection}>
        <h5>Captured Blacks</h5>
        <div className={styles.pieces}>
          {takenPieces.black.map((piece, index) => (
            <span key={index} className={styles.blackPiece}>
              {piece}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CapturedPieces;
