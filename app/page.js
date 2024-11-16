'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './page.module.css';

function Home() {
  const [crypto, setCrypto] = useState('bitcoin');
  const [price, setPrice] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPrice = async () => {
      setError(null);
      try {
        const response = await axios.get(
          `https://api.coingecko.com/api/v3/simple/price?ids=${crypto}&vs_currencies=usd`
        );
        setPrice(response.data[crypto].usd);
      } catch (error) {
        console.error('Error fetching price:', error);
        setError('Failed to fetch price, please try again later.');
      }
    };

    fetchPrice();
  }, [crypto]); // Este efecto se ejecutará cada vez que cambie la criptomoneda seleccionada

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>ViewMarket</h1>

      <div className={styles.grid}>
        <select onChange={(e) => setCrypto(e.target.value)} value={crypto} className={styles.select}>
          <option value="bitcoin">Bitcoin</option>
          <option value="ethereum">Ethereum</option>
          {/* Añade más criptomonedas aquí */}
        </select>

        {error ? (
          <p className={styles.price}>Error: {error}</p>
        ) : (
          <p className={styles.price}>Current Price: ${price ? price.toLocaleString() : 'Loading...'}</p>
        )}

        <div className={styles.chart}>
          {/* Aquí irá el gráfico */}
        </div>

        <p className={styles.prediction}>Prediction: {/* Aquí irá la predicción */}</p>
      </div>
    </main>
  );
}

export default Home;