import { useState, useEffect } from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';

const ThemeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme ? 'dark' : 'light');
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 200);
  };

  return (
    <button
      onClick={toggleTheme}
      className={`fixed top-4 right-4 p-3 rounded-xl 
        bg-blue-500 dark:bg-blue-600 
        hover:bg-blue-600 dark:hover:bg-blue-700
        transition-all duration-300 
        transform 
        ${isClicked ? 'scale-90' : 'scale-100'}
        hover:scale-110
        shadow-lg
        hover:shadow-xl
        focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800
        z-[1000]
        group`}
      aria-label="Cambiar tema"
    >
      <div className="relative w-5 h-5">
        <FaSun 
          className={`text-white transition-all duration-500 
            ${isDarkMode ? 'opacity-100 rotate-0' : 'opacity-0 rotate-180'} 
            absolute top-0 left-0`} 
          size={20} 
        />
        <FaMoon 
          className={`text-white transition-all duration-500 
            ${!isDarkMode ? 'opacity-100 rotate-0' : 'opacity-0 rotate-180'} 
            absolute top-0 left-0`} 
          size={20} 
        />
      </div>
      
      <div className={`absolute inset-0 flex justify-center items-center
        ${isClicked ? 'opacity-100' : 'opacity-0'}
        transition-opacity duration-300`}>
        <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></div>
      </div>
    </button>
  );
};

export default ThemeToggle;