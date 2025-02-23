import { useState } from 'react';
import { FaStickyNote } from 'react-icons/fa';

const ProfitLossCalculator = () => {
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Función para obtener el precio actual de la crypto desde la API de CryptoCompare
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
    if (!token || !purchasePrice) return;
    setLoading(true);
    setError('');
    const currentPrice = await fetchPrice(token.toUpperCase());
    if (currentPrice !== null) {
      const newEntry = {
        token: token.toUpperCase(),
        purchasePrice: parseFloat(purchasePrice),
        currentPrice,
      };
      setEntries([...entries, newEntry]);
      setToken('');
      setPurchasePrice('');
    }
    setLoading(false);
  };

  return (
    <>
      {/* Botón amarillo fijo en la esquina inferior izquierda */}
      <button
        className="fixed bottom-4 left-4 bg-yellow-500 hover:bg-yellow-600 text-white p-4 rounded-full shadow-lg transition-transform transform hover:scale-110 focus:outline-none z-50"
        onClick={() => setOpen(!open)}
      >
        <FaStickyNote size={24} />
      </button>

      {/* Ventana emergente */}
      {open && (
        <div className="fixed bottom-20 left-4 w-80 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-2xl p-4 z-50">
          <h2 className="text-lg font-bold mb-4">Calculadora de Ganancias/Pérdidas</h2>
          <div className="mb-4">
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Token (Ej: BTC)"
              className="w-full p-2 border rounded mb-2"
            />
            <input
              type="number"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              placeholder="Precio de compra"
              className="w-full p-2 border rounded"
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            <button
              className="w-full mt-2 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded"
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
                const diff = entry.currentPrice - entry.purchasePrice;
                const diffPercentage = ((diff / entry.purchasePrice) * 100).toFixed(2);
                return (
                  <div key={index} className="p-2 border-b border-gray-200 last:border-0">
                    <p className="font-semibold">{entry.token}</p>
                    <p className="text-sm">Comprado a: ${entry.purchasePrice.toFixed(2)}</p>
                    <p className="text-sm">Precio actual: ${entry.currentPrice.toFixed(2)}</p>
                    <p className={`text-sm ${diff >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {diff >= 0 ? 'Ganancia' : 'Pérdida'}: ${Math.abs(diff).toFixed(2)} ({diffPercentage}%)
                    </p>
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
