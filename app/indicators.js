// Función para calcular RSI
export function calculateRSI(prices, period = 14) {
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
  
  // Función para calcular MACD y la línea de señal
  export function calculateMACD(prices, shortTerm = 12, longTerm = 26, signalTerm = 9) {
    const shortEMA = calculateEMA(prices, shortTerm);
    const longEMA = calculateEMA(prices, longTerm);
    const macd = shortEMA.map((value, index) => value - longEMA[index]);
    const signalLine = calculateEMA(macd, signalTerm);
    return { macd, signalLine };
  }
  
  // Función para calcular EMA
  export function calculateEMA(prices, period) {
    const multiplier = 2 / (period + 1);
    let ema = [prices[0]];
    for (let i = 1; i < prices.length; i++) {
      const newEMA = (prices[i] - ema[i - 1]) * multiplier + ema[i - 1];
      ema.push(newEMA);
    }
    return ema;
  }
  
  // Función para calcular Bandas de Bollinger
  export function calculateBollingerBands(prices, period = 20, multiplier = 2) {
    const sma = calculateSMA(prices, period);
    const deviations = prices.map((price, index) => {
      const periodPrices = prices.slice(index - period + 1, index + 1);
      const mean = periodPrices.reduce((a, b) => a + b, 0) / periodPrices.length;
      const variance = periodPrices.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / periodPrices.length;
      return Math.sqrt(variance);
    });
  
    const upperBand = sma.map((smaValue, index) => smaValue + deviations[index] * multiplier);
    const lowerBand = sma.map((smaValue, index) => smaValue - deviations[index] * multiplier);
  
    return { upperBand, lowerBand };
  }
  
  // Función para calcular SMA
  export function calculateSMA(prices, period) {
    const sma = [];
    for (let i = period - 1; i < prices.length; i++) {
      const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      sma.push(sum / period);
    }
    return sma;
  }
  