import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const calculateBollingerBands = (data, period = 20) => {
  const upperBand = [];
  const lowerBand = [];

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      upperBand.push(null);
      lowerBand.push(null);
    } else {
      const slice = data.slice(i - period + 1, i + 1);
      const sma = slice.reduce((sum, value) => sum + value, 0) / period;
      const stdDev = Math.sqrt(
        slice.reduce((sum, value) => sum + Math.pow(value - sma, 2), 0) / period
      );

      upperBand.push(sma + 2 * stdDev);
      lowerBand.push(sma - 2 * stdDev);
    }
  }

  return { upperBand, lowerBand };
};

const ChartComponent = ({ crypto, chartData, rsiValue, macdValue }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const bollingerBands = calculateBollingerBands(chartData);

  return (
    <Line
      data={{
        labels: chartData.map((_, index) => index),
        datasets: [
          {
            label: `${crypto} Price`,
            data: chartData,
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            segment: {
              borderColor: (ctx) => {
                const { p0, p1 } = ctx;
                return p1.raw > p0.raw ? 'green' : 'red';
              }
            },
            tension: 0.1,
            pointRadius: isMobile ? 0 : 3, // Oculta puntos en móvil
            pointHoverRadius: isMobile ? 6 : 6
          },
          {
            label: 'RSI',
            data: Array(chartData.length).fill(rsiValue),
            borderColor: 'rgb(255, 99, 132)',
            fill: false,
            borderWidth: 4,
            tension: 0.1,
            yAxisID: 'y1',
            pointRadius: isMobile ? 0 : 0,
            pointHoverRadius: isMobile ? 6 : 6
          },
          {
            label: 'Bollinger Upper Band',
            data: bollingerBands.upperBand,
            borderColor: 'rgb(153, 102, 255)',
            fill: '+1',
            borderWidth: 2,
            tension: 0.1,
            pointRadius: isMobile ? 0 : 1,
            pointHoverRadius: isMobile ? 6 : 6
          },
          {
            label: 'Bollinger Lower Band',
            data: bollingerBands.lowerBand,
            borderColor: 'rgb(255, 159, 64)',
            borderWidth: 2,
            tension: 0.1,
            pointRadius: isMobile ? 0 : 1,
            pointHoverRadius: isMobile ? 6 : 6
          }
        ]
      }}
      options={{
        responsive: true,
        plugins: {
          legend: { display: true },
          tooltip: {
            callbacks: {
              label: function (tooltipItem) {
                const price = Number(tooltipItem.raw);
                return `Price: $${!isNaN(price) ? price.toFixed(2) : 'N/A'}`;
              }
            }
          }
        },
        scales: {
          x: { display: false },
          y: {
            position: 'left',
            beginAtZero: false,
          },
          y1: {
            position: 'right',
            min: 0,
            max: 100,
            grid: { drawOnChartArea: false },
          }
        },
        elements: {
          line: {
            spanGaps: true,
          }
        }
      }}
    />
  );
};

export default ChartComponent;
