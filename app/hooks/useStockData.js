import axios from 'axios';
import { useEffect, useState } from 'react';
import { calculateRSI, calculateMACD, calculateBollingerBands } from '../indicators';

const API_KEY = process.env.NEXT_PUBLIC_TWELVE_DATA_KEY;
const BASE_URL = 'https://api.twelvedata.com/time_series';

const useStockData = (stock, timePeriod) => {
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
        const response = await axios.get(BASE_URL, {
          params: {
            symbol: stock,
            interval: '1day',
            outputsize: '200',
            apikey: API_KEY,
          },
        });

        const prices = response.data.values
          .map(entry => parseFloat(entry.close))
          .reverse();

        const indicators = {
          rsi: calculateRSI(prices),
          macd: calculateMACD(prices),
          bb: calculateBollingerBands(prices)
        };

        setData({
          price: prices[prices.length - 1],
          chartData: prices,
          error: null,
          rsiValue: indicators.rsi.slice(-1)[0],
          macdValue: indicators.macd.macd.slice(-1)[0],
          bollingerBands: indicators.bb
        });

      } catch (error) {
        setData(prev => ({
          ...prev,
          error: 'Error fetching stock data'
        }));
      }
    };

    if (stock) fetchData();
  }, [stock, timePeriod]);

  return data;
};

export default useStockData;
