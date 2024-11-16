'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
import styles from './page.module.css';

Chart.register(...registerables);

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

function Home() {
  const [crypto, setCrypto] = useState('BTC');
  const [price, setPrice] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [error, setError] = useState(null);
  const [prediction, setPrediction] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setError(null);
      try {
        // Fetch current price from CryptoCompare
        const priceResponse = await axios.get(
          `https://min-api.cryptocompare.com/data/price?fsym=${crypto}&tsyms=USD`
        );
        
        if (priceResponse.data && priceResponse.data.USD) {
          setPrice(priceResponse.data.USD);
        } else {
          // Intento de fallback con CoinGecko en caso de que CryptoCompare no tenga datos
          try {
            const coingeckoResponse = await axios.get(
              `https://api.coingecko.com/api/v3/simple/price?ids=${crypto.toLowerCase()}&vs_currencies=usd`
            );
            if (coingeckoResponse.data && coingeckoResponse.data[crypto.toLowerCase()]) {
              setPrice(coingeckoResponse.data[crypto.toLowerCase()].usd);
            } else {
              throw new Error(`Price data not available for ${crypto} from any source.`);
            }
          } catch (coingeckoErr) {
            setError(`Price data not available for ${crypto}.`);
            return; // No intentamos obtener datos históricos si no hay precio
          }
        }

        // Fetch historical data from CryptoCompare. Increased limit to 20 for RSI calculation
        const historyResponse = await axios.get(
          `https://min-api.cryptocompare.com/data/v2/histoday?fsym=${crypto}&tsym=USD&limit=20`
        );

        if (historyResponse.data && 
            historyResponse.data.Data && 
            historyResponse.data.Data.Data && 
            Array.isArray(historyResponse.data.Data.Data)) {
          const prices = historyResponse.data.Data.Data.map(data => ({
            x: new Date(data.time * 1000), 
            y: data.close
          }));
          setChartData(prices);

          if (prices.length >= 15) {  // Asegúrate de tener al menos 15 datos para RSI
            const rsi = calculateRSI(prices.map(item => item.y));
            if (rsi.length > 0) {
              const lastRSI = rsi[rsi.length - 1];
              let prediction = 'Neutral';

              if (lastRSI > 70) {
                prediction = 'Overbought - Possible Price Drop';
              } else if (lastRSI < 30) {
                prediction = 'Oversold - Possible Price Rise';
              }

              setPrediction(prediction);
            } else {
              setPrediction('RSI calculation resulted in no data');
            }
          } else {
            setPrediction('Not enough historical data for RSI calculation');
          }
        } else {
          setError(`Historical data not available or in unexpected format for ${crypto}.`);
        }
      } catch (err) {
        console.error('Error fetching or processing data:', err.message || err);
        if (err.message.includes('400') || err.message.includes('Invalid')) {
          setError(`Cryptocurrency ${crypto} is not supported or invalid.`);
        } else {
          setError('Failed to fetch data, please try again later.');
        }
      }
    };

    fetchData();
  }, [crypto]);

  const data = {
    datasets: [{
      label: `${crypto} Price (USD)`,
      data: chartData,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1,
      fill: false,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 16,
            weight: 'bold',
          },
          usePointStyle: true,
        },
      },
      title: {
        display: true,
        text: '7-Day Price History',
        font: {
          size: 24,
          weight: 'bold',
        },
        color: '#2B2B2B',
        padding: {
          top: 10,
          bottom: 30
        },
      },
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
          tooltipFormat: 'dd/MM/yyyy',
          displayFormats: {
            day: 'MMM dd',
          },
        },
        title: {
          display: true,
          text: 'Date',
          color: '#2B2B2B',
          font: {
            size: 14,
          },
        },
        ticks: {
          color: '#666',
          font: {
            size: 12,
          },
        },
      },
      y: {
        title: {
          display: true,
          text: 'Price (USD)',
          color: '#2B2B2B',
          font: {
            size: 14,
          },
        },
        ticks: {
          color: '#666',
          font: {
            size: 12,
          },
        },
      },
    },
    elements: {
      line: {
        tension: 0.4,
        borderWidth: 3,
        fill: false,
      },
      point: {
        radius: 0,
        hitRadius: 5,
      },
    },
    animation: {
      duration: 1000,
    },
    layout: {
      padding: {
        left: 20,
        right: 20,
        top: 20,
        bottom: 20,
      },
    },
  };

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>ViewMarket</h1>

      <div className={styles.grid}>
        <select onChange={(e) => setCrypto(e.target.value)} value={crypto} className={styles.select}>
          <option value="BTC">Bitcoin (BTC)</option>
          <option value="ETH">Ethereum (ETH)</option>
          <option value="BNB">Binance Coin (BNB)</option>
        </select>

        {error ? (
          <p className={styles.price}>Error: {error}</p>
        ) : chartData.length === 0 ? (
          <p className={styles.price}>Loading data...</p>
        ) : (
          <>
            <p className={styles.price}>Current Price: ${price ? price.toLocaleString() : 'Loading...'}</p>
            <p className={`${styles.prediction} ${prediction.includes('Over') ? styles.overbought : (prediction.includes('Under') ? styles.oversold : styles.neutral)}`}>
              Prediction: {prediction}
            </p>
            {chartData.length > 0 && 
              <div className={styles.chart}>
                <Line data={data} options={options} />
              </div>}
          </>
        )}
      </div>
    </main>
  );
}

export default Home;