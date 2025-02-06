import { useState, useEffect } from 'react';
import axios from 'axios';
import { calculateRSI, calculateMACD, calculateBollingerBands } from '../backend/references/indicators';

const useCryptoData = (crypto, timePeriod) => {
  const [data, setData] = useState({
    price: null,
    priceChange24h: null,
    priceChangeAbs24h: null,
    chartData: [],
    error: null,
    rsiValue: null,
    macdValue: null,
    bollingerBands: null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [priceRes, historyRes, twentyFourHRes] = await Promise.all([
          axios.get(process.env.NEXT_PUBLIC_CRYPTO_DATA + `price?fsym=${crypto}&tsyms=USD`),
          axios.get(process.env.NEXT_PUBLIC_CRYPTO_DATA + `v2/histoday?fsym=${crypto}&tsym=USD&limit=200`),
          axios.get(process.env.NEXT_PUBLIC_CRYPTO_DATA + `v2/histohour?fsym=${crypto}&tsym=USD&limit=24`)
        ]);

        const prices = historyRes.data.Data.Data.map(d => d.close);

        const currentPrice = priceRes.data.USD;
        const pastPrice = twentyFourHRes.data.Data.Data[0].close;
        const priceChangeAbs = currentPrice - pastPrice;
        const priceChange24h = (priceChangeAbs / pastPrice) * 100;

        const historicalData = historyRes.data.Data.Data;
        const previousClose = historicalData[0].close;

        const priceChange = ((currentPrice - previousClose) / previousClose) * 100;

        const indicators = {
          rsi: calculateRSI(prices),
          macd: calculateMACD(prices),
          bb: calculateBollingerBands(prices)
        };

        setData({
          price: currentPrice,
          priceChange24h: priceChange24h,
          priceChangeAbs24h: priceChangeAbs,
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