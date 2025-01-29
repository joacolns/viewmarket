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
      // Rellena con null para los primeros puntos (no hay suficientes datos para calcular)
      upperBand.push(null);
      lowerBand.push(null);
    } else {
      // Extrae los últimos "period" valores para calcular la SMA y la desviación estándar
      const slice = data.slice(i - period + 1, i + 1);
      const sma = slice.reduce((sum, value) => sum + value, 0) / period;
      const stdDev = Math.sqrt(
        slice.reduce((sum, value) => sum + Math.pow(value - sma, 2), 0) / period
      );

      // Calcula las bandas
      upperBand.push(sma + 2 * stdDev);
      lowerBand.push(sma - 2 * stdDev);
    }
  }

  return { upperBand, lowerBand };
};

const ChartComponent = ({ crypto, chartData, rsiValue, macdValue }) => {
  // Calcula las Bandas de Bollinger
  const bollingerBands = calculateBollingerBands(chartData);

  return (
    <Line
      data={{
        labels: chartData.map((_, index) => index), // Etiquetas del eje X
        datasets: [
          {
            label: `${crypto} Price`,
            data: chartData,
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            segment: {
              borderColor: (ctx) => {
                const { p0, p1 } = ctx;
                return p1.raw > p0.raw ? 'green' : 'red'; // Verde si sube, rojo si baja
              }
            },
            tension: 0.1
          },
          {
            label: 'RSI',
            data: Array(chartData.length).fill(rsiValue),
            borderColor: 'rgb(255, 99, 132)',
            fill: false,
            borderWidth: 2,
            tension: 0.1,
            yAxisID: 'y1'
          },
          {
            label: 'Bollinger Upper Band',
            data: bollingerBands.upperBand,
            borderColor: 'rgb(153, 102, 255)',
            fill: '+1', // Rellena el área entre la banda superior e inferior
            borderWidth: 1,
            tension: 0.1
          },
          {
            label: 'Bollinger Lower Band',
            data: bollingerBands.lowerBand,
            borderColor: 'rgb(255, 159, 64)',
            borderWidth: 1,
            tension: 0.1
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
          x: { display: false }, // Oculta el eje X
          y: {
            position: 'left',
            beginAtZero: false,
          },
          y1: { // Escala para RSI
            position: 'right',
            min: 0,
            max: 100,
            grid: { drawOnChartArea: false },
          }
        },
        elements: {
          line: {
            spanGaps: true, // Dibuja líneas incluso si hay valores nulos
          }
        }
      }}
    />
  );
};

export default ChartComponent;