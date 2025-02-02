import { useState } from 'react';

const ModeToggle = ({ mode, setMode }) => {
  return (
    <button
      onClick={() => setMode(prev => prev === 'crypto' ? 'stocks' : 'crypto')}
      className="fixed top-20 right-4 p-3 rounded-xl bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors z-[999] shadow-lg"
      aria-label="Cambiar modo"
    >
      <span className="text-white font-medium">
        {mode === 'crypto' ? '🔀 Stocks' : '🔀 Crypto'}
      </span>
    </button>
  );
};

export default ModeToggle;