export const calculateRSI = (prices, period = 14) => {
  /*
  if (prices.length < period) {
    throw new Error("El número de precios debe ser mayor o igual al período.");
  }
  */

  const gains = [];
  const losses = [];

  for (let i = 1; i < prices.length; i++) {
    const difference = prices[i] - prices[i - 1];
    gains.push(Math.max(difference, 0));
    losses.push(Math.max(-difference, 0));
  }

  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

  const rsi = [100 - (100 / (1 + (avgGain / avgLoss)))];

  for (let i = period; i < prices.length; i++) {
    const gain = gains[i] || 0;
    const loss = losses[i] || 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    const rs = avgGain / avgLoss;
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
    const value = (prices[i] - ema[i - 1]) * k + ema[i - 1];
    ema.push(value);
  }

  return ema;
};

// Función para calcular las Bandas de Bollinger con un SMA real
export const calculateBollingerBands = (prices, period = 20, multiplier = 2) => {
  /*
  if (prices.length < period) {
    throw new Error("El número de precios debe ser mayor o igual al período.");
  }
  */
  const upperBand = [];
  const lowerBand = [];
  const middleBand = [];

  for (let i = period - 1; i < prices.length; i++) {
    const slice = prices.slice(i - period + 1, i + 1);
    const sma = slice.reduce((sum, value) => sum + value, 0) / period;
    const stdDev = Math.sqrt(slice.reduce((acc, price) => acc + Math.pow(price - sma, 2), 0) / period);

    middleBand.push(sma);
    upperBand.push(sma + multiplier * stdDev);
    lowerBand.push(sma - multiplier * stdDev);
  }

  return { upperBand, middleBand, lowerBand };
};

// Función para evaluar señales de compra/venta según los indicadores
export const evaluatePrediction = (rsi, macd, signalLine, upperBand, lowerBand, price) => {
  let prediction = 'Hold';

  // Señales de compra y venta combinadas
  if (rsi < 30 && macd[macd.length - 1] > signalLine[signalLine.length - 1] && price < lowerBand[lowerBand.length - 1]) {
    prediction = 'Buy';  // Compra si RSI bajo, MACD positivo y cerca de la banda inferior
  }
  else if (rsi > 70 && macd[macd.length - 1] < signalLine[signalLine.length - 1] && price > upperBand[upperBand.length - 1]) {
    prediction = 'Sell';  // Venta si RSI alto, MACD negativo y cerca de la banda superior
  }

  // Ajuste adicional: Si RSI está por encima de 80 y cerca de la banda superior, sugiere que puede haber una corrección.
  if (rsi > 80 && price >= upperBand[upperBand.length - 1]) {
    prediction = 'Sell or Wait for Correction';  // Sobrecompra, esperar corrección
  }
  
  // Ajuste adicional: Si RSI está por debajo de 20 y cerca de la banda inferior, sugiere un posible rebote alcista.
  if (rsi < 20 && price <= lowerBand[lowerBand.length - 1]) {
    prediction = 'Buy or Wait for Reversal';  // Sobreventa, esperar rebote
  }

  // Añadir lógica para precios cercanos a la banda superior (y RSI elevado)
  if (rsi > 70 && price >= upperBand[upperBand.length - 1]) {
    prediction = 'Sell or Wait for Correction';  // Corrección probable si RSI alto y cerca de la banda superior
  }

  // Añadir lógica para precios cercanos a la banda inferior (y RSI bajo)
  if (rsi < 30 && price <= lowerBand[lowerBand.length - 1]) {
    prediction = 'Buy or Wait for Reversal';  // Rebote posible si RSI bajo y cerca de la banda inferior
  }

  return prediction;
};