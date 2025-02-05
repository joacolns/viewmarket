export const calculateRSI = (prices, period = 14) => {
  /*
  if (prices.length < period + 1) {
    return []; // O lanzar un error si prefieres
  }
  */

  let avgGain = 0;
  let avgLoss = 0;
  const rsi = [];

  // Inicializa el primer promedio usando los primeros "period" cambios
  for (let i = 1; i <= period; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff >= 0) {
      avgGain += diff;
    } else {
      avgLoss += Math.abs(diff);
    }
  }
  avgGain /= period;
  avgLoss /= period;

  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  rsi.push(100 - (100 / (1 + rs)));

  // Calcular RSI para el resto de los precios usando el suavizado exponencial
  for (let i = period + 1; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? Math.abs(diff) : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi.push(100 - (100 / (1 + rs)));
  }

  return rsi;
};


// Función para calcular el MACD (Moving Average Convergence Divergence)
export const calculateMACD = (prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) => {
  const fastEMA = calculateEMA(prices, fastPeriod);
  const slowEMA = calculateEMA(prices, slowPeriod);
  const macd = fastEMA.map((value, index) => value - slowEMA[index]);
  const signalLine = calculateEMA(macd, signalPeriod);
  return { macd, signalLine };
};


// Función para calcular el EMA (Exponential Moving Average)
export const calculateEMA = (prices, period) => {
  const k = 2 / (period + 1);
  const ema = [prices[0]];
  for (let i = 1; i < prices.length; i++) {
    ema.push((prices[i] - ema[i - 1]) * k + ema[i - 1]);
  }
  return ema;
};


// Función para calcular las Bandas de Bollinger con un SMA real
export const calculateBollingerBands = (prices, period = 20, multiplier = 2) => {

  /*
  if (prices.length < period) {
    return { upperBand: [], middleBand: [], lowerBand: [] };
  }
  */

  const upperBand = [];
  const middleBand = [];
  const lowerBand = [];
  
  // Inicializamos con la suma y suma de cuadrados del primer período
  let sum = 0;
  let sumSq = 0;
  for (let i = 0; i < period; i++) {
    sum += prices[i];
    sumSq += prices[i] * prices[i];
  }
  
  for (let i = period; i <= prices.length; i++) {
    const sma = sum / period;
    middleBand.push(sma);
    
    const variance = (sumSq / period) - (sma * sma);
    const stdDev = Math.sqrt(variance);
    upperBand.push(sma + multiplier * stdDev);
    lowerBand.push(sma - multiplier * stdDev);
    
    // Si aún quedan datos, actualizamos las sumas para la siguiente ventana
    if (i < prices.length) {
      sum = sum - prices[i - period] + prices[i];
      sumSq = sumSq - prices[i - period] * prices[i - period] + prices[i] * prices[i];
    }
  }
  
  return { upperBand, middleBand, lowerBand };
};


export const evaluatePrediction = (rsi, macd, signalLine, upperBand, lowerBand, price) => {
  // Definir umbrales configurables
  const oversold = 30, overbought = 70;
  const extremeOversold = 20, extremeOverbought = 80;
  
  // Inicialmente, se sugiere "Hold"
  let prediction = 'Hold';

  const latestMACD = macd[macd.length - 1];
  const latestSignal = signalLine[signalLine.length - 1];
  const latestUpper = upperBand[upperBand.length - 1];
  const latestLower = lowerBand[lowerBand.length - 1];

  // Condiciones de compra
  if (rsi < oversold && latestMACD > latestSignal && price < latestLower) {
    prediction = 'Buy';
  }
  // Condiciones de venta
  else if (rsi > overbought && latestMACD < latestSignal && price > latestUpper) {
    prediction = 'Sell';
  }
  
  // Ajustes adicionales para condiciones extremas
  if (rsi > extremeOverbought && price >= latestUpper) {
    prediction = 'Sell or Wait for Correction';
  }
  if (rsi < extremeOversold && price <= latestLower) {
    prediction = 'Buy or Wait for Reversal';
  }
  
  return prediction;
};

