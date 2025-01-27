import { useState, useEffect } from 'react';
import axios from 'axios';
import { calculateRSI, calculateMACD, calculateBollingerBands } from '../indicators';

const useCryptoData = (crypto, timePeriod) => {
  const [data, setData] = useState({
    price: null,
    chartData: [],
    error: null,
    rsiValue: null,
    macdValue: null,
    bollingerBands: null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [priceRes, historyRes] = await Promise.all([
          axios.get(`https://min-api.cryptocompare.com/data/price?fsym=${crypto}&tsyms=USD`),
          axios.get(`https://min-api.cryptocompare.com/data/v2/histoday?fsym=${crypto}&tsym=USD&limit=200`)
        ]);

        const prices = historyRes.data.Data.Data.map(d => d.close);
        const indicators = {
          rsi: calculateRSI(prices),
          macd: calculateMACD(prices),
          bb: calculateBollingerBands(prices)
        };

        setData({
          price: priceRes.data.USD,
          chartData: prices,
          error: null,
          rsiValue: indicators.rsi.slice(-1)[0],
          macdValue: indicators.macd.macd.slice(-1)[0],
          bollingerBands: indicators.bb
        });

      } catch (error) {
        setData(prev => ({ ...prev, error: error.message }));
      }
    };

    fetchData();
  }, [crypto, timePeriod]);

  return data;
};

export default useCryptoData;