'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
import styles from './page.module.css';

// Importa los íconos de react-icons
import { FaGithub } from 'react-icons/fa';  // GitHub icon
import { FaChartBar } from 'react-icons/fa'; // CoinMarketCap no tiene ícono oficial, usamos un ícono de criptomoneda
import { FaShoppingBag } from 'react-icons/fa'; // Añade este import

// Importa las funciones desde indicator.js
import { calculateRSI, calculateMACD, calculateBollingerBands, evaluatePrediction } from './indicators';

Chart.register(...registerables);

function Home() {
  const [crypto, setCrypto] = useState('BTC');
  const [price, setPrice] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [error, setError] = useState(null);
  const [prediction, setPrediction] = useState('');
  const [predictionStyle, setPredictionStyle] = useState({});
  const [rsiValue, setRsiValue] = useState(null);
  const [macdValue, setMacdValue] = useState(null);
  const [bollingerBands, setBollingerBands] = useState(null);
  const [timePeriod, setTimePeriod] = useState(30); // Default to 30 days
  const chartContainerRef = useRef(null);

  // Función para calcular el cambio porcentual
  const calculatePriceChange = (prices, period) => {
    if (prices.length < period + 1) return 0; // No hay suficiente datos para el periodo seleccionado
    
    const startIndex = prices.length - period - 1;
    const endIndex = prices.length - 1;
    
    if (startIndex < 0) return 0; // Por si acaso el startIndex es negativo
  
    const startPrice = prices[startIndex];
    const endPrice = prices[endIndex];
    
    if (startPrice === 0) return 0; // Evita dividir por cero
  
    return ((endPrice - startPrice) / startPrice) * 100;
  };
  
  // Suponiendo que prices es un array ordenado de precios históricos.
  const prices = [/* precios históricos */];
  const period = 13;
  const priceChange = calculatePriceChange(prices, period);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const fetchData = async () => {
        setError(null);
        try {
          const priceResponse = await axios.get(
            `https://min-api.cryptocompare.com/data/price?fsym=${crypto}&tsyms=USD`
          );
          if (priceResponse.data && priceResponse.data.USD) {
            setPrice(priceResponse.data.USD);
          } else {
            throw new Error(`Price data not available for ${crypto}.`);
          }
  
          const historyResponse = await axios.get(
            `https://min-api.cryptocompare.com/data/v2/histoday?fsym=${crypto}&tsym=USD&limit=200`
          
          );
          if (historyResponse.data &&
            historyResponse.data.Data &&
            Array.isArray(historyResponse.data.Data.Data) &&
            historyResponse.data.Data.Data.length > 0) {
            const prices = historyResponse.data.Data.Data.map(data => data.close);
            setChartData(prices);

            if (prices.length >= 14) {
              const rsi = calculateRSI(prices);
              const { macd, signalLine } = calculateMACD(prices);
              const { upperBand, lowerBand } = calculateBollingerBands(prices);

              setRsiValue(rsi[rsi.length - 1]);
              setMacdValue(macd[macd.length - 1]);
              setBollingerBands({ upperBand, lowerBand });

              // Evaluación de la predicción basada en el último dato disponible
              makePrediction(prices[prices.length - 1], rsi, macd, signalLine, upperBand, lowerBand);
              makeTrendPrediction(prices, timePeriod);
            }
          } else {
            throw new Error(`Price history not available for ${crypto}.`);
          }
        } catch (error) {
          setError(error.message);
        }
      };

      fetchData();
    }
  }, [crypto, timePeriod]);

  // Función para hacer la predicción de tendencia basada en el periodo seleccionado
  const makeTrendPrediction = (prices, period) => {
    if (period > 90) {
      setPrediction('Selected period is too long for accurate prediction with technical analysis. Please choose a period up to 90 days.');
      setPredictionStyle({ color: 'orange', icon: '⚠️' });
      return;
    }
    if (prices.length < period + 14) {
      setPrediction('Not enough data for the selected period');
      setPredictionStyle({});
      return;
    }
  
    const startIndex = prices.length - period - 1;
    const endIndex = prices.length - 1;
    const periodPrices = prices.slice(startIndex);
  
    const rsi = calculateRSI(periodPrices);
    const { macd, signalLine } = calculateMACD(periodPrices);
    const { upperBand, lowerBand } = calculateBollingerBands(periodPrices);
  
    const currentPrice = periodPrices[periodPrices.length - 1];
    const priceChange = currentPrice - periodPrices[0];
  
    let trendPrediction = 'No clear trend - Hold';
    let predictionStyle = {};
  
    // RSI Analysis
    if (rsi[rsi.length - 1] < 30) {
      if (macd[macd.length - 1] > signalLine[signalLine.length - 1] && currentPrice < lowerBand[lowerBand.length - 1]) {
        trendPrediction = `Strong potential for price increase in ${period} days - Consider buying soon.`;
        predictionStyle = { color: 'green', icon: '↑' };
      } else {
        trendPrediction = `RSI indicates potential rebound - Watch for confirmation signals.`;
        predictionStyle = { color: 'grey', icon: '↗' };
      }
    } else if (rsi[rsi.length - 1] > 70) {
      if (macd[macd.length - 1] < signalLine[signalLine.length - 1] && currentPrice > upperBand[upperBand.length - 1]) {
        trendPrediction = `Strong potential for price decrease in ${period} days - Consider selling or shorting.`;
        predictionStyle = { color: 'red', icon: '↓' };
      } else {
        trendPrediction = `RSI suggests possible correction - Monitor for sell signals.`;
        predictionStyle = { color: 'orange', icon: '↘' };
      }
    } else {
      // MACD Cross
      if (macd[macd.length - 1] > signalLine[signalLine.length - 1]) {
        trendPrediction = `Potential bullish crossover detected - Possible price increase.`;
        predictionStyle = { color: 'green', icon: '⬆' };
      } else if (macd[macd.length - 1] < signalLine[signalLine.length - 1]) {
        trendPrediction = `Bearish crossover detected - Possible price decrease.`;
        predictionStyle = { color: 'red', icon: '⬇' };
      }
    }
  
    // Bollinger Bands Analysis
    if (currentPrice > upperBand[upperBand.length - 1] && rsi[rsi.length - 1] > 70) {
      trendPrediction = `Overbought conditions, expect price to pull back - Consider profit-taking.`;
      predictionStyle = { color: 'red', icon: '⇊' };
    } else if (currentPrice < lowerBand[lowerBand.length - 1] && rsi[rsi.length - 1] < 30) {
      trendPrediction = `Oversold conditions, expect price to bounce back - Consider buying.`;
      predictionStyle = { color: 'green', icon: '⇈' };
    }
  
    // Price Change Analysis
    if (priceChange > 0) {
      trendPrediction += ` Price has increased in the last ${period} days.`;
    } else if (priceChange < 0) {
      trendPrediction += ` Price has decreased in the last ${period} days.`;
    }
  
    setPrediction(trendPrediction);
    setPredictionStyle(predictionStyle);
  };

  // Estructura de la predicción que usará los últimos datos
  const makePrediction = (price, rsi, macd, signalLine, upperBand, lowerBand) => {
    const prediction = evaluatePrediction(rsi, macd, signalLine, upperBand, lowerBand, price);
    setPrediction(prediction);
    setPredictionStyle(prediction.includes('Buy') || prediction.includes('Reversal') ? 
      { color: 'green', icon: '↑' } : 
      prediction.includes('Sell') || prediction.includes('Correction') ? 
      { color: 'red', icon: '↓' } : {});
  };

    const [chartHeight, setChartHeight] = useState(0);

    useEffect(() => {
      if (typeof window !== 'undefined') {
        const getChartHeight = () => {
          const containerWidth = chartContainerRef.current ? chartContainerRef.current.offsetWidth : window.innerWidth;
          const aspectRatio = 9 / 16;
          return containerWidth * aspectRatio;
        };
        setChartHeight(getChartHeight());
        window.addEventListener('resize', setChartHeight);
        return () => window.removeEventListener('resize', setChartHeight);
      }
    }, []);

    return (
      <div className="container mx-auto p-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        <input
        type="text"
        value={crypto}
        onChange={e => setCrypto(e.target.value.toUpperCase())}
        className="relative z-10 p-3 border rounded-md w-full md:w-1/12 bg-white"
        placeholder="Symbol"
      />
<div className="price text-lg font-bold mb-2 md:mb-0">
  {price && chartData.length > 1 && (
    <p>
      Price: ${price.toFixed(8)}&nbsp;
      <span className={chartData[chartData.length - 1] > chartData[chartData.length - 2] ? 'text-green-500' : 'text-red-500'}>
        ({chartData[chartData.length - 1] > chartData[chartData.length - 2] ? (
          `↑ ${((chartData[chartData.length - 1] - chartData[chartData.length - 2]) / chartData[chartData.length - 2] * 100).toFixed(2)}%`
        ) : (
          `↓ ${((chartData[chartData.length - 2] - chartData[chartData.length - 1]) / chartData[chartData.length - 2] * 100).toFixed(2)}%`
        )})
      </span>
    </p>
  )}
  {prediction && (
    <p style={{ color: predictionStyle.color }}>
      {prediction} <span>{predictionStyle.icon}</span>
    </p>
  )}
</div>
        </div>
        <div className="time-period mb-4">
        <label htmlFor="timePeriod" className="mr-2 text-lg font-semibold">Time Period (Rec. 200):</label>
    <input
      type="number"
      id="timePeriod"
      value={timePeriod || 0}  // Si timePeriod es 0 o NaN, muestra 0
      onChange={e => {
        const value = e.target.value;
        setTimePeriod(value === "" ? 0 : Math.max(0, Math.min(200, Number(value))));  // Limitar a 200
      }}
      className="relative z-10 p-3 border rounded-md w-full md:w-1/12 bg-white"
      min="0"
    />
        </div>
    
        {/* Mostrar RSI, MACD, y Bandas de Bollinger */}
        <div className="indicators mb-4">
          <p>RSI Value: {rsiValue ? rsiValue.toFixed(2) : 'Loading...'}</p>
          <p>MACD Value: {macdValue ? macdValue.toFixed(2) : 'Loading...'}</p>
          <p>Upper Bollinger Band: {bollingerBands?.upperBand ? bollingerBands.upperBand[bollingerBands.upperBand.length - 1].toFixed(2) : 'Loading...'}</p>
          <p>Lower Bollinger Band: {bollingerBands?.lowerBand ? bollingerBands.lowerBand[bollingerBands.lowerBand.length - 1].toFixed(2) : 'Loading...'}</p>
        </div>
    
        <div ref={chartContainerRef} className="chart w-full" style={{ height: chartHeight }}>
          {error && <p className="text-red-500">{error}</p>}
          {chartData.length > 0 && (
            <Line
  data={{
    labels: chartData.map((_, index) => index), // Etiquetas de los días
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
        data: Array(chartData.length).fill(rsiValue), // Usar RSI para todos los puntos
        borderColor: 'rgb(255, 99, 132)', // Color de la línea RSI
        fill: false,
        borderWidth: 2,
        tension: 0.1,
        yAxisID: 'y1'
      },
      {
        label: 'MACD',
        data: Array(chartData.length).fill(macdValue), // Usar MACD para todos los puntos
        borderColor: 'rgb(54, 162, 235)', // Color de la línea MACD
        fill: false,
        borderWidth: 2,
        tension: 0.1,
        yAxisID: 'y1'
      },
      {
        label: 'Bollinger Upper Band',
        data: Array(chartData.length).fill(bollingerBands?.upperBand ? bollingerBands.upperBand : 0), // Llenar con la Banda Superior
        borderColor: 'rgb(153, 102, 255)', // Color de la línea Banda Superior
        fill: false,
        borderWidth: 2,
        tension: 0.1,
        yAxisID: 'y2'
      },
      {
        label: 'Bollinger Lower Band',
        data: Array(chartData.length).fill(bollingerBands?.lowerBand ? bollingerBands.lowerBand : 0), // Llenar con la Banda Inferior
        borderColor: 'rgb(255, 159, 64)', // Color de la línea Banda Inferior
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
          )}
        </div>
    
        {/* Agregar los íconos */}
        <div className="icons flex justify-center space-x-8">
          <a href="https://github.com/njoaco/viewmarket-crypto" target="_blank" rel="noopener noreferrer">
            <FaGithub size={30} color="black" />
          </a>
          <a href="https://www.coinmarketcap.com" target="_blank" rel="noopener noreferrer">
            <FaChartBar size={30} color="black" />
          </a>
          
        {/* version */}
        <div className={styles.version}>
          v1.0.2
        </div>
        </div>
        
      </div>
    );
  }

  export default Home;
