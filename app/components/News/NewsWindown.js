import { useState } from 'react';
import { FaNewspaper } from 'react-icons/fa';
import useNews from '../../hooks/useNews';

const NewsWindow = ({ query = 'cryptocurrency' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { news, loading, error } = useNews(query);

  return (
    <div className="fixed bottom-36 right-4 z-50">
      {/* Botón para abrir/cerrar la ventana de noticias */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all transform hover:scale-110 focus:outline-none"
        aria-label="Mostrar noticias"
      >
        <FaNewspaper />
      </button>

      {/* Ventana desplegable de noticias */}
      {isOpen && (
        <div
          className="absolute bottom-20 right-0 w-80 rounded-xl shadow-2xl p-4 border animate-slide-up-fade-in max-h-[60vh] overflow-y-auto"
          style={{
            backgroundColor: 'var(--card-bg)',
            color: 'var(--card-text)',
          }}
        >
          <h3 className="text-lg font-bold mb-4">Últimas Noticias</h3>

          {loading && (
            <p className="animate-pulse text-sm">Cargando noticias...</p>
          )}
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
          {!loading && !error && (
            <ul className="space-y-3">
              {news.slice(0, 5).map((article, index) => (
                <li key={index} className="border-b pb-2 last:border-b-0">
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {article.title}
                  </a>
                  <p className="text-xs text-gray-500">
                    {article.source.name} - {new Date(article.publishedAt).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 text-xs text-gray-400">* Noticias de NewsAPI</div>
        </div>
      )}
    </div>
  );
};

export default NewsWindow;
