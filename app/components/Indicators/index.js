const Indicators = ({ rsiValue, macdValue, bollingerBands }) => {
  return (
    <div className="indicators mb-4 space-y-1 bg-gray-100 rounded-3xl p-4">
      <p>RSI Value: {rsiValue?.toFixed(2) || 'Loading...'}</p>
      <p>MACD Value: {macdValue?.toFixed(2) || 'Loading...'}</p>
      <p>Upper Bollinger Band: {bollingerBands?.upperBand?.slice(-1)[0]?.toFixed(2) || 'Loading...'}</p>
      <p>Lower Bollinger Band: {bollingerBands?.lowerBand?.slice(-1)[0]?.toFixed(2) || 'Loading...'}</p>
    </div>
  );
};
  
  export default Indicators;