'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
import styles from './page.module.css';

Chart.register(...registerables);

function Home() {
  const [crypto, setCrypto] = useState('BTC');
  const [price, setPrice] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [error, setError] = useState(null);

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

        // Fetch historical data from CryptoCompare
        const historyResponse = await axios.get(
          `https://min-api.cryptocompare.com/data/v2/histoday?fsym=${crypto}&tsym=USD&limit=7`
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
        } else {
          // Aquí podrías intentar obtener datos históricos de CoinGecko o simplemente manejar el error
          setError(`Historical data not available or in unexpected format for ${crypto}.`);
        }
      } catch (err) {
        if (err.message.includes('400') || err.message.includes('Invalid')) {
          setError(`Cryptocurrency ${crypto} is not supported or invalid.`);
        } else {
          console.error('Error fetching data:', err.message || err);
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
    maintainAspectRatio: false, // Esto permite que el gráfico se ajuste al contenedor sin mantener la proporción
    plugins: {
      legend: {
        position: 'top', // Mantener la leyenda en la parte superior para que el gráfico tenga más espacio
        labels: {
          font: {
            size: 16, // Aumenta el tamaño de la fuente de la leyenda
            weight: 'bold',
          },
          usePointStyle: true, // Usar el estilo de los puntos para las etiquetas de la leyenda
        },
      },
      title: {
        display: true,
        text: '7-Day Price History',
        font: {
          size: 24, // Aumenta el tamaño del título
          weight: 'bold',
        },
        color: '#2B2B2B', // Asegura que el título sea legible
        padding: {
          top: 10,
          bottom: 30 // Más espacio entre el título y el gráfico
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
          color: '#666', // Color más oscuro para los ticks
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
        tension: 0.4, // Ajusta la suavidad de la línea para un aspecto más fluido
        borderWidth: 3, // Hace la línea del gráfico más gruesa
        fill: false, // Sin sombreado debajo de la línea
      },
      point: {
        radius: 0, // Oculta los puntos para una apariencia más limpia, o ajusta si prefieres verlos
        hitRadius: 5, // Aumenta el área sensible para la interacción
      },
    },
    animation: {
      duration: 1000, // Animación más suave al cargar o actualizar el gráfico
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
          <option value="BNB">Binance Coin (BNB)</option> {/* Aquí hemos añadido BNB */}
        </select>

        {error ? (
          <p className={styles.price}>Error: {error}</p>
        ) : (
          <>
            <p className={styles.price}>Current Price: ${price ? price.toLocaleString() : 'Loading...'}</p>
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