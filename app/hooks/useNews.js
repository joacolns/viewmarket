import { useState, useEffect } from 'react';

const useNews = (query = 'cryptocurrency') => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(`/backend/api/news?query=${query}`);
        const data = await response.json();
        if (response.ok) {
          setNews(data);
        } else {
          setError(data.error || 'Error al obtener noticias');
        }
      } catch (err) {
        setError('Error de conexión');
      }
      setLoading(false);
    };

    fetchNews();
  }, [query]);

  return { news, loading, error };
};

export default useNews;
