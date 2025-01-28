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

const ChartComponent = ({ crypto, chartData, rsiValue, macdValue, bollingerBands }) => {
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
              return p1.raw > p0.raw ? 'green' : 'red'; // Verde si sube, rojo si baja
            }
          },
          tension: 0.1
        },
        // Añadir RSI, MACD y Bandas de Bollinger como datasets
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
          data: Array(chartData.length).fill(bollingerBands?.upperBand ? bollingerBands.upperBand : 0),
          borderColor: 'rgb(153, 102, 255)',
          fill: false,
          borderWidth: 2,
          tension: 0.1,
          yAxisID: 'y2'
        },
        {
          label: 'Bollinger Lower Band',
          data: Array(chartData.length).fill(bollingerBands?.lowerBand ? bollingerBands.lowerBand : 0),
          borderColor: 'rgb(255, 159, 64)',
          fill: false,
          borderWidth: 2,
          tension: 0.1,
          yAxisID: 'y2'
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
        y1: { // Escala para RSI y MACD
          position: 'right',
          min: 0,
          max: 100,
          grid: { drawOnChartArea: false },
        },
        y2: { // Escala para Bandas de Bollinger
          position: 'right',
          grid: { drawOnChartArea: false },
        }
      }
    }}
    />
  );
};

export default ChartComponent;