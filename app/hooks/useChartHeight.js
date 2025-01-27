import { useState, useEffect } from 'react';

const useChartHeight = (containerRef) => {
  const [chartHeight, setChartHeight] = useState(0);

  useEffect(() => {
    const calculateHeight = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const aspectRatio = 9 / 16;
        setChartHeight(containerWidth * aspectRatio);
      }
    };

    calculateHeight();
    window.addEventListener('resize', calculateHeight);
    
    return () => window.removeEventListener('resize', calculateHeight);
  }, [containerRef]);

  return chartHeight;
};

export default useChartHeight;