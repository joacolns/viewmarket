import { useState } from 'react';
import { FaRobot } from 'react-icons/fa';

const AIAssistant = ({ crypto, price, indicators, change24h }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getAIAnalysis = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('../../backend/api/ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ crypto, price, indicators, change24h })
      });
  
      // Verificar si la respuesta es JSON
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        const rawResponse = await response.text();
        console.error('Respuesta no JSON:', rawResponse);
        throw new Error('Formato de respuesta inválido');
      }
  
      const data = await response.json();
      setAnalysis(data.analysis || data.error);
  
    } catch (error) {
      console.error('Error completo:', error);
      setAnalysis('Error: ' + error.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button 
        onClick={() => {
          setIsOpen(!isOpen);
          if (!analysis) getAIAnalysis();
        }}
        className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-lg transition-all transform hover:scale-110 focus:outline-none"
        >
        <FaRobot />
      </button>

      {isOpen && (
        <div className={`
            absolute bottom-20 right-0 w-80 bg-white rounded-lg shadow-2xl p-4 border border-gray-200
            animate-slide-up-fade-in
          `}>
          <h3 className="text-lg font-bold mb-4">Análisis de {crypto}</h3>
          
          {isLoading ? (
            <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ) : (
            <div className="text-sm space-y-2">
              <p className="animate-fade-in text-gray-700">{analysis}</p>
              <div className="mt-4 text-xs text-gray-400">
                * Análisis generado por IA
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIAssistant;