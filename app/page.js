'use client';

import { useState, useRef, useEffect } from 'react';
import Login from './components/Login/login';
import useCryptoData from './hooks/useCryptoData';
import useStockData from './hooks/useStockData';
import useChartHeight from './hooks/useChartHeight';
import usePricePrediction from './hooks/usePricePrediction';
import ChartComponent from './components/ChartComponent';
import CryptoInput from './components/CryptoInput';
import StockInput from './components/StockInput/StockInput';
import PriceDisplay from './components/PriceDisplay';
import Indicators from './components/Indicators';
import TimePeriodInput from './components/TimePeriodInput';
import SocialIcons from './components/SocialIcons';
import AIAssistant from './components/AI/AIAssistant';
import ThemeToggle from './components/Themes/ThemeToggle';
import ModeToggle from './components/ModeToggle';
import NewsWindow from './components/News/NewsWindown';

function Home() {
  const [mode, setMode] = useState('crypto');
  const [crypto, setCrypto] = useState('BTC');
  const [stock, setStock] = useState('TSLA');
  const [timePeriod, setTimePeriod] = useState(30);
  const chartContainerRef = useRef(null);

  const cryptoData = useCryptoData(mode === 'crypto' ? crypto : null, timePeriod);
  const stockData = useStockData(mode === 'stocks' ? stock : null, timePeriod);
  const activeData = mode === 'crypto' ? cryptoData : stockData;
  const assetSymbol = mode === 'crypto' ? crypto : stock;
  const { price, chartData, error, rsiValue, macdValue, bollingerBands } = activeData;
  const { prediction, predictionStyle } = usePricePrediction(chartData, timePeriod);
  const chartHeight = useChartHeight(chartContainerRef);
  
  const priceChange24h = mode === 'crypto' ? cryptoData.priceChange24h : undefined;

  return (
    <div className="container mx-auto p-4 pb-12 md:pb-4">
      <ModeToggle mode={mode} setMode={setMode} />
      <ThemeToggle />

      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-2">
        {mode === 'crypto' ? (
          <CryptoInput crypto={crypto} setCrypto={setCrypto} clearStock={() => setStock('')} />
        ) : (
          <StockInput stock={stock} setStock={setStock} clearCrypto={() => setCrypto('')} />
        )}
        <PriceDisplay price={price} chartData={chartData} prediction={prediction} predictionStyle={predictionStyle} mode={mode} />
      </div>

      <TimePeriodInput timePeriod={timePeriod} setTimePeriod={setTimePeriod} />

      <Indicators 
      rsiValue={rsiValue} 
      macdValue={macdValue} 
      bollingerBands={bollingerBands}
      timePeriod={timePeriod} 
      mode={mode}
      />

      <div ref={chartContainerRef} className="chart w-full" style={{ height: chartHeight }}>
        {error && <p className="text-red-500">We couldn&apos;t load the &apos;{assetSymbol}&apos; data</p>}
        {chartData.length > 0 && (
          <ChartComponent
            crypto={crypto}
            chartData={chartData}
            rsiValue={rsiValue}
            macdValue={macdValue}
            bollingerBands={bollingerBands}
          />
        )}
      </div>

      <NewsWindow query={mode === 'crypto' ? 'cryptocurrency' : 'stocks'} />

      <AIAssistant 
        asset={mode === 'crypto' ? crypto : stock}
        mode={mode}
        price={price}
        indicators={{ rsi: rsiValue, macd: macdValue, bb: bollingerBands }}
        change24h={mode === 'crypto' ? priceChange24h : undefined}
      />

      <ThemeToggle />

      <SocialIcons />
    </div>
  );
}

export default function Page() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('logged-in', isLoggedIn);
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return <Login setIsLoggedIn={setIsLoggedIn} />;
  }

  return <Home />;
}