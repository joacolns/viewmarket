'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
import styles from './page.module.css';

// Importa las funciones desde indicator.js
import { calculateRSI, calculateMACD, calculateBollingerBands } from './indicators';

Chart.register(...registerables);

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

  // Función para calcular el cambio porcentual
  const calculatePriceChange = (prices) => {
    return prices.map((price, index) => {
      if (index === 0) return 0; // No hay cambio en el primer día
      const prevPrice = prices[index - 1];
      const priceChange = ((price - prevPrice) / prevPrice) * 100;
      return priceChange;
    });
  };

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

          // Calcula los cambios porcentuales
          const priceChanges = calculatePriceChange(prices);

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
        <label htmlFor="timePeriod" className="mr-2">Time Period (D Max. 200):</label>
        <input
          type="number"
          id="timePeriod"
          value={timePeriod || 0}  // Si timePeriod es 0 o NaN, muestra 0
          onChange={e => {
            const value = e.target.value;
            setTimePeriod(value === "" ? 0 : Math.max(1, Number(value)));  // Si está vacío, asigna 0
          }}
          className="p-2 border rounded"
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
  
      <div className="chart">
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
                      const price = tooltipItem.raw;
                      const priceChange = calculatePriceChange(chartData);
                      const change = priceChange[tooltipItem.dataIndex];
                      return `${crypto} Price: $${price} (${change.toFixed(2)}%)`;
                    }
                  }
                }
              },
              scales: {
                x: { beginAtZero: true },
                y: { beginAtZero: false }
              }
            }}
          />
        )}
      </div>
    </div>
  );
}

export default Home;
