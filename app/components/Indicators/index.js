import useCryptoData from '../../hooks/useCryptoData';
import Image from 'next/image';

const cryptoImages = {
  BTC: 'https://cryptocompare.com/media/37746251/btc.png',
  ETH: 'https://cryptocompare.com/media/37746238/eth.png',
  BNB: 'https://cryptocompare.com/media/40485170/bnb.png'
};

const CryptoPriceRow = ({ crypto, data }) => {
  const isPositive = data?.priceChange24h >= 0;
  const arrow = isPositive ? '▲' : '▼';
  const changeColor = isPositive ? 'text-green-500' : 'text-red-500';

  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <Image
          src={cryptoImages[crypto]}
          alt={crypto}
          width={18}  // Puedes ajustar este valor
          height={18} // Puedes ajustar este valor
          className="w-6 h-6 rounded-full"
      />
        <span className="font-medium">{crypto}</span>
      </div>
      
      <div className="flex items-center space-x-3">
        <span>${data?.price?.toFixed(2) || '...'}</span>
        
        {data?.priceChange24h !== null && (
          <div className={`flex items-center space-x-1 ${changeColor}`}>
            <span>{arrow}</span>
            <div className="text-right">
              <div className="text-sm font-bold">
                {Math.abs(data.priceChange24h).toFixed(2)}%
              </div>
              <div className="text-xs">
                (${Math.abs(data.priceChangeAbs24h).toFixed(2)})
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Indicators = ({ rsiValue, macdValue, bollingerBands, timePeriod }) => {
  const btcData = useCryptoData('BTC', timePeriod);
  const ethData = useCryptoData('ETH', timePeriod);
  const bnbData = useCryptoData('BNB', timePeriod);


  return (
    <div className="flex flex-col md:flex-row gap-4"> 
      <div className="w-full md:w-2/3 bg-gray-100 rounded-3xl p-4">
        <div className="space-y-1">
          <p>RSI Value: {rsiValue?.toFixed(2) || 'Loading...'}</p>
          <p>MACD Value: {macdValue?.toFixed(2) || 'Loading...'}</p>
          <p>Upper Bollinger Band: {bollingerBands?.upperBand?.slice(-1)[0]?.toFixed(2) || 'Loading...'}</p>
          <p>Lower Bollinger Band: {bollingerBands?.lowerBand?.slice(-1)[0]?.toFixed(2) || 'Loading...'}</p>
        </div>
      </div>

      <div className="w-full md:w-1/3 bg-gray-100 rounded-3xl p-4">
        <div className="space-y-1">
          <CryptoPriceRow crypto="BTC" data={btcData} />
          <CryptoPriceRow crypto="ETH" data={ethData} />
          <CryptoPriceRow crypto="BNB" data={bnbData} />
        </div>
      </div>
      

    </div>
  );
};

export default Indicators;