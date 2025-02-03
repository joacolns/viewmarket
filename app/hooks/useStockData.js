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
          `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${stock}&outputsize=full&apikey=${process.env.NEXT_PUBLIC_ALPHAVANTAGE_KEY}`
        );
        
        const timeSeries = response.data['Time Series (Daily)'];
        // Convertir el objeto a un array y tomar los primeros 200 puntos
        const prices = Object.values(timeSeries)
          .slice(0, 200)
          .map(entry => parseFloat(entry['4. close']))
          .reverse();

        // Calcular el cambio en 24h: diferencia entre el último precio y el anterior
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
