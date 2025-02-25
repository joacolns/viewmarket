'use client';
import { useState, useEffect } from 'react';
import { FaStickyNote, FaTrash } from 'react-icons/fa';

const ProfitLossCalculator = () => {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [cryptoToken, setCryptoToken] = useState('');
  const [stockSymbol, setStockSymbol] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [usdAmount, setUsdAmount] = useState('');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedEntries = localStorage.getItem('profitLossEntries');
      if (storedEntries) {
        setEntries(JSON.parse(storedEntries));
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('profitLossEntries', JSON.stringify(entries));
    }
  }, [entries]);

  const fetchPrice = async (symbol, type) => {
    try {
      if (type === 'crypto') {
        const response = await fetch(
          `https://min-api.cryptocompare.com/data/price?fsym=${symbol.toUpperCase()}&tsyms=USD`
        );
        const data = await response.json();
        if (data.USD) return data.USD;
        else throw new Error('Precio no encontrado');
      } else {
        const response = await fetch('backend/api/stocks', {
          method: 'POST',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stock: symbol.toUpperCase() }),
        });
        const data = await response.json();
        if (data.price) return data.price;
        else throw new Error('Precio no encontrado');
      }
    } catch (err) {
      console.error(err);
      setError('No se pudo obtener el precio actual.');
      return null;
    }
  };

  const handleAdd = async () => {
    const token = cryptoToken || stockSymbol;
    const type = cryptoToken ? 'crypto' : 'stock';

    if (!token || !purchasePrice || !usdAmount || !label) return;
    setLoading(true);
    setError('');
    
    const currentPrice = await fetchPrice(token.toUpperCase(), type);
    if (currentPrice !== null) {
      const tokensBought = parseFloat(usdAmount) / parseFloat(purchasePrice);
      const newEntry = {
        label,
        token: token.toUpperCase(),
        type,
        purchasePrice: parseFloat(purchasePrice),
        usdAmount: parseFloat(usdAmount),
        tokensBought,
        currentPrice,
      };
      setEntries((prevEntries) => [...prevEntries, newEntry]);
      setLabel('');
      setCryptoToken('');
      setStockSymbol('');
      setPurchasePrice('');
      setUsdAmount('');
    }
    setLoading(false);
  };

  const handleDelete = (index) => {
    setEntries((prevEntries) => prevEntries.filter((_, i) => i !== index));
  };

  if (!mounted) return null;

  const totalProfitLoss = entries.reduce((total, entry) => {
    const currentValue = entry.tokensBought * entry.currentPrice;
    return total + (currentValue - entry.usdAmount);
  }, 0);

  const inputStyle = {
    backgroundColor: 'var(--card-bg)',
    color: 'var(--card-text)',
    border: '1px solid var(--card-text)'
  };

  return (
    <>
      <button
        className="fixed bottom-4 left-4 bg-yellow-500 hover:bg-yellow-600 text-white p-4 rounded-full shadow-lg transition-transform duration-300 transform hover:scale-110 focus:outline-none z-50"
        onClick={() => setOpen(!open)}
      >
        <FaStickyNote size={24} />
      </button>

      {open && (
        <div
          className="fixed bottom-20 left-4 w-80 rounded-lg shadow-2xl p-4 z-50 animate-slide-up-fade-in"
          style={{
            backgroundColor: 'var(--card-bg)',
            color: 'var(--card-text)',
            border: '1px solid var(--card-text)',
          }}
        >
          <h2 className="text-lg font-bold mb-4">Portfolio & P/L Calculator</h2>
          <div className="mb-4">
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Label"
              className="w-full p-2 rounded mb-2"
              style={inputStyle}
            />
            <input
              type="text"
              value={cryptoToken}
              onChange={(e) => {
                setCryptoToken(e.target.value);
                setStockSymbol('');
              }}
              placeholder="Crypto (Eg: BTC)"
              className="w-full p-2 rounded mb-2"
              style={inputStyle}
            />
            <input
              type="text"
              value={stockSymbol}
              onChange={(e) => {
                setStockSymbol(e.target.value);
                setCryptoToken('');
              }}
              placeholder="Stock (Eg: TSLA)"
              className="w-full p-2 rounded mb-2"
              style={inputStyle}
            />
            <input
              type="number"
              min="0"
              value={purchasePrice}
              onChange={(e) => {
                const value = Number(e.target.value);
                setPurchasePrice(value < 0 ? 0 : value);
              }}
              placeholder="Price"
              className="w-full p-2 rounded mb-2"
              style={inputStyle}
            />
            <input
              type="number"
              min="0"
              value={usdAmount}
              onChange={(e) => {
                const value = Number(e.target.value);
                setUsdAmount(value < 0 ? 0 : value);
              }}
              placeholder="Investment ($USD)"
              className="w-full p-2 rounded"
              style={inputStyle}
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            <button
              className="w-full mt-2 bg-blue-500 text-white p-2 rounded transition-transform duration-300 transform hover:scale-105"
              onClick={handleAdd}
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add'}
            </button>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {entries.length === 0 ? (
              <p className="text-gray-500 text-sm">No entries.</p>
            ) : (
              entries.map((entry, index) => {
                const currentValue = entry.tokensBought * entry.currentPrice;
                const profitLoss = currentValue - entry.usdAmount;
                const profitLossPercentage = ((profitLoss / entry.usdAmount) * 100).toFixed(2);
                return (
                  <div
                    key={index}
                    className="flex justify-between items-center p-2 border-b last:border-0 animate-fade-in"
                    style={{ borderColor: 'var(--card-text)' }}
                  >
                    <div>
                      <p className="font-semibold">
                        {entry.label} ({entry.type === 'crypto' ? 'Crypto' : 'Stock'})
                      </p>
                      <p className="text-sm">Symbol: {entry.token}</p>
                      <p className="text-sm">Purchase price: ${entry.purchasePrice.toFixed(2)}</p>
                      <p className="text-sm">Amount invested: ${entry.usdAmount.toFixed(2)}</p>
                      <p className="text-sm">Actual price: ${entry.currentPrice.toFixed(2)}</p>
                      <p className="text-sm">Purchased quantity: {entry.tokensBought.toFixed(4)}</p>
                      <p className={`text-sm ${profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {profitLoss >= 0 ? 'Profit' : 'Loss'}: ${Math.abs(profitLoss).toFixed(2)} ({profitLossPercentage}%)
                      </p>
                    </div>
                    <button onClick={() => handleDelete(index)} className="ml-4 text-red-500 hover:text-red-700">
                      <FaTrash />
                    </button>
                  </div>
                );
              })
            )}
          </div>
          <div className="mt-4 p-2 text-center border-t" style={{ borderColor: 'var(--card-text)' }}>
            <p className="font-semibold">Total:</p>
            <p className={`text-lg font-bold ${totalProfitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {totalProfitLoss >= 0 ? 'Profit' : 'Loss'}: ${Math.abs(totalProfitLoss).toFixed(2)}
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfitLossCalculator;
