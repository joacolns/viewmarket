'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
import styles from './page.module.css';

Chart.register(...registerables);

// == Función para calcular RSI ==
function calculateRSI(prices, period = 14) {
  const gains = [];
  const losses = [];
  for (let i = 1; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff >= 0) {
      gains.push(diff);
      losses.push(0);
    } else {
      gains.push(0);
      losses.push(Math.abs(diff));
    }
  }

  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

  const rsiValues = [];
  for (let i = period; i < prices.length; i++) {
    const currentGain = gains[i - 1];
    const currentLoss = losses[i - 1];
    avgGain = ((avgGain * (period - 1)) + currentGain) / period;
    avgLoss = ((avgLoss * (period - 1)) + currentLoss) / period;

    if (avgLoss === 0) {
      rsiValues.push(100);
    } else {
      const rs = avgGain / avgLoss;
      const rsi = 100 - (100 / (1 + rs));
      rsiValues.push(rsi);
    }
  }

  return rsiValues;
}

// === Función para calcular MACD y la línea de señal ===
function calculateMACD(prices, shortTerm = 12, longTerm = 26, signalTerm = 9) {
  const shortEMA = calculateEMA(prices, shortTerm);
  const longEMA = calculateEMA(prices, longTerm);
  const macd = shortEMA.map((value, index) => value - longEMA[index]);
  const signalLine = calculateEMA(macd, signalTerm);
  return { macd, signalLine };
}

// === Función para calcular EMA ===
function calculateEMA(prices, period) {
  const multiplier = 2 / (period + 1);
  let ema = [prices[0]];
  for (let i = 1; i < prices.length; i++) {
    const newEMA = (prices[i] - ema[i - 1]) * multiplier + ema[i - 1];
    ema.push(newEMA);
  }
  return ema;
}

// === Función para calcular Bandas de Bollinger ===
function calculateBollingerBands(prices, period = 20, multiplier = 2) {
  const sma = calculateSMA(prices, period);
  const deviations = prices.map((price, index) => {
    const periodPrices = prices.slice(index - period + 1, index + 1);
    const mean = periodPrices.reduce((a, b) => a + b, 0) / periodPrices.length;
    const variance = periodPrices.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / periodPrices.length;
    return Math.sqrt(variance);
  });

  const upperBand = sma.map((smaValue, index) => smaValue + deviations[index] * multiplier);
  const lowerBand = sma.map((smaValue, index) => smaValue - deviations[index] * multiplier);

  return { upperBand, lowerBand };
}

// === Función para calcular SMA ===
function calculateSMA(prices, period) {
  const sma = [];
  for (let i = period - 1; i < prices.length; i++) {
    const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
    sma.push(sum / period);
  }
  return sma;
}

function Home() {
  const [crypto, setCrypto] = useState('BTC');
  const [price, setPrice] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [error, setError] = useState(null);
  const [prediction, setPrediction] = useState('');
  const [rsiValue, setRsiValue] = useState(null);
  const [macdValue, setMacdValue] = useState(null);
  const [bollingerBands, setBollingerBands] = useState(null);
  const [timePeriod, setTimePeriod] = useState(30); // Default to 30 days

  useEffect(() => {
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

            makePrediction(rsi, macd, signalLine, upperBand, lowerBand);
            makeTrendPrediction(prices);
          }
        } else {
          throw new Error(`Price history not available for ${crypto}.`);
        }
      } catch (error) {
        setError(error.message);
      }
    };

    fetchData();
  }, [crypto, timePeriod]);

  const makeTrendPrediction = (prices) => {
    const startPrice = prices[prices.length - timePeriod - 1];
    const endPrice = prices[prices.length - 1];
    const priceChange = ((endPrice - startPrice) / startPrice) * 100;

    if (priceChange > 0) {
      setPrediction(`Up ${priceChange.toFixed(2)}%`);
    } else if (priceChange < 0) {
      setPrediction(`Down ${Math.abs(priceChange).toFixed(2)}%`);
    } else {
      setPrediction('No significant change');
    }
  };

  const makePrediction = (rsi, macd, signalLine, upperBand, lowerBand) => {
    if (rsi < 30 && macd > signalLine) {
      setPrediction('Buy');
    } else if (rsi > 70 && macd < signalLine) {
      setPrediction('Sell');
    } else if (price > upperBand[upperBand.length - 1]) {
      setPrediction('Overbought - Sell');
    } else if (price < lowerBand[lowerBand.length - 1]) {
      setPrediction('Oversold - Buy');
    } else {
      setPrediction('Hold');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          value={crypto}
          onChange={e => setCrypto(e.target.value.toUpperCase())}
          className="p-2 border rounded w-1/3"
          placeholder="Enter cryptocurrency symbol"
        />
        <div className="price text-lg font-bold">
          {price && <p>Price: ${price}</p>}
          {prediction && <p>Prediction: {prediction}</p>}
        </div>
      </div>
      <div className="time-period mb-4">
        <label htmlFor="timePeriod" className="mr-2">Select Time Period (days):</label>
        <input
          type="number"
          id="timePeriod"
          value={timePeriod}
          onChange={e => setTimePeriod(Number(e.target.value))}
          min="1"
          max="200"
          className="p-2 border rounded w-20"
        />
      </div>
      <div className="chart-container">
<Line
  data={{
    labels: chartData.map((_, index) =>
      new Date().setDate(new Date().getDate() - chartData.length + index)
    ),
    datasets: [
      {
        label: `${crypto} Price`,
        data: chartData,
        fill: false,
        segment: {
          borderColor: (ctx) => {
            const { p0, p1 } = ctx;
            return p1.raw > p0.raw ? 'green' : 'red'; // Verde si sube, rojo si baja
          },
        },
        borderWidth: 2,
      },
    ],
  }}
  options={{
    responsive: true,
    scales: {
      x: { type: 'time', time: { unit: 'day' } },
      y: { beginAtZero: false },
    },
  }}
/>
      </div>
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
}

export default Home;
