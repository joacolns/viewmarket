import { useState } from 'react';
import { FaBitcoin, FaChartLine } from 'react-icons/fa';

const ModeToggle = ({ mode, setMode }) => {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setMode(prev => (prev === 'crypto' ? 'stocks' : 'crypto'));
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 200);
  };

  return (
    <button
      onClick={handleClick}
      className={`fixed top-20 right-4 p-3 rounded-xl 
        bg-blue-500 dark:bg-blue-600 
        hover:bg-blue-600 dark:hover:bg-blue-700
        transition-all duration-300 
        transform 
        ${isClicked ? 'scale-90' : 'scale-100'}
        hover:scale-110
        shadow-lg
        hover:shadow-xl
        focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800
        z-[999]
        group`}
      aria-label="Cambiar modo"
    >
      {mode === 'crypto' ? (
        <FaChartLine className="text-white text-xl transition-transform duration-300" />
      ) : (
        <FaBitcoin className="text-white text-xl transition-transform duration-300" />
      )}
      
      <div
        className={`absolute inset-0 flex justify-center items-center
          ${isClicked ? 'opacity-100' : 'opacity-0'}
          transition-opacity duration-300`}
      >
        <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></div>
      </div>
    </button>
  );
};

export default ModeToggle;
