importScripts('https://stockfishchess.org/files/stockfish.js');

const stockfish = new Worker('https://stockfishchess.org/files/stockfish.js');

stockfish.onmessage = function (event) {
  const message = event.data;
  if (typeof message === 'string' && message.startsWith('bestmove')) {
    self.postMessage(message); // Send best move to the main thread
  }
};

self.onmessage = function (event) {
  const { command } = event.data;
  stockfish.postMessage(command);
};
