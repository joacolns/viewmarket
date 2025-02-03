import axios from 'axios';
import { useEffect, useState } from 'react';
import { calculateRSI, calculateMACD, calculateBollingerBands } from '../indicators';

const useStockData = (stock, timePeriod) => {
  const [data, setData] = useState({
    price: null,
    chartData: [],
    priceChange24h: null,
    priceChangeAbs24h: null,
    error: null,
    rsiValue: null,
    macdValue: null,
    bollingerBands: null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `https://api.twelvedata.com/time_series?symbol=${stock}&interval=1day&outputsize=200&apikey=${process.env.NEXT_PUBLIC_TWELVE_DATA_KEY}`
        );

        if (!response.data || response.data.status === "error") {
          throw new Error(response.data.message || "API Error");
        }

        const timeSeries = response.data.values;
        if (!timeSeries || timeSeries.length < 2) {
          throw new Error("Insufficient data from API");
        }

        const prices = timeSeries.map(entry => parseFloat(entry.close)).reverse();

        const currentPrice = prices[prices.length - 1];
        const previousPrice = prices[prices.length - 2];
        const priceChangeAbs24h = currentPrice - previousPrice;
        const priceChange24h = (priceChangeAbs24h / previousPrice) * 100;

        const indicators = {
          rsi: calculateRSI(prices),
          macd: calculateMACD(prices),
          bb: calculateBollingerBands(prices)
        };

        setData({
          price: currentPrice,
          chartData: prices,
          priceChange24h,
          priceChangeAbs24h,
          error: null,
          rsiValue: indicators.rsi.slice(-1)[0],
          macdValue: indicators.macd.macd.slice(-1)[0],
          bollingerBands: indicators.bb
        });

      } catch (error) {
        console.error("Error fetching stock data:", error);
        setData(prev => ({
          ...prev,
          error: error.message || 'Error fetching stock data'
        }));
      }
    };

    if (stock) fetchData();
  }, [stock, timePeriod]);

  return data;
};

export default useStockData;
