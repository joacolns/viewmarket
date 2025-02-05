import { useState } from 'react';

const PricePredictionML = ({ chartData, futureDays = 30 }) => {
  const [predictedPrice, setPredictedPrice] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async () => {
    if (!chartData || chartData.length < 20) {
      setPredictedPrice("Not enough data for ARIMA");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/backend/api/arima/arima.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prices: chartData, futureDays }),
      });

      const data = await response.json();
      setPredictedPrice(data.predicted_price ? `$${data.predicted_price.toFixed(2)}` : data.error);
    } catch (error) {
      setPredictedPrice("Error fetching prediction");
    }
    setLoading(false);
  };

  return (
    <div className="fixed bottom-24 right-4 z-[1001]">
      <button 
        onClick={handlePredict}
        className="bg-teal-500 text-white px-4 py-2 rounded-full shadow-lg transition-transform transform hover:scale-105 hover:bg-teal-600"
      >
        ¿Cuál será el precio en {futureDays} días?
      </button>
      {loading && <p className="text-sm mt-2">Cargando predicción...</p>}
      {predictedPrice && (
        <div className="mt-2 text-sm bg-gray-800 text-white p-2 rounded-lg shadow-md">
          <p>Predicción (ARIMA): {predictedPrice}</p>
        </div>
      )}
    </div>
  );
};

export default PricePredictionML;
