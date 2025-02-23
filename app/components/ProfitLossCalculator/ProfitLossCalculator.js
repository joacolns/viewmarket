'use client';
import { useState, useEffect } from 'react';
import { FaStickyNote, FaTrash } from 'react-icons/fa';

const ProfitLossCalculator = () => {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [token, setToken] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [usdAmount, setUsdAmount] = useState('');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Asegurarse de que se renderice solo en el cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  // Cargar datos de localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedEntries = localStorage.getItem('profitLossEntries');
      console.log('Cargando desde localStorage:', storedEntries);
      if (storedEntries) {
        setEntries(JSON.parse(storedEntries));
      }
    }
  }, []);

  // Guardar en localStorage cada vez que cambian las entradas
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('Guardando en localStorage:', entries);
      localStorage.setItem('profitLossEntries', JSON.stringify(entries));
    }
  }, [entries]);

  // Función para obtener el precio actual de la crypto usando CryptoCompare
  const fetchPrice = async (tokenSymbol) => {
    try {
      const response = await fetch(
        `https://min-api.cryptocompare.com/data/price?fsym=${tokenSymbol}&tsyms=USD`
      );
      const data = await response.json();
      if (data.USD) {
        return data.USD;
      } else {
        throw new Error('Precio no encontrado');
      }
    } catch (err) {
      console.error(err);
      setError('No se pudo obtener el precio actual.');
      return null;
    }
  };

  const handleAdd = async () => {
    if (!token || !purchasePrice || !usdAmount || !label) return;
    setLoading(true);
    setError('');
    const currentPrice = await fetchPrice(token.toUpperCase());
    if (currentPrice !== null) {
      // Calculamos tokens comprados
      const tokensBought = parseFloat(usdAmount) / parseFloat(purchasePrice);
      const newEntry = {
        label,
        token: token.toUpperCase(),
        purchasePrice: parseFloat(purchasePrice),
        usdAmount: parseFloat(usdAmount),
        tokensBought,
        currentPrice,
      };
      console.log('Agregando entrada:', newEntry);
      setEntries((prevEntries) => [...prevEntries, newEntry]);
      setLabel('');
      setToken('');
      setPurchasePrice('');
      setUsdAmount('');
    }
    setLoading(false);
  };

  const handleDelete = (index) => {
    setEntries((prevEntries) => {
      const updatedEntries = prevEntries.filter((_, i) => i !== index);
      console.log('Eliminando entrada:', updatedEntries);
      return updatedEntries;
    });
  };

  if (!mounted) return null;

  return (
    <>
      {/* Botón fijo en la esquina inferior izquierda */}
      <button
        className="fixed bottom-4 left-4 bg-yellow-500 hover:bg-yellow-600 text-white p-4 rounded-full shadow-lg transition-transform duration-300 transform hover:scale-110 focus:outline-none z-50"
        onClick={() => setOpen(!open)}
      >
        <FaStickyNote size={24} />
      </button>

      {/* Ventana emergente con animación */}
      {open && (
        <div
          className="fixed bottom-20 left-4 w-80 rounded-lg shadow-2xl p-4 z-50 animate-slide-up-fade-in"
          style={{
            backgroundColor: 'var(--card-bg)',
            color: 'var(--card-text)',
            border: '1px solid var(--card-text)',
          }}
        >
          <h2 className="text-lg font-bold mb-4">Calculadora de Ganancias/Pérdidas</h2>
          <div className="mb-4">
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Etiqueta personalizada"
              className="w-full p-2 rounded mb-2"
              style={{
                backgroundColor: 'var(--card-bg)',
                color: 'var(--card-text)',
                border: '1px solid var(--card-text)',
              }}
            />
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Token (Ej: BTC)"
              className="w-full p-2 rounded mb-2"
              style={{
                backgroundColor: 'var(--card-bg)',
                color: 'var(--card-text)',
                border: '1px solid var(--card-text)',
              }}
            />
            <input
              type="number"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              placeholder="Precio de compra por token"
              className="w-full p-2 rounded mb-2"
              style={{
                backgroundColor: 'var(--card-bg)',
                color: 'var(--card-text)',
                border: '1px solid var(--card-text)',
              }}
            />
            <input
              type="number"
              value={usdAmount}
              onChange={(e) => setUsdAmount(e.target.value)}
              placeholder="Monto invertido en USD"
              className="w-full p-2 rounded"
              style={{
                backgroundColor: 'var(--card-bg)',
                color: 'var(--card-text)',
                border: '1px solid var(--card-text)',
              }}
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            <button
              className="w-full mt-2 bg-blue-500 text-white p-2 rounded transition-transform duration-300 transform hover:scale-105"
              onClick={handleAdd}
              disabled={loading}
            >
              {loading ? 'Agregando...' : 'Agregar'}
            </button>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {entries.length === 0 ? (
              <p className="text-gray-500 text-sm">No hay entradas agregadas.</p>
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
                      <p className="font-semibold">{entry.label}</p>
                      <p className="text-sm">Token: {entry.token}</p>
                      <p className="text-sm">Precio de compra: ${entry.purchasePrice.toFixed(2)} por token</p>
                      <p className="text-sm">Monto invertido: ${entry.usdAmount.toFixed(2)}</p>
                      <p className="text-sm">Precio actual: ${entry.currentPrice.toFixed(2)}</p>
                      <p className="text-sm">Tokens comprados: {entry.tokensBought.toFixed(4)}</p>
                      <p className={`text-sm ${profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {profitLoss >= 0 ? 'Ganancia' : 'Pérdida'}: ${Math.abs(profitLoss).toFixed(2)} ({profitLossPercentage}%)
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
        </div>
      )}
    </>
  );
};

export default ProfitLossCalculator;