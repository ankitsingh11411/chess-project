import React from 'react';
import styles from './ResultModal.module.css';

const ResultModal = ({ result, onReset }) => {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>{result}</h2>
        <button onClick={onReset}>Play Again</button>
      </div>
    </div>
  );
};

export default ResultModal;
