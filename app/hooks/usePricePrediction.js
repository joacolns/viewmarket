import { useState, useEffect } from 'react';
import { calculateRSI, calculateMACD, calculateBollingerBands } from '../backend/references/indicators';

const usePricePrediction = (chartData, timePeriod) => {
  const [prediction, setPrediction] = useState('');
  const [predictionStyle, setPredictionStyle] = useState({});

  useEffect(() => {
    const makeTrendPrediction = () => {
      if (!chartData || chartData.length < timePeriod + 14) {
        setPrediction('Not enough data for the selected period');
        setPredictionStyle({});
        return;
      }

      const startIndex = chartData.length - timePeriod - 1;
      const endIndex = chartData.length - 1;
      const periodPrices = chartData.slice(startIndex, endIndex + 1);

      const rsi = calculateRSI(periodPrices);
      const { macd, signalLine } = calculateMACD(periodPrices);
      const { upperBand, lowerBand } = calculateBollingerBands(periodPrices);

      const currentPrice = periodPrices[periodPrices.length - 1];
      const priceChange = currentPrice - periodPrices[0];
      const percentChange = (priceChange / periodPrices[0]) * 100;

      let trendPrediction = 'No clear trend - Hold';
      let style = {};

      if (rsi[rsi.length - 1] < 30) {
        if (macd[macd.length - 1] > signalLine[signalLine.length - 1] && currentPrice < lowerBand[lowerBand.length - 1]) {
          trendPrediction = `Strong potential for price increase in ${timePeriod} days - Consider buying soon.`;
          style = { color: 'green', icon: '↑' };
        } else {
          trendPrediction = `RSI indicates potential rebound - Watch for confirmation signals.`;
          style = { color: 'grey', icon: '↗' };
        }
      } else if (rsi[rsi.length - 1] > 70) {
        if (macd[macd.length - 1] < signalLine[signalLine.length - 1] && currentPrice > upperBand[upperBand.length - 1]) {
          trendPrediction = `Strong potential for price decrease in ${timePeriod} days - Consider selling or shorting.`;
          style = { color: 'red', icon: '↓' };
        } else {
          trendPrediction = `RSI suggests possible correction - Monitor for sell signals.`;
          style = { color: 'orange', icon: '↘' };
        }
      } else {
        if (macd[macd.length - 1] > signalLine[signalLine.length - 1]) {
          trendPrediction = `Potential bullish crossover detected - Possible price increase.`;
          style = { color: 'green', icon: '⬆' };
        } else if (macd[macd.length - 1] < signalLine[signalLine.length - 1]) {
          trendPrediction = `Bearish crossover detected - Possible price decrease.`;
          style = { color: 'red', icon: '⬇' };
        }
      }

      if (currentPrice > upperBand[upperBand.length - 1] && rsi[rsi.length - 1] > 70) {
        trendPrediction = `Overbought conditions, expect price to pull back - Profit-taking.`;
        style = { color: 'red', icon: '⇊' };
      } else if (currentPrice < lowerBand[lowerBand.length - 1] && rsi[rsi.length - 1] < 30) {
        trendPrediction = `Oversold conditions, expect price to bounce back - Buy.`;
        style = { color: 'green', icon: '⇈' };
      }

      if (priceChange > 0) {
        trendPrediction += ` Price has increased ${percentChange.toFixed(2)}% in the last ${timePeriod} days.`;
      } else if (priceChange < 0) {
        trendPrediction += ` Price has decreased ${Math.abs(percentChange).toFixed(2)}% in the last ${timePeriod} days.`;
      }

      setPrediction(trendPrediction);
      setPredictionStyle(style);
    };

    makeTrendPrediction();
  }, [chartData, timePeriod]);

  return { prediction, predictionStyle };
};

export default usePricePrediction;
